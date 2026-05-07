import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html,attachments) => {
 const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  const info = await transporter.sendMail({
    from: `"Unify" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
    attachments: attachments || []
  });

};