const User = require("../models/user.js")
const request = require("supertest")
const {expect} = require("chai")
const {app} = require("../index.js")
const {create_admin_account} = require('../controllers/users.js')
const auth = require('../auth.js')


// We will test for api users
describe("/auth", () => {

  beforeEach( async () => {
    console.log = function () {};
    await User.deleteMany({})
    await create_admin_account()
  })

  describe("Password checking", () => {
    it("Should hash password successfully", async () => {
      await auth.hash_password('banana')
    })

    it("Should verify correct password successfully", async () => {
      const password_hashed = await auth.hash_password('banana')
      await auth.check_password('banana', password_hashed)
    })
  })

  describe("Token generation", () => {
    it("Should work", async () => {
      const token = await auth.generate_token({_id: 'banana'})
    })
  })

  describe("Token decoding", () => {
    it("Should reject invalid tokens", async () => {

      try {
        const token = await auth.decode_token('banana')
        throw 'Decoded invalid token'
      } catch { return }

    })

    it("Should decode valid tokens successfully", async () => {
      const token = await auth.generate_token({_id: 'banana'})
      const decoded = await auth.decode_token(token)
    })
  })

  describe("POST /login", () => {
    it("Should reject invalid credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({username: 'banana', password: 'banana'})

      expect(res.status).to.equal(403)
    })

    it("Should accept admin credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({username: 'admin', password: 'admin'})

      expect(res.status).to.equal(200)
    })
  })

})
