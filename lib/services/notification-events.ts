/**
 * Notification Event Helpers
 * 
 * Pre-built notification functions for common events across all dashboards.
 * All functions support bilingual content (AR/EN) and include appropriate action URLs.
 */

import { NotificationService, NotificationPriority } from './notification-service';
import { prisma } from '@/lib/prisma';

// ============================================================================
// MILESTONE NOTIFICATIONS
// ============================================================================

/**
 * Notify Program Manager when entrepreneur submits milestone response
 * Trigger: POST /api/milestones/[id]/responses
 */
export async function notifyMilestoneResponseSubmitted(params: {
  milestoneId: string;
  milestoneTitle: string;
  startupId: string;
  startupName: string;
  submittedBy: string;
  submittedByName: string;
  programManagerId: string;
}) {
  const { milestoneId, milestoneTitle, startupId, startupName, submittedByName, programManagerId } = params;

  console.log(`[notifyMilestoneResponseSubmitted] Called for PM: ${programManagerId}, startupId: ${startupId}`);

  if (!programManagerId) {
    console.log('[notifyMilestoneResponseSubmitted] SKIPPED: No program manager ID');
    return;
  }

  await NotificationService.createNotification({
    title: `رد جديد على المهمة: ${milestoneTitle}`,
    message: `${startupName} قدم رداً على المهمة "${milestoneTitle}" بواسطة ${submittedByName}.`,
    titleEn: `New Response: ${milestoneTitle}`,
    messageEn: `${startupName} has submitted a response for milestone "${milestoneTitle}" by ${submittedByName}.`,
    type: 'milestone',
    priority: 'high',
    recipientIds: [programManagerId],
    actionUrl: `/program-manager-dashboard/milestones?id=${milestoneId}`,
    actionLabel: 'مراجعة الرد',
    actionLabelEn: 'Review Response',
    metadata: { milestoneId, startupId, type: 'milestone_response_submitted' },
  });
}

/**
 * Notify entrepreneur when PM reviews their milestone response
 * Trigger: POST /api/program-manager/milestones/[id]/review
 */
export async function notifyMilestoneResponseReviewed(params: {
  milestoneId: string;
  milestoneTitle: string;
  startupId: string;
  startupName: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  feedback?: string;
  reviewedByName: string;
  entrepreneurIds: string[];
}) {
  const { milestoneTitle, status, feedback, reviewedByName, entrepreneurIds } = params;

  const statusConfig = {
    approved: {
      title: 'تم قبول ردك ✓',
      titleEn: 'Response Approved ✓',
      message: `تم قبول ردك على المهمة "${milestoneTitle}".`,
      messageEn: `Your milestone response has been approved.`,
      priority: 'high' as NotificationPriority,
      actionLabel: 'عرض المهمة',
      actionLabelEn: 'View Milestone',
    },
    rejected: {
      title: 'تم رفض ردك',
      titleEn: 'Response Rejected',
      message: `تم رفض ردك على المهمة "${milestoneTitle}". ${feedback || ''}`,
      messageEn: `Your response was rejected. ${feedback || ''}`,
      priority: 'high' as NotificationPriority,
      actionLabel: 'عرض التفاصيل',
      actionLabelEn: 'View Details',
    },
    needs_revision: {
      title: 'يحتاج إلى تعديل',
      titleEn: 'Revision Needed',
      message: `يحتاج ردك على المهمة "${milestoneTitle}" إلى تعديل. ${feedback || ''}`,
      messageEn: `Your response needs revision. ${feedback || ''}`,
      priority: 'medium' as NotificationPriority,
      actionLabel: 'تعديل الرد',
      actionLabelEn: 'Edit Response',
    },
  };

  const config = statusConfig[status];

  await NotificationService.createNotification({
    title: config.title,
    message: config.message,
    titleEn: config.titleEn,
    messageEn: config.messageEn,
    type: 'milestone',
    priority: config.priority,
    recipientIds: entrepreneurIds,
    actionUrl: `/entrepreneur-dashboard/milestones?id=${params.milestoneId}`,
    actionLabel: config.actionLabel,
    actionLabelEn: config.actionLabelEn,
    metadata: { milestoneId: params.milestoneId, status, type: 'milestone_response_reviewed' },
  });
}

/**
 * Notify entrepreneurs when a new milestone is assigned
 * Trigger: POST /api/program-manager/milestones
 */
export async function notifyMilestoneCreated(params: {
  milestoneId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: string;
  startupId: string;
  startupName: string;
  recipientIds: string[];
}) {
  const { milestoneId, title, dueDate, priority, startupName, recipientIds } = params;

  const priorityLabel = priority === 'high' ? 'عالية' : priority === 'medium' ? 'متوسطة' : 'منخفضة';
  const priorityLabelEn = priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low';
  
  const dueDateText = dueDate 
    ? `موعد التسليم: ${new Date(dueDate).toLocaleDateString('ar-SA')}`
    : '';
  const dueDateTextEn = dueDate
    ? `Due: ${new Date(dueDate).toLocaleDateString('en-US')}`
    : '';

  await NotificationService.createNotification({
    title: `مهمة جديدة: ${title}`,
    message: `تم تكليفك بمهمة جديدة في ${startupName}. الأولوية: ${priorityLabel}. ${dueDateText}`,
    titleEn: `New Milestone: ${title}`,
    messageEn: `You have been assigned a new milestone for ${startupName}. Priority: ${priorityLabelEn}. ${dueDateTextEn}`,
    type: 'milestone',
    priority: priority as NotificationPriority,
    recipientIds,
    actionUrl: `/entrepreneur-dashboard/milestones?id=${milestoneId}`,
    actionLabel: 'عرض المهمة',
    actionLabelEn: 'View Milestone',
    metadata: { milestoneId, startupId: params.startupId, type: 'milestone_created' },
  });
}

/**
 * Notify entrepreneurs about upcoming milestone deadline
 * Trigger: Cron job (7 days, 24 hours before)
 */
export async function notifyMilestoneDueSoon(params: {
  milestoneId: string;
  title: string;
  startupId: string;
  daysUntil: number;
  recipientIds: string[];
}) {
  const { milestoneId, title, daysUntil, recipientIds } = params;
  
  const isOverdue = daysUntil < 0;
  const daysText = isOverdue 
    ? `متأخرة بـ ${Math.abs(daysUntil)} يوم`
    : daysUntil === 0
    ? 'تستحق اليوم'
    : daysUntil === 1
    ? 'تستحق غداً'
    : `تستحق خلال ${daysUntil} أيام`;
  
  const daysTextEn = isOverdue
    ? `Overdue by ${Math.abs(daysUntil)} day(s)`
    : daysUntil === 0
    ? 'Due today'
    : daysUntil === 1
    ? 'Due tomorrow'
    : `Due in ${daysUntil} days`;

  await NotificationService.createNotification({
    title: isOverdue ? 'تذكير: مهمة متأخرة!' : `تذكير: ${title}`,
    message: `المهمة "${title}" ${daysText}.`,
    titleEn: isOverdue ? 'Reminder: Overdue Milestone!' : `Reminder: ${title}`,
    messageEn: `The milestone "${title}" is ${daysTextEn}.`,
    type: 'reminder',
    priority: isOverdue || daysUntil <= 1 ? 'high' : 'medium',
    recipientIds,
    actionUrl: `/entrepreneur-dashboard/milestones?id=${milestoneId}`,
    actionLabel: 'عرض المهمة',
    actionLabelEn: 'View Milestone',
    metadata: { milestoneId, daysUntil, type: 'milestone_due_soon' },
  });
}

// ============================================================================
// APPLICATION NOTIFICATIONS
// ============================================================================

/**
 * Notify entrepreneur when application status changes
 * Trigger: PUT /api/program-manager/cohorts/[id]/applications
 */
export async function notifyApplicationStatusChanged(params: {
  applicationId: string;
  startupId: string;
  startupName: string;
  cohortId: string;
  cohortName: string;
  oldStatus: string;
  newStatus: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WAITLISTED';
  feedback?: string;
  entrepreneurIds: string[];
}) {
  const { newStatus, cohortName, feedback, entrepreneurIds } = params;

  const statusConfig = {
    ACCEPTED: {
      title: 'تهانينا! تم قبول طلبك 🎉',
      titleEn: 'Congratulations! Application Accepted 🎉',
      message: `تم قبول طلبك للانضمام إلى ${cohortName}. مرحباً بك!`,
      messageEn: `Your application to join ${cohortName} has been accepted. Welcome!`,
      priority: 'high' as NotificationPriority,
      actionLabel: 'عرض الدفعة',
      actionLabelEn: 'View Cohort',
    },
    REJECTED: {
      title: 'تحديث حول طلبك',
      titleEn: 'Application Update',
      message: `لم يتم قبول طلبك للانضمام إلى ${cohortName} هذه المرة. ${feedback || ''}`,
      messageEn: `Your application to join ${cohortName} was not accepted this time. ${feedback || ''}`,
      priority: 'high' as NotificationPriority,
      actionLabel: 'عرض التفاصيل',
      actionLabelEn: 'View Details',
    },
    UNDER_REVIEW: {
      title: 'طلبك قيد المراجعة',
      titleEn: 'Application Under Review',
      message: `طلبك للانضمام إلى ${cohortName} قيد المراجعة.`,
      messageEn: `Your application to join ${cohortName} is under review.`,
      priority: 'medium' as NotificationPriority,
      actionLabel: 'عرض الحالة',
      actionLabelEn: 'View Status',
    },
    PENDING: {
      title: 'تم استلام طلبك',
      titleEn: 'Application Received',
      message: `تم استلام طلبك للانضمام إلى ${cohortName}.`,
      messageEn: `Your application to join ${cohortName} has been received.`,
      priority: 'low' as NotificationPriority,
      actionLabel: 'عرض الطلب',
      actionLabelEn: 'View Application',
    },
    WAITLISTED: {
      title: 'طلبك في قائمة الانتظار',
      titleEn: 'Application Waitlisted',
      message: `طلبك للانضمام إلى ${cohortName} في قائمة الانتظار.`,
      messageEn: `Your application to join ${cohortName} has been waitlisted.`,
      priority: 'medium' as NotificationPriority,
      actionLabel: 'عرض الحالة',
      actionLabelEn: 'View Status',
    },
  };

  const config = statusConfig[newStatus];

  await NotificationService.createNotification({
    title: config.title,
    message: config.message,
    titleEn: config.titleEn,
    messageEn: config.messageEn,
    type: 'application',
    priority: config.priority,
    recipientIds: entrepreneurIds,
    actionUrl: `/entrepreneur-dashboard/applications?id=${params.applicationId}`,
    actionLabel: config.actionLabel,
    actionLabelEn: config.actionLabelEn,
    metadata: { applicationId: params.applicationId, status: newStatus, type: 'application_status_changed' },
  });
}

// ============================================================================
// USER MANAGEMENT NOTIFICATIONS
// ============================================================================

/**
 * Notify new user when account is created
 * Trigger: POST /api/admin/users
 */
export async function notifyUserCreated(params: {
  userId: string;
  email: string;
  name: string;
  role: string;
  tempPassword?: string;
  createdBy?: string;
}) {
  const { name, role, tempPassword, createdBy } = params;
  
  const roleLabel = getRoleLabelAr(role);
  const roleLabelEn = getRoleLabelEn(role);

  let message = `مرحباً ${name}! تم إنشاء حسابك كـ ${roleLabel}. يمكنك الآن تسجيل الدخول.`;
  let messageEn = `Welcome ${name}! Your account has been created as ${roleLabelEn}. You can now log in.`;

  if (tempPassword) {
    message += ` كلمة المرور المؤقتة: ${tempPassword}`;
    messageEn += ` Temporary password: ${tempPassword}`;
  }

  await NotificationService.createNotification({
    title: 'مرحباً بك في المنصة!',
    message,
    titleEn: 'Welcome to the Platform!',
    messageEn,
    type: 'system',
    priority: 'high',
    recipientIds: [params.userId],
    actionUrl: '/dashboard',
    actionLabel: 'الذهاب للوحة التحكم',
    actionLabelEn: 'Go to Dashboard',
    createdBy,
    metadata: { userId: params.userId, role, type: 'user_created' },
  });
}

/**
 * Notify user when their role changes
 * Trigger: PUT /api/admin/users (when role changes)
 */
export async function notifyUserRoleChanged(params: {
  userId: string;
  name: string;
  oldRole: string;
  newRole: string;
  changedBy?: string;
}) {
  const { name, oldRole, newRole, changedBy } = params;

  await NotificationService.createNotification({
    title: 'تم تحديث صلاحياتك',
    message: `مرحباً ${name}، تم تغيير دورك من ${getRoleLabelAr(oldRole)} إلى ${getRoleLabelAr(newRole)}.`,
    titleEn: 'Your Role Has Been Updated',
    messageEn: `Hello ${name}, your role has been changed from ${getRoleLabelEn(oldRole)} to ${getRoleLabelEn(newRole)}.`,
    type: 'system',
    priority: 'high',
    recipientIds: [params.userId],
    actionUrl: '/dashboard',
    actionLabel: 'عرض لوحة التحكم',
    actionLabelEn: 'View Dashboard',
    createdBy: changedBy,
    metadata: { userId: params.userId, oldRole, newRole, type: 'user_role_changed' },
  });
}

/**
 * Notify user when account is approved
 * Trigger: When admin approves PENDING_APPROVAL account
 */
export async function notifyAccountApproved(params: {
  userId: string;
  name: string;
  approvedBy?: string;
}) {
  const { name, approvedBy } = params;

  await NotificationService.createNotification({
    title: 'تم الموافقة على حسابك! 🎉',
    message: `مرحباً ${name}، تمت الموافقة على حسابك. يمكنك الآن تسجيل الدخول واستخدام المنصة.`,
    titleEn: 'Your Account Has Been Approved! 🎉',
    messageEn: `Hello ${name}, your account has been approved. You can now log in and use the platform.`,
    type: 'system',
    priority: 'high',
    recipientIds: [params.userId],
    actionUrl: '/signin',
    actionLabel: 'تسجيل الدخول',
    actionLabelEn: 'Sign In',
    createdBy: approvedBy,
    metadata: { userId: params.userId, type: 'account_approved' },
  });
}

/**
 * Notify user when account is suspended
 * Trigger: When admin suspends account
 */
export async function notifyAccountSuspended(params: {
  userId: string;
  name: string;
  reason?: string;
  suspendedBy?: string;
}) {
  const { name, reason, suspendedBy } = params;

  let message = `مرحباً ${name}، تم تعليق حسابك.`;
  let messageEn = `Hello ${name}, your account has been suspended.`;

  if (reason) {
    message += ` السبب: ${reason}`;
    messageEn += ` Reason: ${reason}`;
  }

  await NotificationService.createNotification({
    title: 'تم تعليق حسابك',
    message,
    titleEn: 'Account Suspended',
    messageEn,
    type: 'security',
    priority: 'high',
    recipientIds: [params.userId],
    createdBy: suspendedBy,
    metadata: { userId: params.userId, reason, type: 'account_suspended' },
  });
}

// ============================================================================
// TEAM NOTIFICATIONS
// ============================================================================

/**
 * Notify invitee when team invitation is sent
 * Trigger: POST /api/team/invitations
 */
export async function notifyTeamInvitationSent(params: {
  invitationId: string;
  startupName: string;
  invitedByName: string;
  inviteeEmail: string;
  inviteeId?: string;
  role: string;
}) {
  const { startupName, invitedByName, inviteeId, role } = params;

  if (!inviteeId) return; // Only notify if invitee is a registered user

  await NotificationService.createNotification({
    title: `دعوة للانضمام إلى ${startupName}`,
    message: `دعاك ${invitedByName} للانضمام إلى فريق ${startupName} كـ ${getRoleLabelAr(role)}.`,
    titleEn: `Invitation to Join ${startupName}`,
    messageEn: `${invitedByName} invited you to join ${startupName} team as ${getRoleLabelEn(role)}.`,
    type: 'team',
    priority: 'high',
    recipientIds: [inviteeId],
    actionUrl: `/entrepreneur-dashboard/team/invitations?id=${params.invitationId}`,
    actionLabel: 'عرض الدعوة',
    actionLabelEn: 'View Invitation',
    metadata: { invitationId: params.invitationId, startupName, type: 'team_invitation_sent' },
  });
}

/**
 * Notify founder when team member account is created
 * Trigger: When new team member account is created
 */
export async function notifyTeamMemberAccountCreated(params: {
  memberId: string;
  memberName: string;
  memberEmail: string;
  startupId: string;
  startupName: string;
  founderId: string;
}) {
  const { memberName, startupName, founderId } = params;

  await NotificationService.createNotification({
    title: 'تم إنشاء حساب لفريقك',
    message: `تم إنشاء حساب لـ ${memberName} للانضمام إلى ${startupName}. بانتظار موافقة المشرف.`,
    titleEn: 'Team Member Account Created',
    messageEn: `An account has been created for ${memberName} to join ${startupName}. Pending admin approval.`,
    type: 'team',
    priority: 'medium',
    recipientIds: [founderId],
    actionUrl: `/entrepreneur-dashboard/team`,
    actionLabel: 'عرض الفريق',
    actionLabelEn: 'View Team',
    metadata: { memberId: params.memberId, startupId: params.startupId, type: 'team_member_account_created' },
  });
}

// ============================================================================
// EVENT NOTIFICATIONS
// ============================================================================

/**
 * Notify users when new event is created
 * Trigger: POST /api/admin/events, POST /api/program-manager/events
 */
export async function notifyEventCreated(params: {
  eventId: string;
  eventName: string;
  eventDate: Date;
  organizerName: string;
  recipientIds: string[];
}) {
  const { eventName, eventDate, organizerName, recipientIds } = params;

  await NotificationService.createNotification({
    title: `فعالية جديدة: ${eventName}`,
    message: `تم إنشاء فعالية "${eventName}" بواسطة ${organizerName}. التاريخ: ${new Date(eventDate).toLocaleDateString('ar-SA')}.`,
    titleEn: `New Event: ${eventName}`,
    messageEn: `Event "${eventName}" has been created by ${organizerName}. Date: ${new Date(eventDate).toLocaleDateString('en-US')}.`,
    type: 'event',
    priority: 'medium',
    recipientIds,
    actionUrl: `/events/${params.eventId}`,
    actionLabel: 'عرض الفعالية',
    actionLabelEn: 'View Event',
    metadata: { eventId: params.eventId, type: 'event_created' },
  });
}

/**
 * Notify users when event is cancelled
 * Trigger: DELETE /api/admin/events/[id], event status update
 */
export async function notifyEventCancelled(params: {
  eventId: string;
  eventName: string;
  recipientIds: string[];
  reason?: string;
  cancelledBy?: string;
}) {
  const { eventName, recipientIds, reason, cancelledBy } = params;

  let message = `تم إلغاء الفعالية "${eventName}".`;
  let messageEn = `The event "${eventName}" has been cancelled.`;

  if (reason) {
    message += ` السبب: ${reason}`;
    messageEn += ` Reason: ${reason}`;
  }

  await NotificationService.createNotification({
    title: 'تم إلغاء فعالية',
    message,
    titleEn: 'Event Cancelled',
    messageEn,
    type: 'event',
    priority: 'high',
    recipientIds,
    createdBy: cancelledBy,
    metadata: { eventId: params.eventId, reason, type: 'event_cancelled' },
  });
}

/**
 * Notify user when event registration status changes
 * Trigger: PM confirms/cancels registration
 */
export async function notifyEventRegistrationStatusChanged(params: {
  registrationId: string;
  eventName: string;
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  userId: string;
  changedBy?: string;
}) {
  const { eventName, status, userId, changedBy } = params;

  const statusConfig = {
    confirmed: {
      title: 'تم تأكيد تسجيلك 🎉',
      titleEn: 'Registration Confirmed 🎉',
      message: `تم تأكيد تسجيلك في "${eventName}".`,
      messageEn: `Your registration for "${eventName}" has been confirmed.`,
      priority: 'high' as NotificationPriority,
    },
    cancelled: {
      title: 'تم إلغاء تسجيلك',
      titleEn: 'Registration Cancelled',
      message: `تم إلغاء تسجيلك في "${eventName}".`,
      messageEn: `Your registration for "${eventName}" has been cancelled.`,
      priority: 'medium' as NotificationPriority,
    },
    waitlisted: {
      title: 'تسجيلك في قائمة الانتظار',
      titleEn: 'Registration Waitlisted',
      message: `تسجيلك في "${eventName}" في قائمة الانتظار.`,
      messageEn: `Your registration for "${eventName}" has been waitlisted.`,
      priority: 'medium' as NotificationPriority,
    },
  };

  const config = statusConfig[status];

  await NotificationService.createNotification({
    title: config.title,
    message: config.message,
    titleEn: config.titleEn,
    messageEn: config.messageEn,
    type: 'event',
    priority: config.priority,
    recipientIds: [userId],
    createdBy: changedBy,
    metadata: { registrationId: params.registrationId, status, type: 'event_registration_status_changed' },
  });
}

/**
 * Notify user before event starts
 * Trigger: Cron job (24h, 1h before)
 */
export async function notifyEventReminder(params: {
  eventId: string;
  eventName: string;
  eventDate: Date;
  hoursBefore: number;
  recipientIds: string[];
}) {
  const { eventName, eventDate, hoursBefore, recipientIds } = params;

  const timeText = hoursBefore === 24 
    ? 'غداً' 
    : hoursBefore === 1 
    ? 'بعد ساعة' 
    : `بعد ${hoursBefore} ساعة`;
  
  const timeTextEn = hoursBefore === 24
    ? 'tomorrow'
    : hoursBefore === 1
    ? 'in 1 hour'
    : `in ${hoursBefore} hours`;

  await NotificationService.createNotification({
    title: `تذكير: ${eventName}`,
    message: `فعالية "${eventName}" ${timeText} (${new Date(eventDate).toLocaleString('ar-SA')}).`,
    titleEn: `Reminder: ${eventName}`,
    messageEn: `Event "${eventName}" is ${timeTextEn} (${new Date(eventDate).toLocaleString('en-US')}).`,
    type: 'reminder',
    priority: hoursBefore <= 1 ? 'high' : 'medium',
    recipientIds,
    actionUrl: `/events/${params.eventId}`,
    actionLabel: 'عرض الفعالية',
    actionLabelEn: 'View Event',
    metadata: { eventId: params.eventId, hoursBefore, type: 'event_reminder' },
  });
}

// ============================================================================
// PROGRAM NOTIFICATIONS
// ============================================================================

/**
 * Notify PMs when new program is created
 * Trigger: POST /api/admin/programs
 */
export async function notifyProgramCreated(params: {
  programId: string;
  programName: string;
  programType: string;
  recipientIds: string[];
  createdBy?: string;
}) {
  const { programName, programType, recipientIds, createdBy } = params;

  await NotificationService.createNotification({
    title: `برنامج جديد: ${programName}`,
    message: `تم إنشاء برنامج جديد "${programName}" من نوع ${programType}.`,
    titleEn: `New Program: ${programName}`,
    messageEn: `A new program "${programName}" of type ${programType} has been created.`,
    type: 'system',
    priority: 'medium',
    recipientIds,
    actionUrl: `/program-manager-dashboard/programs?id=${params.programId}`,
    actionLabel: 'عرض البرنامج',
    actionLabelEn: 'View Program',
    createdBy: createdBy,
    metadata: { programId: params.programId, type: 'program_created' },
  });
}

// ============================================================================
// ADMIN NOTIFICATIONS
// ============================================================================

/**
 * Notify admins when a new user registers
 * Trigger: POST /api/auth/signup
 */
export async function notifyNewUserRegistered(params: {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  adminIds: string[];
}) {
  const { userId, userName, userEmail, userRole, adminIds } = params;

  if (adminIds.length === 0) return;

  const roleLabel = getRoleLabelAr(userRole);
  const roleLabelEn = getRoleLabelEn(userRole);

  await NotificationService.createNotification({
    title: 'مستخدم جديد مسجل 📝',
    message: `${userName} (${userEmail}) سجل كـ ${roleLabel}. يتطلب مراجعة وموافقة.`,
    titleEn: 'New User Registered 📝',
    messageEn: `${userName} (${userEmail}) registered as ${roleLabelEn}. Requires review and approval.`,
    type: 'system',
    priority: 'high',
    recipientIds: adminIds,
    actionUrl: `/admin-dashboard/users?id=${userId}`,
    actionLabel: 'مراجعة المستخدم',
    actionLabelEn: 'Review User',
    metadata: { userId, userEmail, userRole, type: 'new_user_registered' },
  });
}

// ============================================================================
// STARTUP NOTIFICATIONS
// ============================================================================

/**
 * Notify Program Managers when a new startup is created
 * Trigger: POST /api/startups/create
 */
export async function notifyStartupCreated(params: {
  startupId: string;
  startupName: string;
  startupDescription?: string;
  founderId: string;
  founderName: string;
  programManagerIds: string[];
}) {
  const { startupId, startupName, founderId, founderName, programManagerIds } = params;

  console.log(`[notifyStartupCreated] Called with ${programManagerIds.length} PMs, founderId: ${founderId}`);

  if (programManagerIds.length === 0) {
    console.log('[notifyStartupCreated] SKIPPED: No program managers to notify');
    return;
  }

  await NotificationService.createNotification({
    title: `شركة ناشئة جديدة: ${startupName}`,
    message: `${founderName} أنشأ شركة ناشئة جديدة "${startupName}". تحتاج إلى مراجعة.`,
    titleEn: `New Startup: ${startupName}`,
    messageEn: `${founderName} created a new startup "${startupName}". Requires review.`,
    type: 'system',
    priority: 'medium',
    recipientIds: programManagerIds,
    actionUrl: `/program-manager-dashboard/startups/${startupId}`,
    actionLabel: 'مراجعة الشركة',
    actionLabelEn: 'Review Startup',
    metadata: { startupId, founderId, type: 'startup_created' },
  });
}

// ============================================================================
// APPLICATION NOTIFICATIONS
// ============================================================================

/**
 * Notify Program Managers when a new application is submitted
 * Trigger: POST /api/cohorts/apply
 */
export async function notifyApplicationSubmitted(params: {
  applicationId: string;
  startupId: string;
  startupName: string;
  cohortId: string;
  cohortName: string;
  applicantId: string;
  applicantName: string;
  programManagerIds: string[];
}) {
  const { applicationId, startupId, cohortId, startupName, cohortName, applicantName, programManagerIds } = params;

  console.log(`[notifyApplicationSubmitted] Called with ${programManagerIds.length} PMs, appId: ${applicationId}`);

  if (programManagerIds.length === 0) {
    console.log('[notifyApplicationSubmitted] SKIPPED: No program managers to notify');
    return;
  }

  await NotificationService.createNotification({
    title: 'طلب انضمام جديد 📨',
    message: `${applicantName} من ${startupName} تقدم بطلب للانضمام إلى ${cohortName}.`,
    titleEn: 'New Application Submitted 📨',
    messageEn: `${applicantName} from ${startupName} applied to join ${cohortName}.`,
    type: 'application',
    priority: 'high',
    recipientIds: programManagerIds,
    actionUrl: `/program-manager-dashboard/cohorts/${cohortId}/applications`,
    actionLabel: 'مراجعة الطلب',
    actionLabelEn: 'Review Application',
    metadata: { applicationId, startupId, cohortId, type: 'application_submitted' },
  });
}

// ============================================================================
// EVENT REGISTRATION NOTIFICATIONS
// ============================================================================

/**
 * Notify event organizers when someone registers
 * Trigger: POST /api/events/[id]/register
 */
export async function notifyEventRegistration(params: {
  registrationId: string;
  eventId: string;
  eventName: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizerIds: string[];
}) {
  const { eventName, userName, userEmail, organizerIds } = params;

  console.log(`[notifyEventRegistration] Called with ${organizerIds.length} organizers`);

  if (organizerIds.length === 0) {
    console.log('[notifyEventRegistration] SKIPPED: No organizers to notify');
    return;
  }

  await NotificationService.createNotification({
    title: `تسجيل جديد: ${eventName}`,
    message: `${userName} (${userEmail}) سجل في الفعالية "${eventName}".`,
    titleEn: `New Registration: ${eventName}`,
    messageEn: `${userName} (${userEmail}) registered for "${eventName}".`,
    type: 'event',
    priority: 'medium',
    recipientIds: organizerIds,
    actionUrl: `/admin-dashboard/events/${params.eventId}/registrations`,
    actionLabel: 'عرض المسجلين',
    actionLabelEn: 'View Registrations',
    metadata: { registrationId: params.registrationId, eventId: params.eventId, userId: params.userId, type: 'event_registration' },
  });
}

// ============================================================================
// USER MANAGEMENT NOTIFICATIONS (TASK-01, TASK-02, TASK-03, TASK-04)
// ============================================================================

/**
 * Notify user and admin about multiple failed login attempts (TASK-02)
 * Trigger: 3+ consecutive failed login attempts
 */
export async function notifyLoginFailed(params: {
  userId: string;
  email: string;
  attemptCount: number;
  ipAddress: string;
  timestamp: Date;
}) {
  const { userId, email, attemptCount, ipAddress, timestamp } = params;

  console.log(`[notifyLoginFailed] Notifying about ${attemptCount} failed attempts for ${email}`);

  // 1. Notify user
  await NotificationService.createNotification({
    title: 'محاولات تسجيل دخول غير ناجحة',
    message: `تم رصد ${attemptCount} محاولات تسجيل دخول غير ناجحة لحسابك. إذا لم تكن أنت، يرجى تغيير كلمة المرور فوراً.`,
    titleEn: 'Failed Login Attempts Detected',
    messageEn: `${attemptCount} failed login attempts were detected for your account. If this wasn't you, please change your password immediately.`,
    type: 'security',
    priority: 'high',
    recipientIds: [userId],
    actionUrl: '/settings/security',
    actionLabel: 'مراجعة الأمان',
    actionLabelEn: 'Review Security',
    metadata: { 
      type: 'login_failed', 
      attemptCount,
      ipAddress,
      timestamp: timestamp.toISOString()
    },
  });

  // 2. Notify admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  });

  if (admins.length > 0) {
    await NotificationService.createNotification({
      title: 'تنبيه أمان: محاولات تسجيل دخول متعددة',
      message: `المستخدم ${email} حاول تسجيل الدخول ${attemptCount} مرات. IP: ${ipAddress}`,
      titleEn: 'Security Alert: Multiple Login Attempts',
      messageEn: `User ${email} attempted to login ${attemptCount} times. IP: ${ipAddress}`,
      type: 'security',
      priority: 'high',
      recipientIds: admins.map(a => a.id),
      actionUrl: `/admin-dashboard/users?id=${userId}`,
      actionLabel: 'مراجعة المستخدم',
      actionLabelEn: 'Review User',
      metadata: { 
        type: 'login_failed_admin_alert', 
        userId,
        email,
        attemptCount,
        ipAddress
      },
    });
  }

  console.log(`[notifyLoginFailed] Notifications sent to user and ${admins.length} admins`);
}

/**
 * Notify user when their password is changed (TASK-01)
 * Trigger: User updates password via admin or profile settings
 */
export async function notifyPasswordChanged(params: {
  userId: string;
  changedAt: Date;
  changedByName: string;
  ipAddress?: string;
}) {
  const { userId, changedAt, changedByName, ipAddress } = params;

  console.log(`[notifyPasswordChanged] Notifying user ${userId}`);

  await NotificationService.createNotification({
    title: 'تم تغيير كلمة المرور',
    message: `تم تغيير كلمة المرور الخاصة بك بواسطة ${changedByName}. إذا لم تكن أنت من قام بهذا الإجراء، يرجى التواصل مع الدعم فوراً.`,
    titleEn: 'Password Changed',
    messageEn: `Your password has been changed by ${changedByName}. If you did not make this change, please contact support immediately.`,
    type: 'security',
    priority: 'high',
    recipientIds: [userId],
    actionUrl: '/settings/security',
    actionLabel: 'مراجعة الأمان',
    actionLabelEn: 'Review Security',
    metadata: { 
      type: 'password_changed', 
      changedAt: changedAt.toISOString(),
      ipAddress: ipAddress || 'unknown'
    },
  });

  console.log(`[notifyPasswordChanged] Notification sent to user ${userId}`);
}

/**
 * Notify user when their profile is updated (TASK-03)
 * Trigger: Admin updates user profile
 */
export async function notifyUserUpdated(params: {
  userId: string;
  changedFields: string[];
  updatedByName: string;
}) {
  const { userId, changedFields, updatedByName } = params;

  console.log(`[notifyUserUpdated] Notifying user ${userId} about profile update`);

  const fieldLabelsAr: Record<string, string> = {
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    role: 'الدور الوظيفي',
    approvalStatus: 'حالة الحساب',
    specialization: 'التخصص',
  };

  const changedLabelsAr = changedFields
    .map(f => fieldLabelsAr[f] || f)
    .join('، ');

  await NotificationService.createNotification({
    title: 'تم تحديث ملفك الشخصي',
    message: `تم تحديث ${changedLabelsAr} في ملفك الشخصي بواسطة ${updatedByName}.`,
    titleEn: 'Your Profile Has Been Updated',
    messageEn: `Your profile has been updated by ${updatedByName}. Changed fields: ${changedFields.join(', ')}.`,
    type: 'system',
    priority: 'medium',
    recipientIds: [userId],
    actionUrl: '/settings/profile',
    actionLabel: 'عرض الملف',
    actionLabelEn: 'View Profile',
    metadata: { 
      changedFields,
      updatedBy: updatedByName,
      type: 'user_updated'
    },
  });

  console.log(`[notifyUserUpdated] Notification sent`);
}

/**
 * Notify admin team when a user is deleted (TASK-04)
 * Trigger: Admin deletes user account
 */
export async function notifyUserDeleted(params: {
  deletedUserId: string;
  deletedUserName: string;
  deletedUserEmail: string;
  deletedByName: string;
  adminIds: string[];
}) {
  const { deletedUserId, deletedUserName, deletedUserEmail, deletedByName, adminIds } = params;

  console.log(`[notifyUserDeleted] Notifying ${adminIds.length} admins about deletion of ${deletedUserName}`);

  if (!adminIds || adminIds.length === 0) {
    console.log(`[notifyUserDeleted] No admins to notify`);
    return;
  }

  await NotificationService.createNotification({
    title: 'تم حذف مستخدم',
    message: `تم حذف حساب المستخدم ${deletedUserName} (${deletedUserEmail}) بواسطة ${deletedByName}.`,
    titleEn: 'User Account Deleted',
    messageEn: `User account ${deletedUserName} (${deletedUserEmail}) has been deleted by ${deletedByName}.`,
    type: 'system',
    priority: 'medium',
    recipientIds: adminIds,
    actionUrl: '/admin-dashboard/users',
    actionLabel: 'عرض المستخدمين',
    actionLabelEn: 'View Users',
    metadata: { 
      deletedUserId,
      deletedUserEmail,
      deletedBy: deletedByName,
      type: 'user_deleted'
    },
  });

  console.log(`[notifyUserDeleted] Notification sent to ${adminIds.length} admins`);
}

// ============================================================================
// COHORT NOTIFICATIONS (TASK-05, TASK-06)
// ============================================================================

/**
 * Notify startup team when added to cohort (TASK-05)
 * Trigger: Application accepted and startup joins cohort
 */
export async function notifyCohortMemberAdded(params: {
  cohortId: string;
  cohortName: string;
  programId: string;
  programName: string;
  startupId: string;
  startupName: string;
  entrepreneurIds: string[];
  programManagerId: string;
}) {
  const { 
    cohortId, 
    cohortName, 
    programName,
    startupName, 
    entrepreneurIds, 
    programManagerId 
  } = params;

  console.log(`[notifyCohortMemberAdded] Notifying ${entrepreneurIds.length} team members about joining ${cohortName}`);

  if (!entrepreneurIds || entrepreneurIds.length === 0) {
    console.log(`[notifyCohortMemberAdded] No entrepreneurs to notify`);
    return;
  }

  // 1. Notify startup team
  await NotificationService.createNotification({
    title: `🎉 مرحباً بك في ${cohortName}`,
    message: `تهانينا! تم قبول طلب ${startupName} للانضمام إلى ${cohortName} ضمن برنامج ${programName}. نتطلع للعمل معك!`,
    titleEn: `🎉 Welcome to ${cohortName}`,
    messageEn: `Congratulations! ${startupName} has been accepted into ${cohortName} as part of ${programName}. We look forward to working with you!`,
    type: 'cohort',
    priority: 'high',
    recipientIds: entrepreneurIds,
    actionUrl: `/entrepreneur-dashboard/cohorts?id=${cohortId}`,
    actionLabel: 'عرض الدفعة',
    actionLabelEn: 'View Cohort',
    metadata: { 
      cohortId, 
      programId,
      startupId: params.startupId,
      type: 'cohort_member_added' 
    },
  });

  // 2. Notify program manager
  await NotificationService.createNotification({
    title: 'انضمام جديد للدفعة',
    message: `انضم ${startupName} إلى ${cohortName}.`,
    titleEn: 'New Cohort Member',
    messageEn: `${startupName} has joined ${cohortName}.`,
    type: 'cohort',
    priority: 'medium',
    recipientIds: [programManagerId],
    actionUrl: `/program-manager-dashboard/cohorts/${cohortId}`,
    actionLabel: 'عرض التفاصيل',
    actionLabelEn: 'View Details',
    metadata: { 
      cohortId, 
      startupId: params.startupId,
      type: 'cohort_member_added_pm' 
    },
  });

  console.log(`[notifyCohortMemberAdded] Notifications sent successfully`);
}

/**
 * Notify startup team when removed from cohort (TASK-06)
 * Trigger: Startup removed from cohort
 */
export async function notifyCohortMemberRemoved(params: {
  cohortId: string;
  cohortName: string;
  startupId: string;
  startupName: string;
  reason?: string;
  entrepreneurIds: string[];
  removedByName: string;
}) {
  const { 
    cohortId, 
    cohortName, 
    startupName, 
    reason,
    entrepreneurIds, 
    removedByName 
  } = params;

  console.log(`[notifyCohortMemberRemoved] Notifying ${entrepreneurIds.length} team members about removal from ${cohortName}`);

  if (!entrepreneurIds || entrepreneurIds.length === 0) {
    console.log(`[notifyCohortMemberRemoved] No entrepreneurs to notify`);
    return;
  }

  const reasonText = reason ? ` السبب: ${reason}.` : '';
  const reasonEn = reason ? ` Reason: ${reason}.` : '';

  await NotificationService.createNotification({
    title: `إزالة من ${cohortName}`,
    message: `تم إزالة ${startupName} من ${cohortName} بواسطة ${removedByName}.${reasonText}`,
    titleEn: `Removed from ${cohortName}`,
    messageEn: `${startupName} has been removed from ${cohortName} by ${removedByName}.${reasonEn}`,
    type: 'cohort',
    priority: 'high',
    recipientIds: entrepreneurIds,
    actionUrl: `/entrepreneur-dashboard/cohorts`,
    actionLabel: 'عرض الدفعات',
    actionLabelEn: 'View Cohorts',
    metadata: { 
      cohortId, 
      startupId: params.startupId,
      reason,
      type: 'cohort_member_removed' 
    },
  });

  console.log(`[notifyCohortMemberRemoved] Notifications sent successfully`);
}

// ============================================================================
// MILESTONE NOTIFICATIONS (TASK-07, TASK-08, TASK-09)
// ============================================================================

/**
 * Notify startup team when milestone is updated (TASK-07)
 * Trigger: PM/Admin modifies milestone details
 */
export async function notifyMilestoneUpdated(params: {
  milestoneId: string;
  milestoneTitle: string;
  startupId: string;
  startupName: string;
  changedFields: string[];
  oldDueDate?: Date;
  newDueDate?: Date;
  updatedByName: string;
  recipientIds: string[];
}) {
  const { 
    milestoneId, 
    milestoneTitle, 
    startupName,
    changedFields,
    oldDueDate,
    newDueDate,
    updatedByName,
    recipientIds 
  } = params;

  console.log(`[notifyMilestoneUpdated] Notifying about changes to: ${milestoneTitle}`);

  if (!recipientIds || recipientIds.length === 0) {
    console.log(`[notifyMilestoneUpdated] No recipients`);
    return;
  }

  // Build message based on what changed
  let messageAr = `تم تحديث المهمة "${milestoneTitle}" لـ ${startupName} بواسطة ${updatedByName}.`;
  let messageEn = `The milestone "${milestoneTitle}" for ${startupName} has been updated by ${updatedByName}.`;
  
  if (changedFields.includes('dueDate') && oldDueDate && newDueDate) {
    const oldDate = new Date(oldDueDate).toLocaleDateString('ar-SA');
    const newDate = new Date(newDueDate).toLocaleDateString('ar-SA');
    messageAr += ` تم تغيير تاريخ الاستحقاق من ${oldDate} إلى ${newDate}.`;
    messageEn += ` Due date changed from ${oldDate} to ${newDate}.`;
  }

  await NotificationService.createNotification({
    title: `تحديث المهمة: ${milestoneTitle}`,
    message: messageAr,
    titleEn: `Milestone Updated: ${milestoneTitle}`,
    messageEn: messageEn,
    type: 'milestone',
    priority: changedFields.includes('dueDate') ? 'high' : 'medium',
    recipientIds,
    actionUrl: `/entrepreneur-dashboard/milestones?id=${milestoneId}`,
    actionLabel: 'عرض المهمة',
    actionLabelEn: 'View Milestone',
    metadata: { 
      milestoneId,
      startupId: params.startupId,
      changedFields,
      type: 'milestone_updated'
    },
  });

  console.log(`[notifyMilestoneUpdated] Notification sent to ${recipientIds.length} recipients`);
}

/**
 * Notify startup team when milestone is deleted (TASK-08)
 * Trigger: PM/Admin deletes milestone
 */
export async function notifyMilestoneDeleted(params: {
  milestoneId: string;
  milestoneTitle: string;
  startupId: string;
  startupName: string;
  deletedByName: string;
  reason?: string;
  recipientIds: string[];
}) {
  const { 
    milestoneId, 
    milestoneTitle, 
    startupName,
    deletedByName,
    reason,
    recipientIds 
  } = params;

  console.log(`[notifyMilestoneDeleted] Notifying about deletion of: ${milestoneTitle}`);

  if (!recipientIds || recipientIds.length === 0) {
    console.log(`[notifyMilestoneDeleted] No recipients`);
    return;
  }

  const reasonText = reason ? ` السبب: ${reason}.` : '';
  const reasonEn = reason ? ` Reason: ${reason}.` : '';

  await NotificationService.createNotification({
    title: `حذف المهمة: ${milestoneTitle}`,
    message: `تم حذف المهمة "${milestoneTitle}" لـ ${startupName} بواسطة ${deletedByName}.${reasonText}`,
    titleEn: `Milestone Deleted: ${milestoneTitle}`,
    messageEn: `The milestone "${milestoneTitle}" for ${startupName} has been deleted by ${deletedByName}.${reasonEn}`,
    type: 'milestone',
    priority: 'high',
    recipientIds,
    actionUrl: `/entrepreneur-dashboard/milestones`,
    actionLabel: 'عرض المهام',
    actionLabelEn: 'View Milestones',
    metadata: { 
      milestoneId,
      startupId: params.startupId,
      reason,
      type: 'milestone_deleted'
    },
  });

  console.log(`[notifyMilestoneDeleted] Notification sent to ${recipientIds.length} recipients`);
}

/**
 * Notify startup team when milestone is completed (TASK-09)
 * Trigger: Milestone marked as completed
 */
export async function notifyMilestoneCompleted(params: {
  milestoneId: string;
  milestoneTitle: string;
  startupId: string;
  startupName: string;
  completedByName: string;
  finalProgress: number;
  recipientIds: string[];
}) {
  const { 
    milestoneId, 
    milestoneTitle, 
    startupName,
    completedByName,
    finalProgress,
    recipientIds 
  } = params;

  console.log(`[notifyMilestoneCompleted] Notifying about completion of: ${milestoneTitle}`);

  if (!recipientIds || recipientIds.length === 0) {
    console.log(`[notifyMilestoneCompleted] No recipients`);
    return;
  }

  await NotificationService.createNotification({
    title: `✅ اكتمال المهمة: ${milestoneTitle}`,
    message: `تم إكمال المهمة "${milestoneTitle}" لـ ${startupName} بنسبة ${finalProgress}%. تم التحقق بواسطة ${completedByName}.`,
    titleEn: `✅ Milestone Completed: ${milestoneTitle}`,
    messageEn: `The milestone "${milestoneTitle}" for ${startupName} has been completed at ${finalProgress}%. Verified by ${completedByName}.`,
    type: 'milestone',
    priority: 'medium',
    recipientIds,
    actionUrl: `/entrepreneur-dashboard/milestones?id=${milestoneId}`,
    actionLabel: 'عرض المهمة',
    actionLabelEn: 'View Milestone',
    metadata: { 
      milestoneId,
      startupId: params.startupId,
      finalProgress,
      type: 'milestone_completed'
    },
  });

  console.log(`[notifyMilestoneCompleted] Notification sent to ${recipientIds.length} recipients`);
}

// ============================================================================
// EVENT NOTIFICATIONS (TASK-10, TASK-11, TASK-12)
// ============================================================================

/**
 * Notify registered users when event is updated (TASK-10)
 * Trigger: Event time/location/details changed
 */
export async function notifyEventUpdated(params: {
  eventId: string;
  eventTitle: string;
  changedFields: string[];
  importantChanges: boolean;
  oldValues: {
    startDate?: Date;
    location?: string;
  };
  newValues: {
    startDate?: Date;
    location?: string;
  };
  updatedByName: string;
  recipientIds: string[];
}) {
  const { 
    eventId, 
    eventTitle, 
    changedFields,
    importantChanges,
    oldValues,
    newValues,
    updatedByName,
    recipientIds 
  } = params;

  console.log(`[notifyEventUpdated] Notifying about changes to: ${eventTitle}`);

  if (!recipientIds || recipientIds.length === 0) {
    console.log(`[notifyEventUpdated] No registered users to notify`);
    return;
  }

  // Build message based on changes
  let messageAr = `تم تحديث تفاصيل الفعالية "${eventTitle}" بواسطة ${updatedByName}.`;
  let messageEn = `The event "${eventTitle}" has been updated by ${updatedByName}.`;

  if (changedFields.includes('startDate') && oldValues.startDate && newValues.startDate) {
    const oldDate = new Date(oldValues.startDate).toLocaleString('ar-SA');
    const newDate = new Date(newValues.startDate).toLocaleString('ar-SA');
    messageAr += ` تغير موعد الفعالية من ${oldDate} إلى ${newDate}.`;
    messageEn += ` Event time changed from ${oldDate} to ${newDate}.`;
  }

  if (changedFields.includes('location') && oldValues.location && newValues.location) {
    messageAr += ` تغير الموقع من "${oldValues.location}" إلى "${newValues.location}".`;
    messageEn += ` Location changed from "${oldValues.location}" to "${newValues.location}".`;
  }

  await NotificationService.createNotification({
    title: `⚠️ تحديث الفعالية: ${eventTitle}`,
    message: messageAr,
    titleEn: `⚠️ Event Update: ${eventTitle}`,
    messageEn: messageEn,
    type: 'event',
    priority: importantChanges ? 'high' : 'medium',
    recipientIds,
    actionUrl: `/events/${eventId}`,
    actionLabel: 'عرض التحديثات',
    actionLabelEn: 'View Updates',
    metadata: { 
      eventId,
      changedFields,
      importantChanges,
      type: 'event_updated'
    },
  });

  console.log(`[notifyEventUpdated] Notification sent to ${recipientIds.length} users`);
}

/**
 * Notify user when added to event waitlist (TASK-11)
 * Trigger: User registered but event at capacity
 */
export async function notifyEventWaitlisted(params: {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  waitlistPosition: number;
}) {
  const { eventId, eventTitle, userId, waitlistPosition } = params;

  console.log(`[notifyEventWaitlisted] Notifying user ${userId} about waitlist position ${waitlistPosition}`);

  await NotificationService.createNotification({
    title: `قائمة الانتظار: ${eventTitle}`,
    message: `أنت الآن في قائمة الانتظار للفعالية "${eventTitle}" في المركز ${waitlistPosition}. سيتم إعلامك عند توفر مكان.`,
    titleEn: `Waitlisted: ${eventTitle}`,
    messageEn: `You are now on the waitlist for "${eventTitle}" at position ${waitlistPosition}. You will be notified when a spot becomes available.`,
    type: 'event',
    priority: 'medium',
    recipientIds: [userId],
    actionUrl: `/events/${eventId}`,
    actionLabel: 'عرض الفعالية',
    actionLabelEn: 'View Event',
    metadata: { 
      eventId,
      registrationId: params.registrationId,
      waitlistPosition,
      type: 'event_waitlisted'
    },
  });

  console.log(`[notifyEventWaitlisted] Notification sent`);
}

/**
 * Notify user when promoted from waitlist to confirmed (TASK-12)
 * Trigger: User moved from waitlist to confirmed
 */
export async function notifyEventPromotedFromWaitlist(params: {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  eventDate: Date;
}) {
  const { eventId, eventTitle, userId, eventDate } = params;

  console.log(`[notifyEventPromotedFromWaitlist] Notifying user ${userId} about promotion for ${eventTitle}`);

  const formattedDate = new Date(eventDate).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  await NotificationService.createNotification({
    title: `🎉 تم تأكيد تسجيلك: ${eventTitle}`,
    message: `تم نقلك من قائمة الانتظار إلى المسجلين في "${eventTitle}". موعد الفعالية: ${formattedDate}.`,
    titleEn: `🎉 Registration Confirmed: ${eventTitle}`,
    messageEn: `You have been moved from the waitlist to confirmed for "${eventTitle}". Event date: ${formattedDate}.`,
    type: 'event',
    priority: 'high',
    recipientIds: [userId],
    actionUrl: `/events/${eventId}`,
    actionLabel: 'عرض التفاصيل',
    actionLabelEn: 'View Details',
    metadata: { 
      eventId,
      registrationId: params.registrationId,
      type: 'event_promoted_from_waitlist'
    },
  });

  console.log(`[notifyEventPromotedFromWaitlist] Notification sent`);
}

// ============================================================================
// MEDIUM PRIORITY NOTIFICATIONS (TASK-13 to TASK-20)
// ============================================================================

/**
 * Notify when program details are updated (TASK-13)
 * Trigger: PUT /api/program-manager/programs/[programId]
 */
export async function notifyProgramUpdated(params: {
  programId: string;
  programName: string;
  updatedFields: string[];
  updaterName: string;
  cohortIds: string[];
}) {
  const { programId, programName, updatedFields, updaterName, cohortIds } = params;

  console.log(`[notifyProgramUpdated] Notifying about program update: ${programName}`);

  // Find all entrepreneurs in cohorts belonging to this program
  const startups = await prisma.startup.findMany({
    where: {
      cohortId: { in: cohortIds }
    },
    select: {
      entrepreneurs: { select: { id: true } }
    }
  });

  const recipientIds = [...new Set(startups.flatMap(s => s.entrepreneurs.map(e => e.id)))];

  if (!recipientIds.length) {
    console.log(`[notifyProgramUpdated] No recipients found`);
    return;
  }

  const fieldNamesAr: Record<string, string> = {
    'name': 'الاسم',
    'description': 'الوصف',
    'startDate': 'تاريخ البدء',
    'endDate': 'تاريخ الانتهاء',
    'status': 'الحالة',
    'requirements': 'المتطلبات'
  };

  const fieldNamesEn: Record<string, string> = {
    'name': 'Name',
    'description': 'Description',
    'startDate': 'Start Date',
    'endDate': 'End Date',
    'status': 'Status',
    'requirements': 'Requirements'
  };

  const changedFieldsAr = updatedFields.map(f => fieldNamesAr[f] || f).join('، ');
  const changedFieldsEn = updatedFields.map(f => fieldNamesEn[f] || f).join(', ');

  await NotificationService.createNotification({
    title: `📋 تحديث على البرنامج: ${programName}`,
    message: `تم تحديث ${changedFieldsAr} في برنامج "${programName}" بواسطة ${updaterName}.`,
    titleEn: `📋 Program Updated: ${programName}`,
    messageEn: `${changedFieldsEn} updated in program "${programName}" by ${updaterName}.`,
    type: 'program',
    priority: 'medium',
    recipientIds,
    actionUrl: `/programs/${programId}`,
    actionLabel: 'عرض البرنامج',
    actionLabelEn: 'View Program',
    metadata: { 
      programId,
      type: 'program_updated',
      updatedFields
    },
  });

  console.log(`[notifyProgramUpdated] Notification sent to ${recipientIds.length} recipients`);
}

/**
 * Notify when program is cancelled (TASK-14)
 * Trigger: Program status changed to CANCELLED
 */
export async function notifyProgramCancelled(params: {
  programId: string;
  programName: string;
  cancelledByName: string;
  reason?: string;
  cohortIds: string[];
}) {
  const { programId, programName, cancelledByName, reason, cohortIds } = params;

  console.log(`[notifyProgramCancelled] Notifying about program cancellation: ${programName}`);

  // Find all entrepreneurs in cohorts belonging to this program
  const startups = await prisma.startup.findMany({
    where: {
      cohortId: { in: cohortIds }
    },
    select: {
      entrepreneurs: { select: { id: true } }
    }
  });

  const recipientIds = [...new Set(startups.flatMap(s => s.entrepreneurs.map(e => e.id)))];

  if (!recipientIds.length) {
    console.log(`[notifyProgramCancelled] No recipients found`);
    return;
  }

  const reasonTextAr = reason ? ` السبب: ${reason}.` : '';
  const reasonTextEn = reason ? ` Reason: ${reason}.` : '';

  await NotificationService.createNotification({
    title: `⛔ إلغاء البرنامج: ${programName}`,
    message: `تم إلغاء برنامج "${programName}" بواسطة ${cancelledByName}.${reasonTextAr}`,
    titleEn: `⛔ Program Cancelled: ${programName}`,
    messageEn: `Program "${programName}" has been cancelled by ${cancelledByName}.${reasonTextEn}`,
    type: 'program',
    priority: 'high',
    recipientIds,
    actionUrl: `/programs/${programId}`,
    actionLabel: 'عرض التفاصيل',
    actionLabelEn: 'View Details',
    metadata: { 
      programId,
      type: 'program_cancelled',
      reason
    },
  });

  console.log(`[notifyProgramCancelled] Notification sent to ${recipientIds.length} recipients`);
}

/**
 * Notify when new cohort is created (TASK-15)
 * Trigger: POST /api/program-manager/cohorts
 */
export async function notifyCohortCreated(params: {
  cohortId: string;
  cohortName: string;
  programName: string;
  startDate: Date;
  createdByName: string;
  startupIds: string[];
}) {
  const { cohortId, cohortName, programName, startDate, createdByName, startupIds } = params;

  console.log(`[notifyCohortCreated] Notifying about new cohort: ${cohortName}`);

  // Get entrepreneurs from startups
  const startups = await prisma.startup.findMany({
    where: { id: { in: startupIds } },
    select: {
      entrepreneurs: { select: { id: true } }
    }
  });

  const recipientIds = [...new Set(startups.flatMap(s => s.entrepreneurs.map(e => e.id)))];

  if (!recipientIds.length) {
    console.log(`[notifyCohortCreated] No recipients found`);
    return;
  }

  const formattedDate = new Date(startDate).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await NotificationService.createNotification({
    title: `🎉 انضمام إلى برنامج ${programName}`,
    message: `تم إنشاء ${cohortName} ضمن ${programName} وتم إضافتك إليها. تاريخ البدء: ${formattedDate}.`,
    titleEn: `🎉 Joined ${programName}`,
    messageEn: `You have been added to ${cohortName} in ${programName}. Start date: ${formattedDate}.`,
    type: 'cohort',
    priority: 'medium',
    recipientIds,
    actionUrl: `/cohorts/${cohortId}`,
    actionLabel: 'عرض التفاصيل',
    actionLabelEn: 'View Details',
    metadata: { 
      cohortId,
      type: 'cohort_created'
    },
  });

  console.log(`[notifyCohortCreated] Notification sent to ${recipientIds.length} recipients`);
}

/**
 * Notify when team invitation is accepted (TASK-16)
 * Trigger: Team invitation accepted
 */
export async function notifyTeamInvitationAccepted(params: {
  invitationId: string;
  startupId: string;
  startupName: string;
  invitedEmail: string;
  invitedName: string;
  acceptedAt: Date;
  entrepreneurIds: string[];
}) {
  const { startupName, invitedEmail, invitedName, acceptedAt, entrepreneurIds } = params;

  console.log(`[notifyTeamInvitationAccepted] Notifying about invitation acceptance for ${invitedEmail}`);

  if (!entrepreneurIds.length) {
    console.log(`[notifyTeamInvitationAccepted] No recipients found`);
    return;
  }

  const formattedDate = new Date(acceptedAt).toLocaleDateString('ar-SA');

  await NotificationService.createNotification({
    title: `✅ تم قبول دعوة الفريق`,
    message: `${invitedName} (${invitedEmail}) قبل دعوة الانضمام إلى ${startupName} بتاريخ ${formattedDate}.`,
    titleEn: `✅ Team Invitation Accepted`,
    messageEn: `${invitedName} (${invitedEmail}) accepted the invitation to join ${startupName} on ${formattedDate}.`,
    type: 'team',
    priority: 'medium',
    recipientIds: entrepreneurIds,
    actionUrl: `/startups/${params.startupId}/team`,
    actionLabel: 'عرض الفريق',
    actionLabelEn: 'View Team',
    metadata: { 
      startupId: params.startupId,
      invitationId: params.invitationId,
      type: 'team_invitation_accepted'
    },
  });

  console.log(`[notifyTeamInvitationAccepted] Notification sent`);
}

/**
 * Notify when team invitation is rejected (TASK-17)
 * Trigger: Team invitation rejected
 */
export async function notifyTeamInvitationRejected(params: {
  invitationId: string;
  startupId: string;
  startupName: string;
  invitedEmail: string;
  invitedName: string;
  rejectedAt: Date;
  reason?: string;
  entrepreneurIds: string[];
}) {
  const { startupName, invitedEmail, invitedName, rejectedAt, reason, entrepreneurIds } = params;

  console.log(`[notifyTeamInvitationRejected] Notifying about invitation rejection for ${invitedEmail}`);

  if (!entrepreneurIds.length) {
    console.log(`[notifyTeamInvitationRejected] No recipients found`);
    return;
  }

  const formattedDate = new Date(rejectedAt).toLocaleDateString('ar-SA');
  const reasonTextAr = reason ? ` السبب: ${reason}.` : '';
  const reasonTextEn = reason ? ` Reason: ${reason}.` : '';

  await NotificationService.createNotification({
    title: `❌ تم رفض دعوة الفريق`,
    message: `${invitedName} (${invitedEmail}) رفض دعوة الانضمام إلى ${startupName} بتاريخ ${formattedDate}.${reasonTextAr}`,
    titleEn: `❌ Team Invitation Rejected`,
    messageEn: `${invitedName} (${invitedEmail}) rejected the invitation to join ${startupName} on ${formattedDate}.${reasonTextEn}`,
    type: 'team',
    priority: 'medium',
    recipientIds: entrepreneurIds,
    actionUrl: `/startups/${params.startupId}/team`,
    actionLabel: 'عرض الفريق',
    actionLabelEn: 'View Team',
    metadata: { 
      startupId: params.startupId,
      invitationId: params.invitationId,
      type: 'team_invitation_rejected',
      reason
    },
  });

  console.log(`[notifyTeamInvitationRejected] Notification sent`);
}

/**
 * Notify when team member is removed (TASK-18)
 * Trigger: DELETE /api/startups/[id]/team/[memberId]
 */
export async function notifyTeamMemberRemoved(params: {
  startupId: string;
  startupName: string;
  memberName: string;
  memberEmail: string;
  removedByName: string;
  removedAt: Date;
  entrepreneurIds: string[];
  removedUserId: string;
}) {
  const { startupName, memberName, memberEmail, removedByName, removedAt, entrepreneurIds, removedUserId } = params;

  console.log(`[notifyTeamMemberRemoved] Notifying about team member removal: ${memberName}`);

  // Notify remaining entrepreneurs
  const remainingEntrepreneurs = entrepreneurIds.filter(id => id !== removedUserId);

  if (remainingEntrepreneurs.length) {
    const formattedDate = new Date(removedAt).toLocaleDateString('ar-SA');

    await NotificationService.createNotification({
      title: `🚫 إزالة عضو من الفريق`,
      message: `تم إزالة ${memberName} (${memberEmail}) من فريق ${startupName} بواسطة ${removedByName} بتاريخ ${formattedDate}.`,
      titleEn: `🚫 Team Member Removed`,
      messageEn: `${memberName} (${memberEmail}) was removed from ${startupName} team by ${removedByName} on ${formattedDate}.`,
      type: 'team',
      priority: 'medium',
      recipientIds: remainingEntrepreneurs,
      actionUrl: `/startups/${params.startupId}/team`,
      actionLabel: 'عرض الفريق',
      actionLabelEn: 'View Team',
      metadata: { 
        startupId: params.startupId,
        removedUserId,
        type: 'team_member_removed'
      },
    });

    console.log(`[notifyTeamMemberRemoved] Notification sent to remaining team members`);
  }

  // Notify the removed user
  await NotificationService.createNotification({
    title: `🚫 تمت إزالتك من الفريق`,
    message: `تم إزالتك من فريق ${startupName} بواسطة ${removedByName}.`,
    titleEn: `🚫 Removed from Team`,
    messageEn: `You have been removed from ${startupName} team by ${removedByName}.`,
    type: 'team',
    priority: 'high',
    recipientIds: [removedUserId],
    actionUrl: `/dashboard`,
    actionLabel: 'الذهاب للرئيسية',
    actionLabelEn: 'Go to Dashboard',
    metadata: { 
      startupId: params.startupId,
      type: 'team_member_removed'
    },
  });

  console.log(`[notifyTeamMemberRemoved] Notification sent to removed user`);
}

/**
 * Notify when team member account is created (TASK-19)
 * Trigger: POST /api/startups/[id]/team/invite (when creating new user)
 */
export async function notifyTeamMemberAccountCreated(params: {
  startupId: string;
  startupName: string;
  memberName: string;
  memberEmail: string;
  tempPassword: string;
  invitedByName: string;
  memberUserId: string;
}) {
  const { startupName, memberName, memberEmail, tempPassword, invitedByName, memberUserId } = params;

  console.log(`[notifyTeamMemberAccountCreated] Notifying new team member: ${memberEmail}`);

  await NotificationService.createNotification({
    title: `🎉 تم إنشاء حسابك وإضافتك لفريق ${startupName}`,
    message: `مرحباً ${memberName}! تم إنشاء حسابك بواسطة ${invitedByName} وإضافتك إلى فريق ${startupName}. بيانات الدخول: ${memberEmail} / كلمة المرور المؤقتة: ${tempPassword}. يرجى تغيير كلمة المرور فور الدخول.`,
    titleEn: `🎉 Account Created - Joined ${startupName} Team`,
    messageEn: `Welcome ${memberName}! Your account was created by ${invitedByName} and you were added to ${startupName} team. Login: ${memberEmail} / Temporary password: ${tempPassword}. Please change your password after logging in.`,
    type: 'team',
    priority: 'high',
    recipientIds: [memberUserId],
    actionUrl: `/settings/password`,
    actionLabel: 'تغيير كلمة المرور',
    actionLabelEn: 'Change Password',
    metadata: { 
      startupId: params.startupId,
      type: 'team_member_account_created'
    },
  });

  console.log(`[notifyTeamMemberAccountCreated] Notification sent to new team member`);
}

/**
 * Notify when event registration is removed/cancelled (TASK-20)
 * Trigger: DELETE /api/events/[eventId]/register or admin removes registration
 */
export async function notifyEventRegistrationRemoved(params: {
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  removedByName: string;
  removedAt: Date;
  reason?: string;
  isSelfCancelled: boolean;
}) {
  const { eventId, eventTitle, userId, userName, removedByName, removedAt, reason, isSelfCancelled } = params;

  console.log(`[notifyEventRegistrationRemoved] Notifying ${userName} about registration removal for ${eventTitle}`);

  const formattedDate = new Date(removedAt).toLocaleDateString('ar-SA');
  const reasonTextAr = reason ? ` السبب: ${reason}.` : '';
  const reasonTextEn = reason ? ` Reason: ${reason}.` : '';

  const actionTextAr = isSelfCancelled ? 'ألغيت' : `تم إلغاء تسجيلك`;
  const actionTextEn = isSelfCancelled ? 'You cancelled' : `Your registration was cancelled`;
  const byTextAr = isSelfCancelled ? '' : ` بواسطة ${removedByName}`;
  const byTextEn = isSelfCancelled ? '' : ` by ${removedByName}`;

  await NotificationService.createNotification({
    title: `🚫 إلغاء تسجيل الفعالية: ${eventTitle}`,
    message: `${actionTextAr} تسجيلك في "${eventTitle}"${byTextAr} بتاريخ ${formattedDate}.${reasonTextAr}`,
    titleEn: `🚫 Event Registration Cancelled: ${eventTitle}`,
    messageEn: `${actionTextEn} for "${eventTitle}"${byTextEn} on ${formattedDate}.${reasonTextEn}`,
    type: 'event',
    priority: 'medium',
    recipientIds: [userId],
    actionUrl: `/events/${eventId}`,
    actionLabel: 'عرض الفعالية',
    actionLabelEn: 'View Event',
    metadata: { 
      eventId,
      type: 'event_registration_removed',
      isSelfCancelled,
      reason
    },
  });

  console.log(`[notifyEventRegistrationRemoved] Notification sent`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleLabelAr(role: string): string {
  const labels: Record<string, string> = {
    'ADMIN': 'مشرف',
    'PROGRAM_MANAGER': 'مدير برنامج',
    'MENTOR': 'مرشد',
    'ENTREPRENEUR': 'رائد أعمال',
    'INVESTOR': 'مستثمر',
    'JUDGE': 'محكم',
    'STARTUP': 'شركة ناشئة',
    'TEAM_MEMBER': 'عضو فريق',
  };
  return labels[role] || role;
}

function getRoleLabelEn(role: string): string {
  const labels: Record<string, string> = {
    'ADMIN': 'Admin',
    'PROGRAM_MANAGER': 'Program Manager',
    'MENTOR': 'Mentor',
    'ENTREPRENEUR': 'Entrepreneur',
    'INVESTOR': 'Investor',
    'JUDGE': 'Judge',
    'STARTUP': 'Startup',
    'TEAM_MEMBER': 'Team Member',
  };
  return labels[role] || role;
}
