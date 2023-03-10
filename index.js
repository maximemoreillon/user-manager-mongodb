const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const apiMetrics = require("prometheus-api-metrics")
const { version, author } = require("./package.json")
const db = require("./db.js")
const mail = require("./mail.js")
const auth_router = require("./routes/auth.js")
const users_router = require("./routes/users.js")
require("express-async-errors")

dotenv.config()

const { EXPRESS_PORT = 80, ALLOW_REGISTRATION } = process.env

db.connect()

const app = express()

app.use(express.json())
app.use(cors())
app.use(apiMetrics())

app.get("/", (req, res) => {
  res.send({
    application_name: "User manager (Mongoose version)",
    version,
    author,
    mongodb: {
      url: db.url,
      db: db.db,
      connected: db.connected(),
    },
    registration_allowed: ALLOW_REGISTRATION || false,
    smtp: {
      host: mail.options.host || "undefined",
      port: mail.options.port || "undefined",
      from: mail.options.from || "undefined",
    },
  })
})

app.use("/auth", auth_router)
app.use("/users", users_router)

app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})

// Express error handler
app.use((error, req, res, next) => {
  console.error(error)
  let { statusCode = 500, message = error } = error
  if (isNaN(statusCode) || statusCode > 600) statusCode = 500
  res.status(statusCode).send(message)
})

// exporting app for tests
exports.app = app

// Stop on CTRL C (for docker)
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)")
  process.exit(0)
})
