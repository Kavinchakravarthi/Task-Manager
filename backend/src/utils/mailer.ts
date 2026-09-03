import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.password } : undefined
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const sendInvitationEmail = async (email: string, token: string, jobRole: string) => {
  const signupUrl = `${config.clientUrl}/signup?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'You are invited to join TaskFlow',
    text: [
      'You have been invited to join TaskFlow.',
      '',
      `Your team role: ${jobRole}`,
      '',
      'TaskFlow helps teams plan, assign, and track their work in one place.',
      '',
      `Sign Up: ${signupUrl}`,
      '',
      'This invitation expires in 7 days.'
    ].join('\n'),
    html: `
      <div style="margin:0;background:#f3f4f6;padding:40px 16px;font-family:Arial,sans-serif;color:#172033;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <tr><td style="background:#111827;padding:28px 32px;color:#ffffff;font-size:24px;font-weight:700;">TaskFlow</td></tr>
          <tr><td style="padding:36px 32px;">
            <p style="margin:0 0 12px;color:#2563eb;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Team invitation</p>
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;color:#111827;">You’re invited to join TaskFlow</h1>
            <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#4b5563;">You have been invited to join the Task Manager application and start collaborating with your team.</p>
            <p style="margin:0 0 28px;padding:14px 16px;background:#f8fafc;border-radius:10px;font-size:15px;color:#374151;"><strong>Team role:</strong> ${jobRole}</p>
            <a href="${signupUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 24px;font-size:16px;font-weight:700;">Sign Up</a>
            <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">This invitation expires in 7 days. If you were not expecting this email, you can safely ignore it.</p>
          </td></tr>
          <tr><td style="border-top:1px solid #e5e7eb;padding:20px 32px;font-size:12px;color:#9ca3af;">TaskFlow · Simple, focused task management</td></tr>
        </table>
      </div>`
  });
};