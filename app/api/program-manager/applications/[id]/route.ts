import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// PUT /api/program-manager/applications/[id]
// Update application (CohortMember) status for a startup
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = params.id;
    const { status, cohortId, reviewers, notes } = await req.json();

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
          where: cohortId ? { cohortId } : {}
        }
      }
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (startup.cohortMemberships.length > 0) {
      // Update existing membership
      await prisma.cohortMember.update({
        where: { id: startup.cohortMemberships[0].id },
        data: { status }
      });
    } else if (cohortId) {
      // Create new membership if cohortId is provided
      await prisma.cohortMember.create({
        data: { cohortId, startupId, status }
      });
    }

    const updatedStartup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        creator: { select: { id: true, name: true, email: true, profile: true } },
        cohortMemberships: { include: { cohort: { include: { program: true } } } }
      }
    });

    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
