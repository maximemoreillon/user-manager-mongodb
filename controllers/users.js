const User = require('../models/user.js')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()

const hash_password = (password_plain) => {
  return new Promise ( (resolve, reject) => {
    bcrypt.hash(password_plain, 10, (error, password_hashed) => {
      if(error) return reject({code: 500, message: error})
      resolve(password_hashed)
      console.log(`[Bcrypt] Password hashed`)
    })
  })
}

exports.create_user = (req, res) => {
  const new_user = new User(req.body)

  // Todo: Validation
  // Todo: Check if user exists already

  new_user.save()
  .then((result) => {
    console.log(`[Mongoose] New user inserted`)
    res.send(result)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send('Error')
  })
}

exports.delete_user = (req, res) => {
  const {user_id} = req.params
  if(!user_id) return res.status(400).send(`User ID not defined`)

  User.deleteOne({_id: user_id})
  .then(() => {
    console.log(`[Mongoose] User ${user_id} deleted`)
    res.send(`User ${user_id} deleted`)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
}

exports.update_user = (req, res) => {

  const modifiable_properties = [
    'display_name',
    'avatar',
  ]

  res.send('Not implemented')

}

exports.get_user = (req, res) => {
  const {user_id} = req.params
  if(!user_id) return res.status(400).send(`User ID not defined`)

  User.findById(user_id)
  .then(user => {
    console.log(`[Mongoose] User ${user._id} queried`)
    res.send(user)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
}

exports.update_password = (req, res) => {

}

exports.get_users = (req, res) => {
  User.find({})
  .then(groups => {
    console.log(`[Mongoose] Users queried`)
    res.send(groups)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
}

exports.create_admin_account = () => {

  const admin_password = process.env.ADMIN_PASSWORD || 'admin'

  hash_password(admin_password)
  .then(password_hashed => {
    const admin = new User({
      name: 'admin',
      display_name: 'Administrator',
      email_address: 'admin@usermanager.com',
      password_hashed,
    })
    return admin.save()
  })
  .then((result) => {
    console.log(`[Mongoose] Admin account created`)
  })
  .catch(error => {
    if(error.code === 11000) console.log(`[Mongoose] Admin account already exists`)
    else console.log(error)
  })
}
