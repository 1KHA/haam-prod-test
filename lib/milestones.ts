import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { TokenPayload, UserRole } from '@/lib/auth';

export type MilestoneStatus = 'completed' | 'in_progress' | 'upcoming' | 'overdue';

export interface MilestoneDto {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  progress: number;
  priority: string;
  category: string;
  startupId: string;
  startupName: string;
  cohortId: string | null;
  cohortName: string | null;
  createdBy: string;
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneStats {
  total: number;
  completed: number;
  inProgress: number;
  upcoming: number;
  overdue: number;
  averageProgress: number;
}

export interface MilestoneStartupOption {
  id: string;
  name: string;
  cohortId: string | null;
  cohortName: string | null;
}

const milestoneInclude = Prisma.validator<Prisma.MilestoneInclude>()({
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  startup: {
    select: {
      id: true,
      name: true,
      creatorId: true,
      cohortMemberships: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        include: {
          cohort: {
            select: {
              id: true,
              name: true,
              managerId: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

type MilestoneRecord = Prisma.MilestoneGetPayload<{
  include: typeof milestoneInclude;
}>;

function clampProgress(progress: number | null | undefined): number {
  if (typeof progress !== 'number' || Number.isNaN(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(progress)));
}

export function normalizeMilestoneStatus(
  status: string | null | undefined,
  dueDate: Date,
  progress: number
): MilestoneStatus {
  const normalizedProgress = clampProgress(progress);

  if (status === 'completed' || normalizedProgress >= 100) {
    return 'completed';
  }

  if (dueDate.getTime() < Date.now()) {
    return 'overdue';
  }

  if (status === 'in_progress' || normalizedProgress > 0) {
    return 'in_progress';
  }

  return 'upcoming';
}

export function serializeMilestone(milestone: MilestoneRecord): MilestoneDto {
  const normalizedProgress = clampProgress(milestone.progress);
  const status = normalizeMilestoneStatus(milestone.status, milestone.dueDate, normalizedProgress);
  const primaryCohort = milestone.startup.cohortMemberships[0]?.cohort;

  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    dueDate: milestone.dueDate.toISOString(),
    status,
    progress: status === 'completed' ? 100 : normalizedProgress,
    priority: milestone.priority,
    category: milestone.category,
    startupId: milestone.startupId,
    startupName: milestone.startup.name,
    cohortId: primaryCohort?.id ?? null,
    cohortName: primaryCohort?.name ?? null,
    createdBy: milestone.createdBy,
    creatorName: milestone.creator?.name ?? null,
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  };
}

export function buildMilestoneStats(milestones: MilestoneDto[]): MilestoneStats {
  const total = milestones.length;
  const completed = milestones.filter((milestone) => milestone.status === 'completed').length;
  const inProgress = milestones.filter((milestone) => milestone.status === 'in_progress').length;
  const upcoming = milestones.filter((milestone) => milestone.status === 'upcoming').length;
  const overdue = milestones.filter((milestone) => milestone.status === 'overdue').length;
  const averageProgress =
    total > 0
      ? Math.round(
          milestones.reduce((sum, milestone) => sum + clampProgress(milestone.progress), 0) / total
        )
      : 0;

  return {
    total,
    completed,
    inProgress,
    upcoming,
    overdue,
    averageProgress,
  };
}

export function calculateStartupProgress(milestones: MilestoneDto[]): number {
  if (milestones.length === 0) {
    return 0;
  }

  return Math.round(
    milestones.reduce((sum, milestone) => sum + clampProgress(milestone.progress), 0) / milestones.length
  );
}

export function formatRelativeMilestoneDueDate(dueDate: string): string {
  const target = new Date(dueDate).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'متأخرة';
  }

  if (diffDays === 0) {
    return 'اليوم';
  }

  if (diffDays === 1) {
    return 'خلال يوم';
  }

  if (diffDays <= 10) {
    return `خلال ${diffDays} أيام`;
  }

  const weeks = Math.ceil(diffDays / 7);
  return weeks === 1 ? 'خلال أسبوع' : `خلال ${weeks} أسابيع`;
}

export function getUpcomingMilestoneSeverity(dueDate: string, status: MilestoneStatus): 'urgent' | 'upcoming' | 'normal' {
  if (status === 'overdue') {
    return 'urgent';
  }

  const diffDays = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return 'urgent';
  }

  if (diffDays <= 7) {
    return 'upcoming';
  }

  return 'normal';
}

async function getStartupAccessContext(startupId: string, user: TokenPayload) {
  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    select: {
      id: true,
      creatorId: true,
      members: {
        where: {
          userId: user.userId,
          status: 'ACTIVE',
        },
        select: {
          role: true,
        },
        take: 1,
      },
    },
  });

  if (!startup) {
    return {
      startup: null,
      canView: false,
      canManage: false,
    };
  }

  const isOwner = startup.creatorId === user.userId;
  const activeMembership = startup.members[0];
  const isLeader = activeMembership?.role === 'Leader';
  const isAdmin = user.role === UserRole.ADMIN;
  const isProgramManager = user.role === UserRole.PROGRAM_MANAGER;

  return {
    startup,
    canView: isAdmin || isProgramManager || isOwner || Boolean(activeMembership),
    canManage: isAdmin || isProgramManager || isOwner || isLeader,
  };
}

export async function canViewStartupMilestones(startupId: string, user: TokenPayload) {
  return getStartupAccessContext(startupId, user);
}

export async function canManageStartupMilestones(startupId: string, user: TokenPayload) {
  return getStartupAccessContext(startupId, user);
}

export async function listMilestones(where: Prisma.MilestoneWhereInput = {}): Promise<MilestoneDto[]> {
  const milestones = await prisma.milestone.findMany({
    where,
    include: milestoneInclude,
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return milestones.map(serializeMilestone);
}

export async function listMilestoneStartupOptions(where: Prisma.StartupWhereInput = {}): Promise<MilestoneStartupOption[]> {
  const startups = await prisma.startup.findMany({
    where,
    select: {
      id: true,
      name: true,
      cohortMemberships: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        include: {
          cohort: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return startups.map((startup) => ({
    id: startup.id,
    name: startup.name,
    cohortId: startup.cohortMemberships[0]?.cohort.id ?? null,
    cohortName: startup.cohortMemberships[0]?.cohort.name ?? null,
  }));
}

export async function createMilestoneRecord(input: {
  startupId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  createdBy: string;
  progress?: number;
  status?: string;
}) {
  const dueDate = new Date(input.dueDate);
  const progress = clampProgress(input.progress);
  const status = normalizeMilestoneStatus(input.status, dueDate, progress);

  const milestone = await prisma.milestone.create({
    data: {
      startupId: input.startupId,
      title: input.title.trim(),
      description: input.description.trim(),
      dueDate,
      priority: input.priority,
      category: input.category,
      createdBy: input.createdBy,
      progress: status === 'completed' ? 100 : progress,
      status,
    },
    include: milestoneInclude,
  });

  return serializeMilestone(milestone);
}

export async function updateMilestoneRecord(
  milestoneId: string,
  updates: {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    category?: string;
    progress?: number;
    status?: string;
  }
) {
  const existingMilestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });

  if (!existingMilestone) {
    return null;
  }

  const nextDueDate = updates.dueDate ? new Date(updates.dueDate) : existingMilestone.dueDate;
  const nextProgress = clampProgress(
    typeof updates.progress === 'number' ? updates.progress : existingMilestone.progress
  );
  const nextStatus = normalizeMilestoneStatus(
    updates.status ?? existingMilestone.status,
    nextDueDate,
    nextProgress
  );

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
      ...(updates.dueDate !== undefined ? { dueDate: nextDueDate } : {}),
      ...(updates.priority !== undefined ? { priority: updates.priority } : {}),
      ...(updates.category !== undefined ? { category: updates.category } : {}),
      ...(updates.progress !== undefined ? { progress: nextStatus === 'completed' ? 100 : nextProgress } : {}),
      status: nextStatus,
    },
    include: milestoneInclude,
  });

  return serializeMilestone(milestone);
}
