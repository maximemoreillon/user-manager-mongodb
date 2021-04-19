const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app

// We will test for api users
describe("/auth", () => {

  // We will test root GET related logics
  describe("POST /auth/login", () => {
    // What should it do
    it("Should accept admin credentials", async () => {

      const res = await request(app)
        .post("/auth/login")
        .send({username: 'admin', password: 'admin'})

      // Test the expected outcome
      expect(res.status).to.equal(200)
    })
  })

})
