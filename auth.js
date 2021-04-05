const User = require('./models/user.js')
const bcrypt = require('bcrypt')

const check_password = (password_plain, user) => {
  return new Promise ( (resolve, reject) => {

    const password_hashed = user.password_hashed

    bcrypt.compare(password_plain, password_hashed, (error, password_correct) => {

      if(error) return reject({code: 500, message: error})

      if(!password_correct) return reject({code: 403, message: `Incorrect password`})

      resolve(user)

      console.log(`[Auth] Password correct for user ${user._id}`)

    })

  })
}

const generate_token = (user) => {
  return new Promise( (resolve, reject) => {

    const JWT_SECRET = process.env.JWT_SECRET

    // Check if the secret is set
    if(!JWT_SECRET) return reject({code: 500, message: `Token secret not set`})

    const token_content = { user_id: user._id }

    jwt.sign(token_content, JWT_SECRET, (error, token) => {

      // handle signing errors
      if(error) return reject({code: 500, message: error})

      // Resolve with token
      resolve(token)

      console.log(`[Auth] Token generated for user ${user._id}`)

    })
  })
}

exports.login = (req, res) => {
  const {email_address, username, password} = req.body

  if(!(email_address || username)) {
    return res.status(400).send(`Missing username or email address`)
  }

  if(!password)) {
    return res.status(400).send(`Missing password`)
  }

  const query = { $or: [
    { username: username },
    { email_address: email_address },
  ]}

  User.findById(query)
  .then( user => check_password(password, user) )
  .then( generate_token )
  .then( jwt => { res.send({jwt}) })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
}

exports.get_user_from_jwt = (req, res) => {
  res.send('not implemented')
}
