import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { generate_token } from "./auth"

dotenv.config()

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

const send_email = (email: any) =>
  new Promise((resolve, reject) => {
    // This might already be a promise
    transporter.sendMail(email, (error: any, info: any) => {
      if (error) reject(error)
      else resolve(info)
    })
  })

export const send_activation_email = async ({ url, user }: any) => {
  try {
    const { email_address } = user
    const token = await generate_token(user)

    const activation_email = {
      from: SMTP_FROM,
      to: email_address,
      subject: "Account activation",
      text: `Click the following link to register your account: ${url}/activate?token=${token}`,
    }

    await send_email(activation_email)

    console.log(`[Mail] Sent activation email to user ${email_address}`)
  } catch (e) {
    throw `Error while sending email: ${e}`
  }
}

export const send_password_reset_email = async ({ url, user }: any) => {
  try {
    const { email_address } = user
    const token = await generate_token(user)

    const activation_email = {
      from: SMTP_FROM,
      to: email_address,
      subject: "Password reset",
      text: `Click the following link to reset your password: ${url}/password_update?token=${token}`,
    }

    await send_email(activation_email)

    console.log(`[Mail] Sent password reset email to user ${email_address}`)
  } catch (e) {
    throw `Error while sending email: ${e}`
  }
}
