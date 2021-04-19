const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app
const user_controller = require('../controllers/users.js')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let jwt

// We will test for api users
describe("/users", () => {

  before( async () => {

    await user_controller.create_admin_account()
    const {body} = await request(app)
      .post("/auth/login")
      .send({username: 'admin', password: 'admin'})
    jwt = body.jwt
  })

  // We will test root GET related logics
  describe("GET /", () => {
    // What should it do
    it("Should return 200", async () => {

      const res = await request(app)
        .get("/users")
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
    })
  })

})
