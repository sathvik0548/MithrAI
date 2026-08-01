import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (email, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to AI Placement Career Accelerator",
    html: `
      <h2>Hello ${name},</h2>

      <p>Your account has been created successfully.</p>

      <p>Welcome to the AI Placement Career Accelerator platform.</p>

      <br>

      <p>Happy Learning!</p>
    `,
  });
};