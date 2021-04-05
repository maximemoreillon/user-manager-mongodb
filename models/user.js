const mongoose = require('mongoose')

const userSchema = {
  username: {type: String, unique: true},
  email_address: String,
  password_hashed: String,
  display_name: String,
  avatar: String,
  locked: Boolean,
  administrator: Boolean,
  last_login: Date,
  creation_date: Date,
}

const User = mongoose.model('User', userSchema)

module.exports = User
