import nodemailer from "nodemailer"
import { generate_token } from "./auth"

// parsing environment
const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM } =
  process.env

export const options = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
  secure: true, // upgrade later with STARTTLS
}

export const transporter = nodemailer.createTransport(options as any)

export const send_activation_email = async ({ url, user }: any) => {
  try {
    const { email_address } = user
    const token = await generate_token(user)

    const email = {
      from: SMTP_FROM,
      to: email_address,
      subject: "Account activation",
      text: `Click the following link to register your account: ${url}/activate?token=${token}`,
    }

    await transporter.sendMail(email)

    console.log(`[Mail] Sent activation email to user ${email_address}`)
  } catch (e) {
    throw `Error while sending email: ${e}`
  }
}

export const send_password_reset_email = async ({ url, user }: any) => {
  try {
    const { email_address } = user
    const token = await generate_token(user)

    const email = {
      from: SMTP_FROM,
      to: email_address,
      subject: "Password reset",
      text: `Click the following link to reset your password: ${url}/password_update?token=${token}`,
    }

    await transporter.sendMail(email)

    console.log(`[Mail] Sent password reset email to user ${email_address}`)
  } catch (e) {
    throw `Error while sending email: ${e}`
  }
}
