/**
 * POST /api/send-email
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const {
      to,
      eventType,
      taskTitle,
      priority,
      dueDate,
      notes = '',
      userName,
      changes = {},
      task,
      previousTask,
    } = req.body ?? {}

    // ✅ Get recipient safely
    const recipient = to || req.body.userEmail || req.body.email

    // ✅ Resolve final values
    const finalTitle = taskTitle || task?.title
    const finalPriority = priority || task?.priority
    const finalDueDate = dueDate || task?.deadline || task?.dueDate

    // ✅ Validation
    if (!recipient || !eventType || !finalTitle || !finalPriority || !finalDueDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, eventType, taskTitle, priority, dueDate',
      })
    }

    // ✅ Prepare payload
    const emailPayload = {
      eventType,
      taskTitle: finalTitle,
      priority: finalPriority,
      dueDate: finalDueDate,
      notes: notes || task?.notes || '',
      userName: userName || 'there',
      changes: {
        previousPriority: changes.previousPriority || previousTask?.priority,
        previousDeadline:
          changes.previousDeadline ||
          previousTask?.deadline ||
          previousTask?.dueDate,
        previousTitle: changes.previousTitle || previousTask?.title,
        previousNotes: changes.previousNotes || previousTask?.notes,
      },
    }

    // ✅ Import email service
    const { buildEventEmail, sendMail } = await import('../lib/emailService.js')

    // ✅ Generate email content
    const { subject, html } = buildEventEmail(emailPayload)

    console.log('[send-email] Sending email to:', recipient)

    // ✅ Send email
    const result = await sendMail({
      to: recipient,
      subject,
      html,
    })

    // ✅ Handle failure properly
    if (!result.success) {
      console.error('[send-email] Email sending failed:', result.reason)
      return res.status(500).json({
        success: false,
        error: 'Failed to send email',
        reason: result.reason,
      })
    }

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    })

  } catch (err) {
    console.error('[send-email] Handler error:', err)

    return res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    })
  }
}