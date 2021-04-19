const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const index = require("../index.js")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We will test for api users
describe("/auth", () => {

  // We will test root GET related logics
  describe("POST /auth/login", () => {
    // What should it do
    it("Should accept admin credentials", async () => {

      const app = index.app

      // Give time for admin creation
      await sleep(2000);

      request(app)
        .post("/auth/login")
        .send({username: 'admin', password: 'admin'})
        //.set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

    })
  })

})
