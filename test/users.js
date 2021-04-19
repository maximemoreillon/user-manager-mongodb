const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app

// We will test for api users
describe("/users", () => {
  // What to do after each test
  beforeEach(async () => {
    await User.deleteMany({})
  })

  // We will test root GET related logics
  describe("GET /", () => {
    // What should it do
    it("should return all users", async () => {

      const users = [
        { username: "user1" },
        { username: "user2" },
      ]
      
      await User.insertMany(users)
      const res = await request(app).get("/users")

      // Test the expected outcome
      expect(res.status).to.equal(200)
      expect(res.body.length).to.equal(2)
    })
  })

})
