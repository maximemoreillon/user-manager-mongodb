const User = require('./models/user.js')
const Cookies = require('cookies')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { error_handling } = require('./utils.js')

// aliases for bcrypt functions
const hash_password = (password_plain) => bcrypt.hash(password_plain, 10)
const check_password = (password_plain, password_hashed) => bcrypt.compare(password_plain, password_hashed)

const retrieve_jwt = (req, res) => new Promise( (resolve, reject) => {

  const jwt = req.headers.authorization?.split(" ")[1]
    || (new Cookies(req, res)).get('jwt')
    || req.query.jwt
    || req.query.token

  if(!jwt) return reject(`JWT not provided`)

  resolve(jwt)
})

const generate_token = (user) => new Promise( (resolve, reject) => {
  const {JWT_SECRET} = process.env
  if(!JWT_SECRET) return reject({code: 500, message: `Token secret not set`})
  const token_content = { user_id: user._id }
  jwt.sign(token_content, JWT_SECRET, (error, token) => {
    if(error) return reject({code: 500, message: error})
    resolve(token)
    console.log(`[Auth] Token generated for user ${user._id}`)
  })
})


const decode_token = (token) => new Promise( (resolve, reject) => {
  const {JWT_SECRET} = process.env
  if(!JWT_SECRET) return reject({code: 500, message: `JWT_SECRET not set`})
  jwt.verify(token, JWT_SECRET, (error, decoded_token) => {
    if(error) return reject({code: 403, message: `Invalid JWT`})
    resolve(decoded_token)
    console.log(`[Auth] Token decoded successfully`)
  })
})

exports.login = async (req, res) => {

  try {
    // Todo: Register last login time
    const username = req.body.username || req.body.identifier
    const {password} = req.body

    // Todo: use JOY
    if(!username) throw {code: 400, message: `Missing username`}
    if(!password) throw {code: 400, message: `Missing password`}

    // currently, can only login using username
    const query = { username }

    const user = await User.findOne(query)
      .select('+password_hashed')

    if(!user) throw {code: 403, message: `User ${username} not found`}

    // Prevent deactivated users from loggign in
    if(!user.activated && !user.administrator) throw {code: 403, message: `User ${username} is not activated`}

    const password_correct = await check_password(password, user.password_hashed)

    if(!password_correct) throw {code: 403, message: `Incorrect password`}

    const jwt = await generate_token(user)

    res.send({jwt})

    console.log(`[Auth] Successful login for user ${user._id}`)

  }
  catch (error) {
    error_handling(error,res)
  }

}

exports.get_user_from_jwt = (req, res) => {
  res.status(501).send('not implemented')
}

exports.middleware = async (req, res, next) => {

  try {
    const token = await retrieve_jwt(req, res)
    const {user_id} = await decode_token(token)

    const user = await User.findOne({ _id: user_id })
      .select('+password_hashed')

    res.locals.user = user

    next()

  } catch (error) {
    error_handling(error,res)
  }
}

exports.middleware_lax = async (req, res, next) => {


  try {
    const token = await retrieve_jwt(req, res)
    const {user_id} = await decode_token(token)

    const user = await User.findOne({ _id: user_id })
      .select('+password_hashed')

    res.locals.user = user

  } catch (error) {
    // Nothing
  }
  finally {
    next()
  }

}

exports.admin_only_middlware = (req, res, next) => {

  if(!res.locals.user?.administrator) {
    const message = `This resource is only available to administrators`
    console.log(`[Auth] ${message}`)
    res.status(403).send(message)
    return
  }

  next()
}


exports.decode_token = decode_token
exports.generate_token = generate_token
exports.check_password = check_password
exports.hash_password = hash_password
