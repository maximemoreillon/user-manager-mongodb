import dotenv from "dotenv"
dotenv.config()
import { version } from "./package.json"
console.log(`User manager v${version}`)
import express, { Request, Response, NextFunction } from "express"
import "express-async-errors"
import cors from "cors"
import promBundle from "express-prom-bundle"
import { connect as dbConnect } from "./db"
import { init as cacheInit } from "./cache"

import router from "./routes/"

const { EXPRESS_PORT = 80 } = process.env
const promOptions = { includeMethod: true, includePath: true }

dbConnect()
cacheInit()

export const app = express()

app.use(express.json())
app.use(cors())
app.use(promBundle(promOptions))
app.use("/", router)

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
