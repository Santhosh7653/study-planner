import 'dotenv/config';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('[send-email] Received body:', JSON.stringify(req.body));

    const { type, title, taskTitle, deadline, priority, notes, oldPriority, oldDate, to } = req.body;
    const taskName = title || taskTitle;

    if (!type || !taskName) {
      console.error('[send-email] Missing fields. type:', type, 'title:', taskName);
      return res.status(400).json({
        success: false,
        error: `Missing required fields. Got: ${JSON.stringify(req.body)}`,
      });
    }

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const RECIPIENT = process.env.RECIPIENT_EMAIL || EMAIL_USER;
    const SMTP_FROM = process.env.SMTP_FROM || EMAIL_USER;

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error('[send-email] Missing EMAIL_USER or EMAIL_PASS');
      return res.status(500).json({ success: false, error: 'Email not configured' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    let subject = '';
    let html = '';

    if (type === 'task_created') {
      subject = `?? New Task Added: ${taskName}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#4f46e5">?? New Task Added</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${taskName}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Priority</td><td style="padding:8px">${priority || 'N/A'}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Due Date</td><td style="padding:8px">${deadline || 'N/A'}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Notes</td><td style="padding:8px">${notes || 'None'}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
        </div>
      `;
    } else if (type === 'priority_changed') {
      subject = `?? Priority Changed: ${taskName}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#f59e0b">?? Priority Updated</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${taskName}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Old Priority</td><td style="padding:8px;color:red">${oldPriority || 'N/A'}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">New Priority</td><td style="padding:8px;color:green">${priority || 'N/A'}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
        </div>
      `;
    } else if (type === 'due_date_changed') {
      subject = `?? Due Date Updated: ${taskName}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#10b981">?? Due Date Changed</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${taskName}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Old Due Date</td><td style="padding:8px;color:red">${oldDate || 'N/A'}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">New Due Date</td><td style="padding:8px;color:green">${deadline || 'N/A'}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
        </div>
      `;
    } else {
      return res.status(400).json({ success: false, error: `Unknown email type: ${type}` });
    }

    await transporter.sendMail({
      from: `"Study Planner" <${SMTP_FROM}>`,
      to: RECIPIENT,
      subject,
      html,
    });

    console.log('[send-email] ? Email sent:', subject, '?', RECIPIENT);
    return res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    console.error('[send-email] ? Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
