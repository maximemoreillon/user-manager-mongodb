const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We will test for api users
describe("/auth", () => {

  // We will test root GET related logics
  describe("POST /auth/login", () => {
    // What should it do
    it("Should accept admin credentials", async () => {

      await sleep(2000);

      const res = await request(app)
        .post("/auth/login")
        .send({username: 'admin', password: 'admin'})
        .set('Accept', 'application/json')

      console.log(res.body)
      expect(res.status).to.equal(200)

    })
  })

})
