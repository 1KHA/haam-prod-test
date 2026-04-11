import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, UserRole } from "@/lib/auth";
// Note: PUT handler moved to [id]/route.ts

// GET /api/program-manager/applications
// Get all applications across all cohorts
export async function GET(req: NextRequest) {
  try {
    // Verify token and check if user is a program manager
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "PROGRAM_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Build the query
    let whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }

    // Get all startups that have applied to any cohort
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
          some: whereClause
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

    // Transform the data to include application status
    const applications = startups.map((startup: any) => {
      const membership = startup.cohortMemberships[0]; // Get the first membership
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
        reviewers: [], // This would need to be added to the schema
        score: 0 // This would need to be added to the schema
      };
    });

    // Count applications by status
    const pendingCount = applications.filter((app: any) => app.status === "PENDING").length;
    const inReviewCount = applications.filter((app: any) => app.status === "IN_REVIEW").length;
    const activeCount = applications.filter((app: any) => app.status === "ACTIVE").length;
    const rejectedCount = applications.filter((app: any) => app.status === "REJECTED").length;

    return NextResponse.json({
      applications,
      stats: {
        pendingCount,
        inReviewCount,
        activeCount,
        rejectedCount,
        totalCount: applications.length
      }
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

