// v5 - uses _mailer.js, matched to useTasks.js payload
import { sendMail } from './_mailer.js';

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

    // useTasks.js sends: eventType, taskTitle, dueDate, priority, notes, to, userName, changes
    const {
      eventType, type,
      taskTitle, title,
      dueDate, deadline,
      priority, notes,
      to, userName, changes,
    } = body;

    const emailType = eventType || type;
    const taskName  = taskTitle || title;
    const taskDue   = dueDate || deadline;
    const recipient = to || process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER;

    console.log('[send-email] Resolved → type:', emailType, 'task:', taskName, 'to:', recipient);

    if (!emailType || !taskName) {
      return res.status(400).json({
        success: false,
        error: `Missing fields. Got: ${JSON.stringify({ emailType, taskName })}`,
      });
    }

    const tableRow = (label, value, color = '') =>
      `<tr>
        <td style="padding:8px;background:#f5f5f5;font-weight:bold">${label}</td>
        <td style="padding:8px;${color ? `color:${color}` : ''}">${value || 'N/A'}</td>
      </tr>`;

    const wrapper = (heading, color, rows) => `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <h2 style="color:${color}">${heading}</h2>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
      </div>`;

    let subject = '';
    let html = '';

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
      html = wrapper('Notes Updated', '#8b5cf6',
        tableRow('Title', taskName) +
        tableRow('Notes', notes || 'None')
      );
    } else {
      return res.status(400).json({ success: false, error: `Unknown type: ${emailType}` });
    }

  const result = await sendMail({ to: recipient, subject, html });

// sendMail returns true/false not {success}
if (!result) {
  return res.status(500).json({ success: false, error: 'Email failed to send' });
}

console.log('[send-email] Email sent:', subject, '->', recipient);
return res.status(200).json({ success: true, message: 'Email sent' });

  } catch (err) {
    console.error('[send-email] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}