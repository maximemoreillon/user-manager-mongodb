const User = require('./models/user.js')
const Cookies = require('cookies')
const createHttpError = require('http-errors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// aliases for bcrypt functions
const hash_password = (password_plain) => bcrypt.hash(password_plain, 10)
const check_password = (password_plain, password_hashed) => bcrypt.compare(password_plain, password_hashed)

const retrieve_jwt = (req, res) => {

  return req.headers.authorization?.split(" ")[1]
    || (new Cookies(req, res)).get('jwt')
    || req.query.jwt
    || req.query.token

}

const generate_token = (user) => new Promise( (resolve, reject) => {
  const {JWT_SECRET} = process.env
  if (!JWT_SECRET) return reject(createHttpError(500, `Token secret not set`))
  const token_content = { user_id: user._id }
  jwt.sign(token_content, JWT_SECRET, (error, token) => {
    if (error) return reject(createHttpError(500,error))
    resolve(token)
    console.log(`[Auth] Token generated for user ${user._id}`)
  })
})


const decode_token = (token) => new Promise( (resolve, reject) => {
  const {JWT_SECRET} = process.env
  if (!JWT_SECRET) return reject(createHttpError(500, `Token secret not set`))
  jwt.verify(token, JWT_SECRET, (error, decoded_token) => {
    if (error) return reject(createHttpError(403, `Invalid JWT`))
    resolve(decoded_token)
    console.log(`[Auth] Token decoded successfully`)
  })
})

exports.login = async (req, res, next) => {

  try {
    // Todo: Register last login time
    const username = req.body.username || req.body.identifier
    const {password} = req.body

    // Todo: use JOY
    if (!username) throw createHttpError(400, `Missing username`)
    if (!password) throw createHttpError(400, `Missing password`)

    // currently, can only login using username
    const query = { username }

    const user = await User.findOne(query)
      .select('+password_hashed')

    if (!user) throw createHttpError(404, `User ${username} not found`) 

    // Prevent deactivated users from loggign in
    if (!user.activated && !user.isAdmin) throw createHttpError(403, `User ${username} is not activated`)

    const password_correct = await check_password(password, user.password_hashed)

    if (!password_correct) throw createHttpError(403, `Incorrect password`)

    const jwt = await generate_token(user)

    res.send({jwt})

    console.log(`[Auth] Successful login for user ${user._id}`)

  }
  catch (error) {
    next(error)
  }

}


exports.get_user_from_jwt = (req, res, next) => {
  res.status(501).send('not implemented')
}

exports.middleware = async (req, res, next) => {

  try {
    const token = retrieve_jwt(req, res)
    if(!token) throw `Missing JWT`
    const {user_id} = await decode_token(token)

    const user = await User.findOne({ _id: user_id })
      .select('+password_hashed')

    res.locals.user = user

    next()

  } 
  catch (error) {
    next(error)
  }
}

exports.middleware_lax = async (req, res, next) => {


  try {
    const token = retrieve_jwt(req, res)
    if(!token) throw `Missing JWT`
    const {user_id} = await decode_token(token)

    const user = await User.findOne({ _id: user_id })
      .select('+password_hashed')

    res.locals.user = user

  } 
  catch (error) {
    // Nothing
  }
  finally {
    next()
  }

}

exports.admin_only_middlware = (req, res, next) => {

  if(!res.locals.user?.isAdmin) {
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
