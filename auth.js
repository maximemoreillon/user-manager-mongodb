const User = require('./models/user.js')
const Cookies = require('cookies')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const check_password = (password_plain, user) => {
  // need to be passed user so as to continue chain
  return new Promise ( (resolve, reject) => {
    bcrypt.compare(password_plain, user.password_hashed, (error, password_correct) => {
      if(error) return reject({code: 500, message: error})
      if(!password_correct) return reject({code: 403, message: `Incorrect password`})
      resolve(user)
      console.log(`[Auth] Password correct for user ${user._id}`)
    })
  })
}

exports.check_password = check_password

const generate_token = (user) => {
  return new Promise( (resolve, reject) => {
    const JWT_SECRET = process.env.JWT_SECRET
    if(!JWT_SECRET) return reject({code: 500, message: `Token secret not set`})
    const token_content = { user_id: user._id }
    jwt.sign(token_content, JWT_SECRET, (error, token) => {
      if(error) return reject({code: 500, message: error})
      resolve(token)
      console.log(`[Auth] Token generated for user ${user._id}`)
    })
  })
}

exports.generate_token = generate_token

const decode_token = (token) => {
  return new Promise( (resolve, reject) => {
    const JWT_SECRET = process.env.JWT_SECRET
    if(!JWT_SECRET) return reject({code: 500, message: `JWT_SECRET not set`})
    jwt.verify(token, JWT_SECRET, (error, decoded_token) => {
      if(error) return reject({code: 403, message: `Invalid JWT`})
      resolve(decoded_token)
      console.log(`[Auth] Token decoded successfully`)
    })
  })
}

exports.decode_token = decode_token

const retrieve_jwt = (req, res) => {
  return new Promise( (resolve, reject) => {
    let jwt = undefined

    // See if jwt available from authorization header
    if(!jwt){
      if(('authorization' in req.headers)) {
        jwt = req.headers.authorization.split(" ")[1]
      }
    }

    // Try to get JWT from cookies
    if(!jwt) {
      let cookies = new Cookies(req, res)
      jwt = cookies.get('jwt')
    }

    if(!jwt) {
      return reject(`JWT not found in either cookies or authorization header`)
    }

    resolve(jwt)
  })

}



exports.login = (req, res) => {

  const {username, password} = req.body

  // Todo: use JOY
  if(!username) return res.status(400).send(`Missing username`)
  if(!password) return res.status(400).send(`Missing password`)

  const query = { username }

  User.findOne(query)
  .then( user => {
    if(!user) throw `User ${username} not found`
    return check_password(password, user)
  })
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

exports.middleware = (req, res, next) => {
  retrieve_jwt(req, res)
   .then(decode_token)
   .then(({user_id}) => {
     return User.findOne({_id: user_id})
   })
   .then( user => {
     res.locals.user = user
     next()
   })
   .catch( error => {
    console.log(error)
    res.status(403).send(error)
  })
}
