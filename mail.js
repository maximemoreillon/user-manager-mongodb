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


const send_activation_email = (user) => {

  console.log(user)


  auth.generate_token(user)
  .then((token) => {
    const activation_email = {
      from: process.env.SMTP_FROM,
      to: user.email_address,
      subject: 'Account activation',
      text: `Click the following link to register your account: ${process.env.FRONT_URL}/activate?token=${token}`
    }

    transporter.sendMail(activation_email, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    })

  })
  .catch(error => {
    console.log(error)
  })


}




// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// })

exports.trasnporter = transporter
exports.options = options
exports.send_activation_email = send_activation_email
