import { Router } from "express"
import { version, author } from "../package.json"
import {
  connected as dbConnedted,
  connectionString as dbConnectionString,
} from "../db"
import { REDIS_URL } from "../cache"
import * as mail from "../mail"
import auth_router from "./auth"
import users_router from "./users"

const { ALLOW_REGISTRATION } = process.env

const router = Router()

router.get("/", (req, res) => {
  res.send({
    application_name: "User manager (Mongoose version)",
    version,
    author,
    mongodb: {
      connected: dbConnedted(),
      connection_string: dbConnectionString?.replace(/:.*@/, "://***:***@"),
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

router.use("/auth", auth_router)
router.use("/users", users_router)

export default router
