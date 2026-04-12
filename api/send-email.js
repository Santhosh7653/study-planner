// v4 - matched to useTasks.js payload shape
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
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    if (!body || typeof body !== 'object') body = {};

    console.log('[send-email] Received body:', JSON.stringify(body));

    // useTasks.js sends: eventType, taskTitle, priority, dueDate, notes, to, userName, changes
    const {
      type,        // fallback
      eventType,   // useTasks.js sends this
      title,       // fallback
      taskTitle,   // useTasks.js sends this
      priority,
      dueDate,
      deadline,
      notes,
      to,
      userName,
      changes,
    } = body;

    // Normalize field names
    const emailType = eventType || type;
    const taskName  = taskTitle || title;
    const taskDue   = dueDate || deadline;
    const recipient = to || process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER;

    console.log('[send-email] Resolved → type:', emailType, 'task:', taskName, 'to:', recipient);

    if (!emailType || !taskName) {
      console.error('[send-email] Missing fields. emailType:', emailType, 'taskName:', taskName);
      return res.status(400).json({
        success: false,
        error: `Missing required fields. Got: ${JSON.stringify({ eventType, type, taskTitle, title })}`,
      });
    }

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const SMTP_FROM  = process.env.SMTP_FROM || EMAIL_USER;

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

    const tableRow = (label, value, color = '') =>
      `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">${label}</td><td style="padding:8px;${color ? `color:${color}` : ''}">${value || 'N/A'}</td></tr>`;

    const wrapper = (title, color, rows) => `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <h2 style="color:${color}">${title}</h2>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
      </div>
    `;

    if (emailType === 'task_created') {
      subject = `New Task Added: ${taskName}`;
      html = wrapper('New Task Added', '#4f46e5',
        tableRow('Title', taskName) +
        tableRow('Priority', priority) +
        tableRow('Due Date', taskDue) +
        tableRow('Notes', notes || 'None')
      );
    } else if (emailType === 'priority_changed') {
      subject = `Priority Changed: ${taskName}`;
      html = wrapper('Priority Updated', '#f59e0b',
        tableRow('Title', taskName) +
        tableRow('Old Priority', changes?.previousPriority, 'red') +
        tableRow('New Priority', priority, 'green')
      );
    } else if (emailType === 'due_date_changed') {
      subject = `Due Date Updated: ${taskName}`;
      html = wrapper('Due Date Changed', '#10b981',
        tableRow('Title', taskName) +
        tableRow('Old Due Date', changes?.previousDeadline, 'red') +
        tableRow('New Due Date', taskDue, 'green')
      );
    } else if (emailType === 'title_updated') {
      subject = `Task Renamed: ${taskName}`;
      html = wrapper('Task Title Updated', '#6366f1',
        tableRow('Old Title', changes?.previousTitle, 'red') +
        tableRow('New Title', taskName, 'green')
      );
    } else if (emailType === 'notes_updated') {
      subject = `Notes Updated: ${taskName}`;
      html = wrapper('Task Notes Updated', '#8b5cf6',
        tableRow('Title', taskName) +
        tableRow('Notes', notes || 'None')
      );
    } else {
      return res.status(400).json({ success: false, error: `Unknown email type: ${emailType}` });
    }

    await transporter.sendMail({
      from: `"Study Planner" <${SMTP_FROM}>`,
      to: recipient,
      subject,
      html,
    });

    console.log('[send-email] Email sent:', subject, '->', recipient);
    return res.status(200).json({ success: true, message: 'Email sent' });

  } catch (err) {
    console.error('[send-email] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}