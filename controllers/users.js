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

  const {user} = res.locals
  if(!user.administrator) {
    return res.status(403).send(`Not allowed to create user unless administrator`)
  }

  // Todo: validation with joy
  const {
    username,
    password,
  } = req.body

  if(!username) return res.status(400).send(`Username not defined`)
  if(!password) return res.status(400).send(`Password not defined`)

  hash_password(password)
  .then(password_hashed => {
    const new_user = new User({
      username,
      password_hashed,
      creation_date: new Date(),
    })
    return new_user.save()
  })
  .then((result) => {
    console.log(`[Mongoose] New user inserted`)
    res.send(result)
  })
  .catch(error => {
    console.log(error)
    if(error.code === 11000) {
      const message = `User ${username} already exists`
      console.log(`[Mongoose] User creation failed, user ${username} already exists`)
      return res.status(500).send(message)
    }
    res.status(500).send(error)
  })
}

exports.delete_user = (req, res) => {

  const {user_id} = req.params
  if(!user_id) return res.status(400).send(`User ID not defined`)

  const {user} = res.locals
  if(user._id.toString() !== user_id && !user.administrator) {
    return res.status(403).send(`Not allowed to delete another user`)
  }

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

  const {user} = res.locals
  let {user_id} = req.params
  if(user_id === 'self') user_id = user._id
  if(!user_id) return res.status(400).send(`User ID not defined`)

  if(user._id.toString() !== user_id && !user.administrator) {
    return res.status(403).send(`Not allowed to modify another user`)
  }

  let modifiable_properties = [
    'display_name',
    'avatar',
  ]

  if(user.administrator){
    modifiable_properties = modifiable_properties.concat([
      'administrator',
      'locked',
    ])
  }

  for (let [key, value] of Object.entries(req.body)) {
    if(!modifiable_properties.includes(key)) {
      console.log(`Unauthorized attempt to modify property ${key}`)
      return res.status(403).send(`Unauthorized to modify ${key}`)
    }
  }

  User.updateOne({_id: user_id}, req.body)
  .then((result) => {
    console.log(`[Mongoose] USer ${user_id} updated`)
    res.send(result)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
}

exports.get_user = (req, res) => {
  let {user_id} = req.params
  if(user_id === 'self') user_id = res.locals.user
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
  res.status(501).send('Not implemented')
}

exports.get_users = (req, res) => {
  // Todo: add skip and limit
  let query = {}

  if(req.query.ids){
    query['$or'] = req.query.ids.map(id => {return {_id: id}})
  }

  User.find(query)
  .skip(Number(req.query.skip || 0))
  .limit(Number(req.query.limit || 0))
  .then(users => {
    console.log(`[Mongoose] Users queried`)
    res.send(users)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
}

exports.get_user_count = (req, res) => {
  User.countDocuments({})
  .then(user_count => {
    console.log(`[Mongoose] User count queried`)
    res.send({user_count})
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
}

exports.create_admin_account = () => {

  const admin_username = process.env.ADMIN_USERNAME || 'admin'
  const admin_password = process.env.ADMIN_PASSWORD || 'admin'

  return hash_password(admin_password)
  .then(password_hashed => {
    const admin = new User({
      username: admin_username,
      display_name: admin_username,
      administrator: true,
      password_hashed,
      creation_date: new Date(),
    })
    return admin.save()
  })
  .then((result) => {
    console.log(`[Mongoose] Admin account created`)
  })
  .catch(error => {
    if(error.code === 11000) console.log(`[Mongoose] Admin account already exists`)
    else console.log(error)
    //reject(error)
  })



}
