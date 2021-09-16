const mongoose = require('mongoose')

const userSchema = {
  username: {type: String, unique: true, trim: true, required: true},
  email_address: {type: String, unique: true, trim: true, sparse: true},
  password_hashed: { type: String, required: true, select: false },
  display_name: String,
  avatar: String,
  locked: Boolean,
  administrator: Boolean,
  last_login: Date,
  creation_date: Date,
  activated: {type: Boolean, default: false},
  locked: {type: Boolean, default: false},
}

const User = mongoose.model('User', userSchema)

module.exports = User
