import express from "express"
import { login } from "../auth"
import { decodeToken } from "../controllers/tokens"

const router = express.Router()

router.route("/login").post(login)

router.route("/token").post(decodeToken)

export default router
