const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app

// We will test for api users
describe("/auth", () => {
  // What to do after each test
  beforeEach(async () => {
    await User.deleteMany({})
  })

  // We will test root GET related logics
  describe("GET /auth/login", () => {
    // What should it do
    it("Should accept admin credentials", async () => {

      const credentials = {username: 'admin', password: 'admin'}
      const res = await request(app).post("/auth/login", credentials)

      // Test the expected outcome
      expect(res.status).to.equal(200)
    })
  })

})
