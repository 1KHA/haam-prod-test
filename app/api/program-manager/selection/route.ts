import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET /api/program-manager/selection
// Get all shortlisted applications for selection
export async function GET(req: NextRequest) {
  try {
    const payload = await isAuthenticated(req.headers.get('authorization') || undefined);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "PROGRAM_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Get all startups that have been shortlisted
    const startups = await prisma.startup.findMany({
      where: {
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { industry: { contains: search } },
            { description: { contains: search } }
          ]
        } : {}),
        cohortMemberships: {
          some: {
            status: status || { in: ["SHORTLISTED", "SELECTED", "REJECTED"] }
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true
          }
        },
        cohortMemberships: {
          include: {
            cohort: {
              include: {
                program: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform the data to include selection status and interview details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applications = startups.map((startup: any) => {
      const membership = startup.cohortMemberships[0]; // Get the first membership
      
      // In a real implementation, we would fetch interview details from a separate table
      // For now, we'll simulate this with mock data
      const interviewStatus = membership?.status === "SHORTLISTED" ? "scheduled" : 
                             membership?.status === "SELECTED" ? "completed" : "cancelled";
      
      // Calculate a mock interview date (5 days from now for scheduled interviews)
      const today = new Date();
      const interviewDate = new Date(today);
      interviewDate.setDate(today.getDate() + 5);
      
      // Format the date as YYYY/MM/DD
      const formattedDate = `${interviewDate.getFullYear()}/${String(interviewDate.getMonth() + 1).padStart(2, '0')}/${String(interviewDate.getDate()).padStart(2, '0')}`;
      
      // Random interview time
      const hours = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
      const minutes = Math.random() > 0.5 ? "00" : "30";
      const formattedTime = `${hours}:${minutes} ${hours >= 12 ? 'م' : 'ص'}`;
      
      return {
        id: startup.id,
        companyName: startup.name,
        industry: startup.industry,
        stage: startup.stage,
        description: startup.description,
        problem: startup.problem,
        solution: startup.solution,
        teamSize: startup.teamSize,
        status: membership?.status || "PENDING",
        program: membership?.cohort.program.name || "N/A",
        cohort: membership?.cohort.name || "N/A",
        cohortId: membership?.cohortId || null,
        submissionDate: startup.createdAt,
        founder: startup.creator,
        score: (Math.random() * 2 + 3).toFixed(1), // Random score between 3.0 and 5.0
        interviewStatus,
        interviewDate: formattedDate,
        interviewTime: formattedTime
      };
    });

    // Count applications by status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shortlistedCount = applications.filter((app: any) => app.status === "SHORTLISTED").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedCount = applications.filter((app: any) => app.status === "SELECTED").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rejectedCount = applications.filter((app: any) => app.status === "REJECTED").length;

    return NextResponse.json({
      applications,
      stats: {
        shortlistedCount,
        selectedCount,
        rejectedCount,
        totalCount: applications.length
      }
    });
  } catch (error) {
    console.error("Error fetching selection data:", error);
    return NextResponse.json(
      { error: "Failed to fetch selection data" },
      { status: 500 }
    );
  }
}

// PUT /api/program-manager/selection/:id
// Update selection status and interview details
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = params.id;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, cohortId, interviewDate, interviewTime, notes } = await req.json();

    const payload = await isAuthenticated(req.headers.get('authorization') || undefined);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "PROGRAM_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if the startup exists
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        cohortMemberships: {
          where: { cohortId }
        }
      }
    });

    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    // Update the cohort membership status
    if (startup.cohortMemberships.length > 0) {
      // Update existing membership
      await prisma.cohortMember.update({
        where: {
          id: startup.cohortMemberships[0].id
        },
        data: {
          status
        }
      });
    } else if (cohortId) {
      // Create new membership if cohortId is provided
      await prisma.cohortMember.create({
        data: {
          cohortId,
          startupId,
          status
        }
      });
    }

    // In a real implementation, we would update interview details in a separate table
    // For now, we'll just return the updated startup

    // Return the updated startup with its memberships
    const updatedStartup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true
          }
        },
        cohortMemberships: {
          include: {
            cohort: {
              include: {
                program: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error("Error updating selection:", error);
    return NextResponse.json(
      { error: "Failed to update selection" },
      { status: 500 }
    );
  }
}
