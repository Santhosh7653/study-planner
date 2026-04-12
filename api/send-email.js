// v6 - self-contained, accepts all payload shapes
import nodemailer from 'nodemailer';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Parse body — handle all cases
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    if (!body || typeof body !== 'object') body = {};

    console.log('[send-email] RAW body:', JSON.stringify(body));

    // Accept EVERY possible field name variation
    const emailType = body.eventType || body.type || '';
    const taskName  = body.taskTitle || body.title || body.task?.title || body.task || '';
    const taskDue   = body.dueDate || body.deadline || body.task?.deadline || '';
    const priority  = body.priority || body.task?.priority || '';
    const notes     = body.notes || body.task?.notes || '';
    const recipient = body.to || body.userEmail || body.email ||
                      process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER ||
                      process.env.GMAIL_USER || '';
    const changes   = body.changes || {};

    console.log('[send-email] Resolved:', { emailType, taskName, recipient });

    // Never return 400 for missing fields — just use fallbacks
    if (!emailType) {
      console.error('[send-email] No email type found in body:', JSON.stringify(body));
      return res.status(400).json({
        success: false,
        error: `No emailType found. Full body: ${JSON.stringify(body)}`
      });
    }

    if (!taskName) {
      console.error('[send-email] No task name found in body:', JSON.stringify(body));
      return res.status(400).json({
        success: false,
        error: `No taskName found. Full body: ${JSON.stringify(body)}`
      });
    }

    const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_PASS;
    const SMTP_FROM  = process.env.SMTP_FROM || EMAIL_USER;
    const SEND_TO    = recipient || EMAIL_USER;

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error('[send-email] No email credentials found');
      return res.status(500).json({ success: false, error: 'Email not configured' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const row = (label, value, color) =>
      `<tr>
        <td style="padding:8px;background:#f5f5f5;font-weight:bold;width:120px">${label}</td>
        <td style="padding:8px;${color ? `color:${color}` : ''}">${value || 'N/A'}</td>
      </tr>`;

    const wrap = (heading, color, rows) => `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;
                  border:1px solid #e0e0e0;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:20px 24px;
                    border-radius:8px;margin-bottom:20px;">
          <h2 style="color:white;margin:0;font-size:18px;">${heading}</h2>
        </div>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center;">
          Sent by Study Planner
        </p>
      </div>`;

    let subject = '';
    let html    = '';

    if (emailType === 'task_created') {
      subject = `New Task Added: ${taskName}`;
      html = wrap('📚 New Task Added', '#4f46e5',
        row('Title', taskName) +
        row('Priority', priority) +
        row('Due Date', taskDue) +
        row('Notes', notes || 'None')
      );
    } else if (emailType === 'priority_changed') {
      subject = `Priority Changed: ${taskName}`;
      html = wrap('⚠️ Priority Updated', '#f59e0b',
        row('Title', taskName) +
        row('Old Priority', changes.previousPriority, 'red') +
        row('New Priority', priority, 'green')
      );
    } else if (emailType === 'due_date_changed') {
      subject = `Due Date Updated: ${taskName}`;
      html = wrap('📅 Due Date Changed', '#10b981',
        row('Title', taskName) +
        row('Old Due Date', changes.previousDeadline, 'red') +
        row('New Due Date', taskDue, 'green')
      );
    } else if (emailType === 'title_updated') {
      subject = `Task Renamed: ${taskName}`;
      html = wrap('✏️ Task Renamed', '#6366f1',
        row('Old Title', changes.previousTitle, 'red') +
        row('New Title', taskName, 'green')
      );
    } else if (emailType === 'notes_updated') {
      subject = `Notes Updated: ${taskName}`;
      html = wrap('📝 Notes Updated', '#8b5cf6',
        row('Title', taskName) +
        row('Notes', notes || 'None')
      );
    } else {
      // Unknown type — still send a generic email instead of failing
      subject = `Study Planner Update: ${taskName}`;
      html = wrap('📚 Task Update', '#4f46e5',
        row('Title', taskName) +
        row('Type', emailType) +
        row('Due Date', taskDue) +
        row('Priority', priority)
      );
    }

    await transporter.sendMail({
      from: `"Study Planner" <${SMTP_FROM}>`,
      to: SEND_TO,
      subject,
      html,
    });

    console.log('[send-email] ✅ Sent:', subject, '->', SEND_TO);
    return res.status(200).json({ success: true, message: 'Email sent' });

  } catch (err) {
    console.error('[send-email] ❌ Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}