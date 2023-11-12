import dotenv from "dotenv"
dotenv.config()
import express, { Request, Response, NextFunction } from "express"
import "express-async-errors"
import cors from "cors"
import promBundle from "express-prom-bundle"
import { version, author } from "./package.json"
import {
  MONGODB_URL,
  MONGODB_DB,
  connected as dbConnedted,
  connect as dbConnect,
} from "./db"
import { REDIS_URL, init as cacheInit } from "./cache"
import * as mail from "./mail"
import auth_router from "./routes/auth"
import users_router from "./routes/users"

const { EXPRESS_PORT = 80, ALLOW_REGISTRATION } = process.env
const promOptions = { includeMethod: true, includePath: true }

dbConnect()
cacheInit()

export const app = express()

app.use(express.json())
app.use(cors())
app.use(promBundle(promOptions))
app.get("/", (req, res) => {
  res.send({
    application_name: "User manager (Mongoose version)",
    version,
    author,
    mongodb: {
      url: MONGODB_URL,
      db: MONGODB_DB,
      connected: dbConnedted(),
    },
    registration_allowed: ALLOW_REGISTRATION || false,
    smtp: {
      host: mail.options.host || "undefined",
      port: mail.options.port || "undefined",
    },
    redis: {
      url: REDIS_URL || "undefined",
    },
  })
})

app.use("/auth", auth_router)
app.use("/users", users_router)

app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})

// Express error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  let { statusCode = 500, message = error } = error
  if (isNaN(statusCode) || statusCode > 600) statusCode = 500
  res.status(statusCode).send(message)
})

// Stop on CTRL C (for docker)
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)")
  process.exit(0)
})
