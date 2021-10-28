const bcrypt = require('bcrypt')

exports.error_handling = (error, res) => {

  if(error.code === 11000) {
    console.log(`Account creation failed: Username or e-mail address already taken`)
    return res.status(400).send(`Username or e-mail address already taken`)
  }

  let status_code = error.code || 500
  const message = error.message || error
  res.status(status_code).send(message)
  console.log(message)
}
