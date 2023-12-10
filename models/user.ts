import { Schema, model } from "mongoose"

const userSchema = new Schema({
  username: { type: String, unique: true, trim: true, required: true },
  email_address: { type: String, unique: true, trim: true, sparse: true },
  password_hashed: { type: String, required: true, select: false },
  display_name: String,
  avatar_src: String,
  isAdmin: Boolean,
  last_login: Date,
  creation_date: Date,
  activated: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },

  token_id: {type: String},

  // Legacy
  administrator: Boolean,
})

const User = model("User", userSchema)

export default User
