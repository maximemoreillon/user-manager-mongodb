import mongoose from "mongoose"

import {
  create_admin_account,
  rename_admin_property,
} from "./controllers/users"

// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.set("useCreateIndex", true)

export const {
  MONGODB_CONNECTION_STRING,
  MONGODB_PROTOCOL = "mongodb",
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_HOST = "mongo",
  MONGODB_PORT,
  MONGODB_DB = "user_manager",
  MONGODB_OPTIONS = "",
} = process.env

const mongodbPort = MONGODB_PORT ? `:${MONGODB_PORT}` : ""

const connectionString =
  MONGODB_CONNECTION_STRING ||
  (MONGODB_USERNAME && MONGODB_PASSWORD
    ? `${MONGODB_PROTOCOL}://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}${mongodbPort}/${MONGODB_DB}${MONGODB_OPTIONS}`
    : `${MONGODB_PROTOCOL}://${MONGODB_HOST}${mongodbPort}/${MONGODB_DB}${MONGODB_OPTIONS}`)

export const redactedConnectionString = connectionString.replace(
  /:.*@/,
  "://***:***@"
)

export const connect = () => {
  console.log(`[Mongoose] Connecting to ${redactedConnectionString}`)
  mongoose
    .connect(connectionString, mongoose_options)
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
