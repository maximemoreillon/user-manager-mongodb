import User from "../models/user"
import request from "supertest"
import { expect } from "chai"
import { app } from "../index"
import { create_admin_account } from "../controllers/users"
import * as auth from "../auth"

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay))

// We will test for api users
describe("/auth", () => {
  beforeEach(async () => {
    //console.log = function () {};
    // await User.deleteMany({})
    // await create_admin_account()

    await sleep(1000) // wait for admin to be created
  })

  describe("Password checking", () => {
    it("Should hash password successfully", async () => {
      await auth.hash_password("banana")
    })

    it("Should verify correct password successfully", async () => {
      const password_hashed = await auth.hash_password("banana")
      await auth.check_password("banana", password_hashed)
    })
  })

  describe("Token generation", () => {
    it("Should work", async () => {
      const token = await auth.generate_token({ _id: "banana" })
    })
  })

  describe("Token decoding", () => {
    it("Should reject invalid tokens", async () => {
      try {
        const token = await auth.decode_token("banana")
        throw "Decoded invalid token"
      } catch {
        return
      }
    })

    it("Should decode valid tokens successfully", async () => {
      const token = (await auth.generate_token({ _id: "banana" })) as string
      const decoded = await auth.decode_token(token)
    })
  })

  describe("POST /login", () => {
    it("Should reject invalid credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ username: "banana", password: "banana" })

      expect(res.status).to.equal(403)
    })

    it("Should accept admin credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ username: "admin", password: "admin" })

      expect(res.status).to.equal(200)
    })
  })
})
