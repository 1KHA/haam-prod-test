// lib/email.ts
// This is a placeholder for email sending functionality.
// In a real application, you would integrate with an email service like SendGrid, Nodemailer, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log(`--- Sending Email ---`);
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`HTML Content: \n${options.html}`);
  if (options.text) {
    console.log(`Text Content: \n${options.text}`);
  }
  console.log(`---------------------`);

  // In a real application, you would use an email sending library/SDK here.
  // Example with a hypothetical email service:
  /*
  try {
    await emailService.send({
      to: options.to,
      from: 'no-reply@youraccelerator.com', // Replace with your verified sender email
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    throw new Error('Failed to send email');
  }
  */

  // For now, we'll just log to console.
  return Promise.resolve();
}

export function generateInvitationEmailHtml(inviterName: string, inviteeEmail: string, invitationType: 'entrepreneur' | 'company', acceptLink: string, rejectLink: string, startupName?: string): string {
  let subject = '';
  let body = '';

  if (invitationType === 'entrepreneur') {
    subject = `Invitation to connect from ${inviterName}`;
    body = `
      <p>Hello ${inviteeEmail},</p>
      <p>${inviterName} has invited you to connect as an entrepreneur on the Accelerator Dashboard.</p>
      <p>To accept this invitation, please click the link below:</p>
      <p><a href="${acceptLink}">Accept Invitation</a></p>
      <p>If you wish to decline, click here:</p>
      <p><a href="${rejectLink}">Reject Invitation</a></p>
      <p>Thank you,</p>
      <p>The Accelerator Dashboard Team</p>
    `;
  } else if (invitationType === 'company' && startupName) {
    subject = `Invitation to join ${startupName} from ${inviterName}`;
    body = `
      <p>Hello ${inviteeEmail},</p>
      <p>${inviterName} has invited you to join their company, ${startupName}, on the Accelerator Dashboard.</p>
      <p>To accept this invitation, please click the link below:</p>
      <p><a href="${acceptLink}">Accept Company Invitation</a></p>
      <p>If you wish to decline, click here:</p>
      <p><a href="${rejectLink}">Reject Company Invitation</a></p>
      <p>Thank you,</p>
      <p>The Accelerator Dashboard Team</p>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .button { display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${subject}</h2>
        ${body}
      </div>
    </body>
    </html>
  `;
}
