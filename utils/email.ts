import nodemailer from "nodemailer";

const STMP_HOST = process.env.EMAIL_STMP_HOST!;
const STMP_PORT = process.env.EMAIL_STMP_PORT!;
const STMP_USER = process.env.EMAIL_STMP_USER!;
const STMP_PASSWORD = process.env.EMAIL_STMP_PASS!;
const FROM = process.env.EMAIL_FROM!;

console.table({
  STMP_HOST,
  STMP_PORT,
  STMP_USER,
  STMP_PASSWORD,
  FROM,
});

const transporter = nodemailer.createTransport({
  host: STMP_HOST,
  port: Number(STMP_PORT),
  secure: true,
  auth: {
    user: STMP_USER,
    pass: STMP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    text,
  });
};
