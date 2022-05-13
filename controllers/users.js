const createHttpError = require('http-errors')
const dotenv = require('dotenv')
const User = require('../models/user.js')
const { hash_password } = require('../auth.js')
const { passwordUpdateSchema } = require('../schemas/password.js')
const {
  send_activation_email,
  send_password_reset_email,
} = require('../mail.js')
const {
  newUserSchema,
  userUpdateSchema,
  userAdminUpdateSchema
} = require('../schemas/user.js')

dotenv.config()


exports.create_user = async (req, res, next) => {

  try {
    // Todo: validation with joy
    const properties = req.body
    // const { username, password, email_address } = req.body

    try {
      await newUserSchema.validateAsync(properties)
    }
    catch (error) {
      throw createHttpError(400, error)
    }

    const { username, password, email_address } = properties

    const current_user = res.locals.user
    const current_user_is_admin = current_user?.isAdmin

    // Email activation only necessary if user registers himself
    const activated = current_user_is_admin ? true : false

    if(!process.env.ALLOW_REGISTRATION && !current_user_is_admin) {
      throw createHttpError(403, `Registration is not allowed unless administrator`)
    }

    const password_hashed = await hash_password(password)

    const user = await User.create({
      username,
      password_hashed,
      email_address,
      display_name: username,
      creation_date: new Date(),
      activated,
    })

    // Send activation email if necessary
    const mail_options = {url: req.headers.origin, user}
    if(!activated) await send_activation_email(mail_options)

    res.send(user)
    console.log(`[Mongoose] User ${user._id} created`)



  }
  catch (error) {
    next(error)
  }

}

exports.delete_user = async (req, res, next) => {

  try {
    const {user} = res.locals
    let {user_id} = req.params

    if(user_id === 'self') user_id = user._id
    if (!user_id) throw createHttpError(400, `User ID not defined`)

    if(user._id.toString() !== user_id.toString() && !user.isAdmin) {
      throw createHttpError(403, `Not allowed to delete another user`)
    }

    await User.deleteOne({_id: user_id})

    res.send({_id: user_id})

    console.log(`[Mongoose] User ${user_id} deleted`)

  }  
  catch (error) {
    next(error)
  }
}

exports.update_user = async (req, res, next) => {

  try {

    const {user} = res.locals
    let {user_id} = req.params
    const properties = req.body

    if(user_id === 'self') user_id = user._id
    if (!user_id) throw createHttpError(400, `User ID not defined`)

    if(user._id.toString() !== user_id.toString() && !user.isAdmin) {
      throw createHttpError(403, `Not allowed to update another user`)
    }

    try {
      if (user.isAdmin) await userAdminUpdateSchema.validateAsync(properties)
      else await userUpdateSchema.validateAsync(properties)
    }
    catch (error) {
      throw createHttpError(403, error)
    }

    const result = await User.updateOne({_id: user_id}, properties)

    res.send(result)
    console.log(`[Mongoose] User ${user_id} updated`)

  }  
  catch (error) {
    next(error)
  }
}

exports.get_user = async (req, res, next) => {

  try {
    // Get user ID from query
    let {user_id} = req.params

    // If user is self, then use ID of user currently logged in
    if(user_id === 'self') user_id = res.locals.user
    if (!user_id) throw createHttpError(400, `User ID not defined`)

    const user = await User.findById(user_id)
    res.send(user)
    console.log(`[Mongoose] User ${user._id} queried`)
  }
  catch (error) {
    next(error)
  }

}

exports.update_password = async (req, res, next) => {

  try {

    try {
      await passwordUpdateSchema.validateAsync(req.body)
    }
    catch (error) {
      throw createHttpError(400, error.message)
    }

    const { new_password, new_password_confirm } = req.body


    const current_user = res.locals.user

    let user_id = req.params.user_id
    if(user_id === 'self') user_id = current_user._id

    if(String(user_id) !== String(current_user._id) && !current_user.isAdmin) {
      throw createHttpError(403, `Unauthorized to modify another user's password`)
    }

    const password_hashed = await hash_password(new_password)
    const result = await User.updateOne({_id: user_id}, {password_hashed})

    console.log(`[Mongoose] Password of user ${user_id} updated`)
    res.send(result)
  }

  catch (error) {
    next(error)
  }



}

exports.get_users = async (req, res, next) => {

  try {
    // TODO: filters
    const {
      skip = 0,
      limit = 50,
    } = req.query

    // A list of user IDs can be passed as filter
    let query = {}
    if(req.query.ids){
      query['$or'] = req.query.ids.map(_id => ({_id}) )
    }

    const count = await User.countDocuments({})

    const users = await User.find(query)
      .skip(Number(skip))
      .limit(Number(limit))

    console.log(`[Mongoose] Users queried`)

    res.send({users, count})

  }
  catch (error) {
    next(error)
  }

}

exports.password_reset = async (req, res, next) => {

  try {
    const { email_address } = req.body
    if (!email_address) throw createHttpError(400, `Missing email_address`)
    const user = await User.findOne({ email_address })
    if (!user) throw createHttpError(404, `User with email_address ${email_address} not found`)

    const mail_options = { url: req.headers.origin, user }
    await send_password_reset_email(mail_options)

    res.send({ email_address })

  }
  catch (error) {
    next(error)
  }


}

exports.create_admin_account = async () => {

  try {

    const {
      ADMIN_USERNAME: admin_username = 'admin',
      ADMIN_PASSWORD: admin_password = 'admin'
    } = process.env

    const password_hashed = await hash_password(admin_password)

    const admin = await User.create({
      username: admin_username,
      display_name: admin_username,
      isAdmin: true,
      activated: true,
      password_hashed,
      creation_date: new Date(),
    })

    console.log(`[Mongoose] Admin account created`)

  } 
  catch (error) {
    if(error.code === 11000) console.log(`[Mongoose] Admin account already exists`)
    else console.log(error)
  }

}


exports.rename_admin_property = async () => {
  // Used to rename field 'administrator' into 'isAdmin'
  // For compatibility with Neo4J version

  try {


    const actions = { $rename: { administrator: 'isAdmin' } }
    const options = { multi: true }

    await User.updateMany({}, actions, options)

    console.log(`[Mongoose] administrator property renamed`)

  } catch (error) {
    console.log(error)
  }

}