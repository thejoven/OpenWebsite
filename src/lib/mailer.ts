import nodemailer from "nodemailer";

type SubmissionEmail = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  sourcePage?: string | null;
};

export async function notifyContactSubmission(submission: SubmissionEmail) {
  if (!process.env.SMTP_HOST || !process.env.ADMIN_EMAIL) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
  });

  await transporter.sendMail({
    to: process.env.ADMIN_EMAIL,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.ADMIN_EMAIL,
    subject: `New contact submission from ${submission.name}`,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || "-"}`,
      `Source: ${submission.sourcePage || "-"}`,
      "",
      submission.message
    ].join("\n")
  });
}
