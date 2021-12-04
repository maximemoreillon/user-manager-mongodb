const User = require('../models/user.js')
const dotenv = require('dotenv')
const { hash_password } = require('../auth.js')
const {
  send_activation_email,
  send_password_reset_email,
} = require('../mail.js')
const { error_handling } = require('../utils.js')

dotenv.config()

const restrict_modifyable_properties = (properties, user) => {

  // Allow users to only modify some properties
  let modifiable_properties = [
    'display_name',
    'avatar',
    'activated', // allowing users to activate their own accounts
  ]

  if(user.administrator){
    modifiable_properties = modifiable_properties.concat([
      'administrator',
      'locked',
      'email_address',
      'username',
    ])
  }

  for (let [key, value] of Object.entries(properties)) {
    if(!modifiable_properties.includes(key)) {
      console.log(`Unauthorized attempt to modify property ${key}`)
      throw {code: 403, message: `Unauthorized to modify ${key}`}
    }
  }
}

exports.create_user = async (req, res) => {

  try {
    // Todo: validation with joy
    const { username, password, email_address} = req.body

    // Those woule be caught by mongoose
    // Email is caught by mongoose
    if(!username) throw {code: 400, message: `Username not defined`}
    if(!password) throw {code: 400, message: `Password not defined`}

    // Email activation only necessary if user registers himself
    const activated = res.locals.user?.administrator ? true : false

    if(!process.env.ALLOW_REGISTRATION && !res.locals.user?.administrator) {
      throw {code: 404, message: `Registration is not allowed unless administrator`}
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
    error_handling(error,res)
  }

}

exports.delete_user = async (req, res) => {

  try {
    const {user} = res.locals
    let {user_id} = req.params

    if(user_id === 'self') user_id = user._id
    if(!user_id) throw {code: 400, message: `User ID not defined`}

    if(user._id.toString() !== user_id.toString() && !user.administrator) {
      throw {code: 403, message: `Not allowed to delete another user`}
    }

    await User.deleteOne({_id: user_id})

    res.send({_id: user_id})

    console.log(`[Mongoose] User ${user_id} deleted`)

  }  catch (error) {
    error_handling(error,res)
  }
}

exports.update_user = async (req, res) => {

  try {

    const {user} = res.locals
    let {user_id} = req.params
    const properties = req.body

    if(user_id === 'self') user_id = user._id
    if(!user_id) return res.status(400).send(`User ID not defined`)

    if(user._id.toString() !== user_id.toString() && !user.administrator) {
      throw {code: 403, message: `Not allowed to update another user`}
    }

    restrict_modifyable_properties(properties, user)

    const result = await User.updateOne({_id: user_id}, properties)

    res.send(result)
    console.log(`[Mongoose] User ${user_id} updated`)

  }  catch (error) {
    error_handling(error,res)
  }
}

exports.get_user = async (req, res) => {

  try {
    // Get user ID from query
    let {user_id} = req.params

    // If user is self, then use ID of user currently logged in
    if(user_id === 'self') user_id = res.locals.user
    if(!user_id) throw {code: 400, message: `User ID not defined`}

    const user = await User.findById(user_id)
    res.send(user)
    console.log(`[Mongoose] User ${user._id} queried`)
  }
  catch (error) {
    error_handling(error,res)
  }

}

exports.update_password = async (req, res) => {

  try {
    //const {new_password, new_password_confirm, current_password} = req.body
    const {new_password, new_password_confirm} = req.body

    if(!new_password) throw {code: 400, message: `Missing password`}
    if(!new_password_confirm) throw {code: 400, message: `Missing password confirm`}
    if(new_password !== new_password_confirm) throw {code: 400, message: `Password confirm mismatch`}

    const current_user = res.locals.user

    let user_id = req.params.user_id
    if(user_id === 'self') user_id = current_user._id

    if(String(user_id) !== String(current_user._id) && !current_user.administrator) {
      throw {code: 400, message: `Unauthorized to modify another user's password`}
    }

    const password_hashed = await hash_password(new_password)
    const result = await User.updateOne({_id: user_id}, {password_hashed})

    console.log(`[Mongoose] Password of user ${user_id} updated`)
    res.send(result)
  }

  catch (error) {
    error_handling(error,res)
  }



}

exports.get_users = async (req, res) => {

  try {
    // TODO: More filters and pagination

    // A list of user IDs can be passed as filter
    let query = {}
    if(req.query.ids){
      query['$or'] = req.query.ids.map(_id => ({_id}) )
    }

    const users = await User.find(query)
      .skip(Number(req.query.skip || 0))
      .limit(Number(req.query.limit || 0))

    res.send(users)
    console.log(`[Mongoose] Users queried`)

  }
  catch (error) {
    error_handling(error,res)
  }

}

exports.get_user_count = async (req, res) => {

  // this should be combined with the above

  try {
    const user_count = await User.countDocuments({})
    res.send({user_count})
    console.log(`[Mongoose] User count queried`)
  }
  catch (error) {
    error_handling(error,res)
  }
}

exports.create_admin_account = async () => {

  // destructuring with default values
  try {

    const {
      ADMIN_USERNAME: admin_username = 'admin',
      ADMIN_PASSWORD: admin_password = 'admin'
    } = process.env

    const password_hashed = await hash_password(admin_password)

    const admin = await User.create({
      username: admin_username,
      display_name: admin_username,
      administrator: true,
      activated: true,
      password_hashed,
      creation_date: new Date(),
    })

    console.log(`[Mongoose] Admin account created`)

  } catch (error) {
    if(error.code === 11000) console.log(`[Mongoose] Admin account already exists`)
    else console.log(error)
  }

}


exports.password_reset = async (req, res) => {
  try {
    const {email_address} = req.body
    if(!email_address) throw {code: 400, message: `Missing email_address`}
    const user = await User.findOne({email_address})
    if(!user) throw {code: 400, message: `User with email_address ${email_address} not found`}

    const mail_options = {url: req.headers.origin, user}
    await send_password_reset_email(mail_options)

    res.send({email_address})

  }
  catch (error) {
    error_handling(error,res)
  }


}
