const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const auth = require('./auth.js')
dotenv.config()

const options = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_HOST,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
}

const transporter = nodemailer.createTransport(options)


const send_email = (email) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(email, (error, info) => {
      if (error) reject(error)
      else resolve(info)
    })
  })
}

const send_activation_email = async ({url,user}) => {

  try {
    const token = await auth.generate_token(user)

    const activation_email = {
      from: process.env.SMTP_FROM,
      to: user.email_address,
      subject: 'Account activation',
      text: `Click the following link to register your account: ${url}/activate?token=${token}`
    }

    await send_email(activation_email)

    console.log(`Send activation email to user ${user._id}`)
  } catch (e) {
    throw `Error while sending activation email: ${e}`
  }



}


exports.trasnporter = transporter
exports.options = options
exports.send_activation_email = send_activation_email
