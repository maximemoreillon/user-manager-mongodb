const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app
const user_controller = require('../controllers/users.js')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We will test for api users
describe("/auth", () => {

  beforeEach( async () => {
    console.log = function () {};
    await User.deleteMany({})
    await user_controller.create_admin_account()
  })


  // We will test root GET related logics
  describe("POST /login", () => {

    // What should it do
    it("Should return 200", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({username: 'admin', password: 'admin'})
        .expect('Content-Type', /json/)

      expect(res.status).to.equal(200)
    })
  })

})
