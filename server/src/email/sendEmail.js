// Gmail Logic
// import nodemailer from "nodemailer";

// export async function sendQuoteEmail({ to, subject, html }) {
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     throw new Error("Missing EMAIL_USER or EMAIL_PASS in .env");
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail", // easiest starter option
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const info = await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     html,
//   });

//   return info;
// }

// Resend Logic
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendQuoteEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in .env");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
}