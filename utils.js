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

exports.hash_password = (password_plain) => {
  return new Promise ( (resolve, reject) => {
    bcrypt.hash(password_plain, 10, (error, password_hashed) => {
      if(error) return reject({code: 500, message: error})
      resolve(password_hashed)
      console.log(`[Bcrypt] Password hashed`)
    })
  })
}
