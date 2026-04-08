import { Prisma } from '@prisma/client';
import { TokenPayload, UserRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type MilestoneStatus = 'completed' | 'in_progress' | 'upcoming' | 'overdue';
export type MilestoneSubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'REOPENED' | 'SUPERSEDED';

export interface MilestoneAttachmentDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneSubmissionDto {
  id: string;
  milestoneId: string;
  startupId: string;
  startupName: string;
  submittedBy: string;
  submitterName: string | null;
  message: string | null;
  status: MilestoneSubmissionStatus;
  submissionNumber: number;
  attachments: MilestoneAttachmentDto[];
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneStartupSubmissionDto {
  startupId: string;
  startupName: string;
  submitted: boolean;
  canSubmit: boolean;
  latestSubmission: MilestoneSubmissionDto | null;
  submissionHistory: MilestoneSubmissionDto[];
}

export interface MilestoneDto {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  progress: number;
  priority: string;
  category: string;
  cohortId: string;
  cohortName: string;
  programName: string | null;
  totalStartups: number;
  submittedStartups: number;
  pendingStartups: number;
  createdBy: string;
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartupMilestoneDto extends MilestoneDto {
  startupId: string;
  startupName: string;
  submissionStatus: MilestoneSubmissionStatus;
  canSubmit: boolean;
  latestSubmission: MilestoneSubmissionDto | null;
}

export interface MilestoneDetailDto extends MilestoneDto {
  startups: MilestoneStartupSubmissionDto[];
}

export interface MilestoneStats {
  total: number;
  completed: number;
  inProgress: number;
  upcoming: number;
  overdue: number;
  averageProgress: number;
}

export interface MilestoneCohortOption {
  id: string;
  name: string;
  programName: string | null;
  managerId: string;
  startupCount: number;
}

export interface MilestoneSubmissionAttachmentInput {
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
}

export class MilestoneError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const submissionInclude = Prisma.validator<Prisma.MilestoneSubmissionInclude>()({
  submitter: {
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
    },
  },
  attachments: {
    orderBy: {
      createdAt: 'asc',
    },
  },
});

const milestoneInclude = Prisma.validator<Prisma.MilestoneInclude>()({
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
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
      members: {
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          startupId: true,
          startup: {
            select: {
              id: true,
              name: true,
              creatorId: true,
              members: {
                where: {
                  status: 'ACTIVE',
                },
                select: {
                  userId: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  },
  submissions: {
    include: submissionInclude,
    orderBy: [
      { submissionNumber: 'desc' },
      { createdAt: 'desc' },
    ],
  },
});

type SubmissionRecord = Prisma.MilestoneSubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

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

function serializeAttachment(
  attachment: SubmissionRecord['attachments'][number]
): MilestoneAttachmentDto {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    fileType: attachment.fileType,
    fileSize: attachment.fileSize,
    createdAt: attachment.createdAt.toISOString(),
    updatedAt: attachment.updatedAt.toISOString(),
  };
}

function serializeSubmission(submission: SubmissionRecord): MilestoneSubmissionDto {
  return {
    id: submission.id,
    milestoneId: submission.milestoneId,
    startupId: submission.startupId,
    startupName: submission.startup.name,
    submittedBy: submission.submittedBy,
    submitterName: submission.submitter?.name ?? null,
    message: submission.message,
    status: submission.status as MilestoneSubmissionStatus,
    submissionNumber: submission.submissionNumber,
    attachments: submission.attachments.map(serializeAttachment),
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  };
}

function getSubmissionHistoryForStartup(
  milestone: MilestoneRecord,
  startupId: string
): MilestoneSubmissionDto[] {
  return milestone.submissions
    .filter((submission) => submission.startupId === startupId)
    .map(serializeSubmission);
}

function getLatestSubmission(
  milestone: MilestoneRecord,
  startupId: string
): MilestoneSubmissionDto | null {
  return getSubmissionHistoryForStartup(milestone, startupId)[0] ?? null;
}

function getSubmissionCounts(milestone: MilestoneRecord) {
  const totalStartups = milestone.cohort.members.length;
  const submittedStartups = milestone.cohort.members.filter((member) => {
    const latestSubmission = getLatestSubmission(milestone, member.startupId);
    return latestSubmission !== null && latestSubmission.status !== 'REOPENED';
  }).length;

  return {
    totalStartups,
    submittedStartups,
    pendingStartups: Math.max(0, totalStartups - submittedStartups),
  };
}

function serializeMilestoneBase(milestone: MilestoneRecord): MilestoneDto {
  const normalizedProgress = clampProgress(milestone.progress);
  const status = normalizeMilestoneStatus(milestone.status, milestone.dueDate, normalizedProgress);
  const counts = getSubmissionCounts(milestone);

  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    dueDate: milestone.dueDate.toISOString(),
    status,
    progress: status === 'completed' ? 100 : normalizedProgress,
    priority: milestone.priority,
    category: milestone.category,
    cohortId: milestone.cohortId,
    cohortName: milestone.cohort.name,
    programName: milestone.cohort.program?.name ?? null,
    totalStartups: counts.totalStartups,
    submittedStartups: counts.submittedStartups,
    pendingStartups: counts.pendingStartups,
    createdBy: milestone.createdBy,
    creatorName: milestone.creator?.name ?? null,
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  };
}

function serializeMilestoneDetail(milestone: MilestoneRecord): MilestoneDetailDto {
  const base = serializeMilestoneBase(milestone);
  const startups = milestone.cohort.members.map((member) => {
    const history = getSubmissionHistoryForStartup(milestone, member.startupId);
    const latestSubmission = history[0] ?? null;

    return {
      startupId: member.startup.id,
      startupName: member.startup.name,
      submitted: latestSubmission !== null && latestSubmission.status !== 'REOPENED',
      canSubmit: latestSubmission === null || latestSubmission.status === 'REOPENED',
      latestSubmission,
      submissionHistory: history,
    };
  });

  return {
    ...base,
    startups,
  };
}

function serializeStartupMilestone(
  milestone: MilestoneRecord,
  startupId: string,
  startupName: string
): StartupMilestoneDto {
  const base = serializeMilestoneBase(milestone);
  const latestSubmission = getLatestSubmission(milestone, startupId);

  return {
    ...base,
    startupId,
    startupName,
    submissionStatus: latestSubmission?.status ?? 'NOT_SUBMITTED',
    canSubmit: latestSubmission === null || latestSubmission.status === 'REOPENED',
    latestSubmission,
  };
}

export function buildMilestoneStats(milestones: Array<MilestoneDto | StartupMilestoneDto>): MilestoneStats {
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

export function calculateMilestoneCoverageProgress(milestones: StartupMilestoneDto[]): number {
  if (milestones.length === 0) {
    return 0;
  }

  const completedSubmissions = milestones.filter(
    (milestone) =>
      milestone.submissionStatus !== 'NOT_SUBMITTED' && milestone.submissionStatus !== 'REOPENED'
  ).length;
  return Math.round((completedSubmissions / milestones.length) * 100);
}

export function calculateStartupProgress(milestones: StartupMilestoneDto[]): number {
  return calculateMilestoneCoverageProgress(milestones);
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

export function getUpcomingMilestoneSeverity(
  dueDate: string,
  status: MilestoneStatus
): 'urgent' | 'upcoming' | 'normal' {
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
      name: true,
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
      cohortMemberships: {
        where: {
          status: 'ACTIVE',
        },
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
  });

  if (!startup) {
    return {
      startup: null,
      cohort: null,
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
    cohort: startup.cohortMemberships[0]?.cohort ?? null,
    canView: isAdmin || isProgramManager || isOwner || Boolean(activeMembership),
    canManage: isAdmin || isProgramManager || isLeader,
  };
}

export async function canViewStartupMilestones(startupId: string, user: TokenPayload) {
  return getStartupAccessContext(startupId, user);
}

export async function canManageCohortMilestones(cohortId: string, user: TokenPayload) {
  if (user.role === UserRole.ADMIN) {
    return { canManage: true };
  }

  if (user.role !== UserRole.PROGRAM_MANAGER) {
    return { canManage: false };
  }

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    select: { id: true, managerId: true },
  });

  return {
    canManage: cohort?.managerId === user.userId,
  };
}

export async function listMilestoneCohorts(managerId?: string): Promise<MilestoneCohortOption[]> {
  const cohorts = await prisma.cohort.findMany({
    where: managerId ? { managerId } : {},
    include: {
      program: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          members: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      },
    },
    orderBy: [
      { name: 'asc' },
    ],
  });

  return cohorts.map((cohort) => ({
    id: cohort.id,
    name: cohort.name,
    programName: cohort.program?.name ?? null,
    managerId: cohort.managerId,
    startupCount: cohort._count.members,
  }));
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

  return milestones.map(serializeMilestoneBase);
}

export async function getMilestoneDetail(id: string): Promise<MilestoneDetailDto | null> {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: milestoneInclude,
  });

  if (!milestone) {
    return null;
  }

  return serializeMilestoneDetail(milestone);
}

export async function listStartupMilestones(startupId: string): Promise<StartupMilestoneDto[]> {
  const startupContext = await prisma.startup.findUnique({
    where: { id: startupId },
    select: {
      id: true,
      name: true,
      cohortMemberships: {
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: {
          cohortId: true,
        },
      },
    },
  });

  if (!startupContext || startupContext.cohortMemberships.length === 0) {
    return [];
  }

  const cohortId = startupContext.cohortMemberships[0].cohortId;
  const milestones = await prisma.milestone.findMany({
    where: { cohortId },
    include: milestoneInclude,
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return milestones.map((milestone) =>
    serializeStartupMilestone(milestone, startupContext.id, startupContext.name)
  );
}

export async function createMilestoneRecord(input: {
  cohortId: string;
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
      cohortId: input.cohortId,
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

  return serializeMilestoneBase(milestone);
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
    cohortId?: string;
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
      ...(updates.cohortId !== undefined ? { cohortId: updates.cohortId } : {}),
      ...(updates.progress !== undefined ? { progress: nextStatus === 'completed' ? 100 : nextProgress } : {}),
      status: nextStatus,
    },
    include: milestoneInclude,
  });

  return serializeMilestoneBase(milestone);
}

export async function getSubmissionHistoryForMilestoneAndStartup(
  milestoneId: string,
  startupId: string
): Promise<MilestoneSubmissionDto[]> {
  const submissions = await prisma.milestoneSubmission.findMany({
    where: {
      milestoneId,
      startupId,
    },
    include: submissionInclude,
    orderBy: [
      { submissionNumber: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return submissions.map(serializeSubmission);
}

export async function createMilestoneSubmission(input: {
  milestoneId: string;
  startupId: string;
  submittedBy: string;
  message?: string | null;
  attachments?: MilestoneSubmissionAttachmentInput[];
}) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: input.milestoneId },
    include: {
      cohort: {
        select: {
          members: {
            where: {
              status: 'ACTIVE',
              startupId: input.startupId,
            },
            select: {
              startupId: true,
            },
          },
        },
      },
    },
  });

  if (!milestone) {
    throw new MilestoneError('Milestone not found', 404);
  }

  if (milestone.cohort.members.length === 0) {
    throw new MilestoneError('Startup is not in this milestone cohort', 403);
  }

  const latestSubmission = await prisma.milestoneSubmission.findFirst({
    where: {
      milestoneId: input.milestoneId,
      startupId: input.startupId,
    },
    orderBy: [
      { submissionNumber: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  if (latestSubmission && latestSubmission.status !== 'REOPENED') {
    throw new MilestoneError('A submission already exists for this startup', 409);
  }

  const nextSubmissionNumber = latestSubmission ? latestSubmission.submissionNumber + 1 : 1;

  const submission = await prisma.$transaction(async (tx) => {
    if (latestSubmission && latestSubmission.status === 'REOPENED') {
      await tx.milestoneSubmission.update({
        where: { id: latestSubmission.id },
        data: { status: 'SUPERSEDED' },
      });
    }

    return tx.milestoneSubmission.create({
      data: {
        milestoneId: input.milestoneId,
        startupId: input.startupId,
        submittedBy: input.submittedBy,
        message: input.message?.trim() || null,
        status: 'SUBMITTED',
        submissionNumber: nextSubmissionNumber,
        attachments: {
          create: (input.attachments || []).map((attachment) => ({
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileType: attachment.fileType ?? null,
            fileSize: attachment.fileSize ?? null,
          })),
        },
      },
      include: submissionInclude,
    });
  });

  return serializeSubmission(submission);
}

export async function updateSubmissionRecord(
  submissionId: string,
  updates: {
    message?: string | null;
  }
) {
  const submission = await prisma.milestoneSubmission.update({
    where: { id: submissionId },
    data: {
      ...(updates.message !== undefined ? { message: updates.message?.trim() || null } : {}),
    },
    include: submissionInclude,
  });

  return serializeSubmission(submission);
}

export async function reopenSubmissionRecord(submissionId: string) {
  const existingSubmission = await prisma.milestoneSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!existingSubmission) {
    throw new MilestoneError('Submission not found', 404);
  }

  if (existingSubmission.status === 'REOPENED') {
    return existingSubmission;
  }

  if (existingSubmission.status === 'SUPERSEDED') {
    throw new MilestoneError('Cannot reopen a superseded submission', 400);
  }

  const submission = await prisma.milestoneSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'REOPENED',
    },
    include: submissionInclude,
  });

  return serializeSubmission(submission);
}
