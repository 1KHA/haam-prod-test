/**
 * Email Service
 * 
 * Core service for sending emails with SMTP configuration,
 * template rendering, and logging.
 */

import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Decrypt SMTP password (must match smtp/route.ts encryption)
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-key-32-chars-long!!!!!';
function decryptPassword(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 3) return text; // not encrypted, return as-is
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return text; // if decryption fails, return as-is
  }
}

// Types
export interface SendEmailParams {
  to: string | string[];
  subject: string;
  subjectEn?: string;
  htmlBody: string;
  htmlBodyEn?: string;
  textBody?: string;
  textBodyEn?: string;
  templateId?: string;
  scenarioType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
}

export interface SendBulkEmailParams {
  recipientIds: string[];
  templateName?: string;
  customSubject?: string;
  customHtmlBody?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: Record<string, any>;
  scenarioType?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  testMode: boolean;
}

// Cache for SMTP config and templates
let cachedSmtpConfig: SmtpConfig | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cachedTemplates: Map<string, any> = new Map();
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class EmailService {
  /**
   * Get SMTP configuration from database
   */
  static async getSmtpConfig(): Promise<SmtpConfig | null> {
    const now = Date.now();
    
    // Return cached config if still valid
    if (cachedSmtpConfig && (now - cacheTimestamp) < CACHE_TTL) {
      return cachedSmtpConfig;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config = await (prisma as any).smtpConfig.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!config) {
        return null;
      }

      cachedSmtpConfig = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        username: config.username,
        password: decryptPassword(config.password),
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        isActive: config.isActive,
        testMode: config.testMode,
      };

      cacheTimestamp = now;
      return cachedSmtpConfig;
    } catch (error) {
      console.error('[EmailService] Error fetching SMTP config:', error);
      return null;
    }
  }

  /**
   * Create Nodemailer transporter
   */
  static async createTransporter() {
    const config = await this.getSmtpConfig();
    
    if (!config) {
      throw new Error('No active SMTP configuration found');
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  }

  /**
   * Get email template by name
   */
  static async getTemplate(name: string) {
    const now = Date.now();
    
    // Return cached template if still valid
    if (cachedTemplates.has(name) && (now - cacheTimestamp) < CACHE_TTL) {
      return cachedTemplates.get(name);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const template = await (prisma as any).emailTemplate.findUnique({
        where: { name },
      });

      if (template) {
        cachedTemplates.set(name, template);
      }

      return template;
    } catch (error) {
      console.error('[EmailService] Error fetching template:', error);
      return null;
    }
  }

  /**
   * Render template with variables
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static renderTemplate(template: string, variables: Record<string, any>): string {
    try {
      const compiled = Handlebars.compile(template);
      return compiled(variables);
    } catch (error) {
      console.error('[EmailService] Error rendering template:', error);
      return template;
    }
  }

  /**
   * Send a single email
   */
  static async sendEmail(params: SendEmailParams): Promise<{ success: boolean; logId?: string; error?: string }> {
    let emailLogId: string | undefined;
    try {
      const config = await this.getSmtpConfig();

      if (!config) {
        throw new Error('SMTP not configured');
      }

      if (!config.isActive) {
        throw new Error('SMTP is not active');
      }

      // Create email log entry first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emailLog = await (prisma as any).emailLog.create({
        data: {
          recipientEmail: Array.isArray(params.to) ? params.to.join(', ') : params.to,
          recipientId: params.userId,
          subject: params.subject,
          templateId: params.templateId,
          scenarioType: params.scenarioType,
          status: 'pending',
          metadata: JSON.stringify({
            variables: params.variables,
            hasEnglishVersion: !!(params.subjectEn || params.htmlBodyEn),
          }),
          ipAddress: params.ipAddress,
        },
      });
      emailLogId = emailLog.id;

      // If in test mode, don't actually send
      if (config.testMode) {
        console.log('[EmailService] TEST MODE - Email would be sent:', {
          to: params.to,
          subject: params.subject,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).emailLog.update({
          where: { id: emailLogId },
          data: { status: 'sent', sentAt: new Date() },
        });

        return { success: true, logId: emailLogId };
      }

      // Create transporter and send
      const transporter = await this.createTransporter();

      const recipients = Array.isArray(params.to) ? params.to.join(', ') : params.to;

      // Use bilingual content if available
      const subject = params.subjectEn ? `${params.subject} / ${params.subjectEn}` : params.subject;
      let htmlBody = params.htmlBody;

      if (params.htmlBodyEn) {
        htmlBody = `
          <div dir="rtl" style="text-align: right;">
            ${params.htmlBody}
          </div>
          <hr style="margin: 20px 0;" />
          <div dir="ltr" style="text-align: left;">
            ${params.htmlBodyEn}
          </div>
        `;
      }

      const info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: recipients,
        subject: subject,
        html: htmlBody,
        text: params.textBody || params.htmlBody.replace(/<[^>]*>/g, ''),
      });

      console.log('[EmailService] Email sent:', info.messageId);

      // Update log entry
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).emailLog.update({
        where: { id: emailLogId },
        data: { status: 'sent', sentAt: new Date() },
      });

      return { success: true, logId: emailLogId };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[EmailService] Error sending email:', error);

      // Update the existing log entry to failed (don't create a duplicate)
      if (emailLogId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).emailLog.update({
          where: { id: emailLogId },
          data: { status: 'failed', errorMessage: error.message },
        }).catch(() => {}); // ignore secondary error
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send email using a template
   */
  static async sendTemplatedEmail(params: {
    to: string | string[];
    templateName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables: Record<string, any>;
    userId?: string;
    ipAddress?: string;
  }): Promise<{ success: boolean; logId?: string; error?: string }> {
    try {
      const template = await this.getTemplate(params.templateName);
      
      if (!template) {
        throw new Error(`Template '${params.templateName}' not found`);
      }

      // Render template with variables
      const subject = this.renderTemplate(template.subject, params.variables);
      const subjectEn = template.subjectEn ? this.renderTemplate(template.subjectEn, params.variables) : undefined;
      const htmlBody = this.renderTemplate(template.htmlBody, params.variables);
      const htmlBodyEn = template.htmlBodyEn ? this.renderTemplate(template.htmlBodyEn, params.variables) : undefined;
      const textBody = template.textBody ? this.renderTemplate(template.textBody, params.variables) : undefined;
      const textBodyEn = template.textBodyEn ? this.renderTemplate(template.textBodyEn, params.variables) : undefined;

      return this.sendEmail({
        to: params.to,
        subject,
        subjectEn,
        htmlBody,
        htmlBodyEn,
        textBody,
        textBodyEn,
        templateId: template.id,
        scenarioType: template.scenarioType,
        variables: params.variables,
        userId: params.userId,
        ipAddress: params.ipAddress,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[EmailService] Error sending templated email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk emails
   */
  static async sendBulkEmails(params: SendBulkEmailParams): Promise<{
    total: number;
    sent: number;
    failed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let sent = 0;
    let failed = 0;

    try {
      // Get users
      const users = await prisma.user.findMany({
        where: { id: { in: params.recipientIds } },
        select: { id: true, email: true, name: true },
      });

      // If using a template, fetch it
      let template = null;
      if (params.templateName) {
        template = await this.getTemplate(params.templateName);
        if (!template) {
          throw new Error(`Template '${params.templateName}' not found`);
        }
      }

      // Send emails sequentially to avoid rate limits
      for (const user of users) {
        try {
          const variables = {
            user: {
              name: user.name,
              email: user.email,
            },
            ...params.variables,
          };

          if (template) {
            const result = await this.sendTemplatedEmail({
              to: user.email,
              templateName: params.templateName!,
              variables,
              userId: user.id,
            });
            
            if (result.success) {
              sent++;
            } else {
              failed++;
              errors.push(`Failed for ${user.email}: ${result.error}`);
            }
          } else {
            // Custom email without template
            const subject = this.renderTemplate(params.customSubject || '', variables);
            const htmlBody = this.renderTemplate(params.customHtmlBody || '', variables);
            
            const result = await this.sendEmail({
              to: user.email,
              subject,
              htmlBody,
              scenarioType: params.scenarioType,
              variables,
              userId: user.id,
            });
            
            if (result.success) {
              sent++;
            } else {
              failed++;
              errors.push(`Failed for ${user.email}: ${result.error}`);
            }
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          failed++;
          errors.push(`Error for ${user.email}: ${error.message}`);
        }
      }

      return { total: users.length, sent, failed, errors };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[EmailService] Error in bulk send:', error);
      return { total: params.recipientIds.length, sent, failed, errors: [error.message] };
    }
  }

  /**
   * Test SMTP configuration (uses cached active config)
   */
  static async testSmtpConfig(testEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      const config = await this.getSmtpConfig();

      if (!config) {
        return { success: false, message: 'No SMTP configuration found' };
      }

      const transporter = await this.createTransporter();

      await transporter.verify();

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: testEmail,
        subject: 'Test Email from HAAM Platform',
        html: '<h1>SMTP Configuration Test</h1><p>If you receive this email, your SMTP configuration is working correctly!</p>',
      });

      return { success: true, message: 'Test email sent successfully!' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[EmailService] SMTP test failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Test a specific SMTP config by its raw DB record (bypasses cache)
   */
  static async testSpecificConfig(
    config: { host: string; port: number; secure: boolean; username: string; password: string; fromEmail: string; fromName: string },
    testEmail: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.username, pass: decryptPassword(config.password) },
        tls: { rejectUnauthorized: false },
      });

      await transporter.verify();

      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: testEmail,
        subject: 'Test Email from HAAM Platform',
        html: '<h1>SMTP Configuration Test</h1><p>If you receive this email, your SMTP configuration is working correctly!</p>',
      });

      return { success: true, message: 'Test email sent successfully!' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[EmailService] SMTP test failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get email statistics
   */
  static async getStats(days: number = 30): Promise<{
    total: number;
    sent: number;
    failed: number;
    opened: number;
    pending: number;
    byScenario: Record<string, number>;
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [
        total,
        sent,
        failed,
        opened,
        pending,
        byScenario,
      ] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).emailLog.count({
          where: { createdAt: { gte: since } },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).emailLog.count({
          where: { status: 'sent', createdAt: { gte: since } },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).emailLog.count({
          where: { status: 'failed', createdAt: { gte: since } },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).emailLog.count({
          where: { openedAt: { not: null }, createdAt: { gte: since } },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).emailLog.count({
          where: { status: 'pending', createdAt: { gte: since } },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).emailLog.groupBy({
          by: ['scenarioType'],
          where: { createdAt: { gte: since } },
          _count: { scenarioType: true },
        }),
      ]);

      const scenarioStats: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      byScenario.forEach((item: any) => {
        scenarioStats[item.scenarioType || 'unknown'] = item._count.scenarioType;
      });

      return {
        total,
        sent,
        failed,
        opened,
        pending,
        byScenario: scenarioStats,
      };
    } catch (error) {
      console.error('[EmailService] Error getting stats:', error);
      return { total: 0, sent: 0, failed: 0, opened: 0, pending: 0, byScenario: {} };
    }
  }

  /**
   * Send custom email (simple wrapper for one-off emails)
   */
  static async sendCustom(
    params: {
      to: string;
      subject: string;
      htmlBody: string;
      textBody?: string;
      from?: string;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.sendEmail({
        to: params.to,
        subject: params.subject,
        htmlBody: params.htmlBody,
        textBody: params.textBody,
      });
      return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[EmailService] Error sending custom email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email to specific user by ID
   */
  static async sendToUser({
    userId,
    templateName,
    variables,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scenarioType,
  }: {
    userId: string;
    templateName?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: Record<string, any>;
    scenarioType?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (templateName) {
        return this.sendTemplatedEmail({
          to: user.email,
          templateName,
          variables: { user: { name: user.name, email: user.email }, ...variables },
          userId: user.id,
        });
      }

      return { success: false, error: 'Template name is required' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[EmailService] Error sending to user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fire an email scenario by type — checks if enabled, resolves template, sends to all recipientUserIds.
   * Use this as a one-liner in route files after the in-app notification call.
   */
  static async fireScenario(
    scenarioType: string,
    recipientUserIds: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables: Record<string, any> = {}
  ): Promise<void> {
    try {
      if (recipientUserIds.length === 0) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scenario = await (prisma as any).emailScenarioSettings.findUnique({
        where: { scenarioType },
        include: { template: { select: { name: true } } },
      });

      if (!scenario?.isEnabled || !scenario?.template?.name) return;

      for (const userId of recipientUserIds) {
        await this.sendToUser({
          userId,
          templateName: scenario.template.name,
          variables,
          scenarioType,
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`[EmailService] fireScenario(${scenarioType}) failed:`, error.message);
    }
  }

  /**
   * Clear cache (call when config/templates change)
   */
  static clearCache() {
    cachedSmtpConfig = null;
    cachedTemplates.clear();
    cacheTimestamp = 0;
  }
}

export default EmailService;
