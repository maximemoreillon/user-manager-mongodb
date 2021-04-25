const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app
const user_controller = require('../controllers/users.js')
const auth = require('../auth.js')


// We will test for api users
describe("/auth", () => {

  beforeEach( async () => {
    console.log = function () {};
    await User.deleteMany({})
    await user_controller.create_admin_account()
  })

  describe("Password checking", () => {
    it("Should hash password successfully", async () => {
      await user_controller.hash_password('banana')
    })

    it("Should verify correct password successfully", async () => {
      const password_hashed = await user_controller.hash_password('banana')
      await auth.check_password('banana', {password_hashed})
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
    it("Should return 200", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({username: 'admin', password: 'admin'})
        .expect('Content-Type', /json/)

      expect(res.status).to.equal(200)
    })
  })

})
