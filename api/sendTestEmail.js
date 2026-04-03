import nodemailer from "nodemailer";

export default async function handler(req, res) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    await transporter.sendMail({
      from: `"Study Planner" <${gmailUser}>`,
      to: gmailUser, // send to yourself for testing
      subject: "Test Task Reminder",
      text: "This is a test email from Study Planner!",
    });
    res.status(200).send("Test email sent successfully ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending email ❌");
  }
}