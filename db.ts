import mongoose from "mongoose"
import dotenv from "dotenv"

import {
  create_admin_account,
  rename_admin_property,
} from "./controllers/users"

dotenv.config()

// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.set("useCreateIndex", true)

export const { MONGODB_URL = "mongodb://mongo", MONGODB_DB = "user_manager" } =
  process.env

const mongoose_connection_string = `${MONGODB_URL}/${MONGODB_DB}`

export const connect = () => {
  console.log("[Mongoose] Attempting initial connection...")
  mongoose
    .connect(mongoose_connection_string, mongoose_options)
    .then(() => {
      console.log("[Mongoose] Initial connection successful")
      create_admin_account()
      rename_admin_property()
    })
    .catch((error) => {
      console.log("[Mongoose] Initial connection failed")
      setTimeout(connect, 5000)
    })
}

const db = mongoose.connection
db.on("error", console.error.bind(console, "[Mongoose] connection error:"))
db.once("open", () => {
  console.log("[Mongoose] Connected")
})

export const connected = () => mongoose.connection.readyState