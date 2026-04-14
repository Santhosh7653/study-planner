// Production-ready Vercel serverless function for email notifications
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`[send-email] ❌ Method not allowed: ${req.method}`);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    // Manual body parsing for Vercel serverless (most reliable)
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk.toString(); });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    console.log('[send-email] 📨 Raw body received:', rawBody);

    // Parse JSON body
    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch (e) {
        console.error('[send-email] ❌ JSON parse error:', e.message);
        return res.status(400).json({
          success: false,
          error: `Invalid JSON body: ${e.message}`
        });
      }
    }

    console.log('[send-email] 📋 Parsed body:', JSON.stringify(body));

    // Extract and validate required fields with fallbacks
    const emailType = body.eventType || body.type || '';
    const taskName  = body.taskTitle || body.title ||
                      (typeof body.task === 'string' ? body.task : body.task?.title) || '';
    const taskDue   = body.dueDate || body.deadline || body.task?.deadline || '';
    const priority  = body.priority || body.task?.priority || '';
    const notes     = body.notes || body.task?.notes || '';
    const changes   = body.changes || {};
    const userName  = body.userName || 'there';
    const recipient = body.to || body.userEmail || body.email ||
                      process.env.RECIPIENT_EMAIL ||
                      process.env.EMAIL_USER ||
                      process.env.GMAIL_USER || '';

    console.log('[send-email] 🔍 Resolved fields:', {
      emailType,
      taskName,
      recipient,
      hasCredentials: !!(process.env.EMAIL_USER || process.env.GMAIL_USER)
    });

    // Validation
    if (!emailType) {
      console.error('[send-email] ❌ Missing emailType');
      return res.status(400).json({
        success: false,
        error: `Missing emailType. Received body: ${JSON.stringify(body)}`
      });
    }

    if (!taskName) {
      console.error('[send-email] ❌ Missing taskName');
      return res.status(400).json({
        success: false,
        error: `Missing taskName. Received body: ${JSON.stringify(body)}`
      });
    }

    // Email credentials validation
    const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_PASS;
    const SEND_TO    = recipient || EMAIL_USER;

    console.log('[send-email] 🔐 Email config:', {
      user: EMAIL_USER ? 'SET' : 'MISSING',
      pass: EMAIL_PASS ? 'SET' : 'MISSING',
      recipient: SEND_TO
    });

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error('[send-email] ❌ Missing email credentials');
      return res.status(500).json({
        success: false,
        error: 'Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.'
      });
    }

    if (!SEND_TO) {
      console.error('[send-email] ❌ No recipient email');
      return res.status(400).json({
        success: false,
        error: 'No recipient email provided'
      });
    }

    // Create Nodemailer transporter with explicit Gmail SMTP config
    console.log('[send-email] 📧 Creating transporter...');
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      },
      // Additional options for reliability
      pool: true,
      maxConnections: 1,
      maxMessages: 5
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('[send-email] ✅ Transporter verified');
    } catch (verifyError) {
      console.error('[send-email] ❌ Transporter verification failed:', verifyError.message);
      return res.status(500).json({
        success: false,
        error: `Email configuration error: ${verifyError.message}`
      });
    }

    // HTML email templates
    const row = (label, value, color = '') =>
      `<tr>
        <td style="padding:8px;background:#f5f5f5;font-weight:bold;width:130px">${label}</td>
        <td style="padding:8px${color ? `;color:${color}` : ''}">${value || 'N/A'}</td>
      </tr>`;

    const wrap = (heading, rows) => `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;
                  border:1px solid #e0e0e0;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);
                    padding:20px 24px;border-radius:8px;margin-bottom:20px;">
          <h2 style="color:white;margin:0;font-size:18px;">${heading}</h2>
        </div>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
          Sent by Study Planner
        </p>
      </div>`;

    // Generate email content based on event type
    let subject, html;

    switch (emailType) {
      case 'task_created':
        subject = `New Task Added: ${taskName}`;
        html = wrap('📚 New Task Added',
          row('Title', taskName) +
          row('Priority', priority) +
          row('Due Date', taskDue) +
          row('Notes', notes || 'None')
        );
        break;

      case 'priority_changed':
        subject = `Priority Changed: ${taskName}`;
        html = wrap('⚠️ Priority Updated',
          row('Title', taskName) +
          row('Old Priority', changes.previousPriority, 'red') +
          row('New Priority', priority, 'green')
        );
        break;

      case 'due_date_changed':
        subject = `Due Date Updated: ${taskName}`;
        html = wrap('📅 Due Date Changed',
          row('Title', taskName) +
          row('Old Due Date', changes.previousDeadline, 'red') +
          row('New Due Date', taskDue, 'green')
        );
        break;

      case 'title_updated':
        subject = `Task Renamed: ${taskName}`;
        html = wrap('✏️ Task Renamed',
          row('Old Title', changes.previousTitle, 'red') +
          row('New Title', taskName, 'green')
        );
        break;

      case 'notes_updated':
        subject = `Notes Updated: ${taskName}`;
        html = wrap('📝 Notes Updated',
          row('Title', taskName) +
          row('Notes', notes || 'None')
        );
        break;

      default:
        subject = `Study Planner Update: ${taskName}`;
        html = wrap('📚 Task Update',
          row('Title', taskName) +
          row('Event', emailType) +
          row('Due Date', taskDue) +
          row('Priority', priority)
        );
    }

    // Send email
    console.log('[send-email] 📤 Sending email:', { subject, to: SEND_TO });
    const mailResult = await transporter.sendMail({
      from: `"Study Planner" <${EMAIL_USER}>`,
      to: SEND_TO,
      subject,
      html,
    });

    console.log('[send-email] ✅ Email sent successfully:', {
      messageId: mailResult.messageId,
      subject,
      recipient: SEND_TO
    });

    // Close transporter
    transporter.close();

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: mailResult.messageId
    });

  } catch (err) {
    console.error('[send-email] ❌ Unexpected error:', err.message);
    console.error('[send-email] Stack trace:', err.stack);

    return res.status(500).json({
      success: false,
      error: `Server error: ${err.message}`
    });
  }
}