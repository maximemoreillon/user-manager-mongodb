const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app
const user_controller = require('../controllers/users.js')

let jwt

describe("/users", () => {

  beforeEach( async () => {
    console.log = function () {};
    await User.deleteMany({})
    await user_controller.create_admin_account()
    const {body} = await request(app)
      .post("/auth/login")
      .send({username: 'admin', password: 'admin'})
    jwt = body.jwt
  })


  describe("GET /", () => {
    it("Should return all users", async () => {
      const res = await request(app)
        .get("/users")
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
      expect(res.body.length).to.equal(1)
    })
  })

  describe("POST /", () => {
    it("Should prevent creation of user without password", async () => {

      const res = await request(app)
        .post("/users")
        .send({username: 'test_user'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(400)
    })

    it("Should prevent creation of user username", async () => {

      const res = await request(app)
        .post("/users")
        .send({password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(400)
    })

    it("Should allow creation of user with username and password", async () => {

      const res = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
    })

    it("Should prevent creation of duplicate user", async () => {

      await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      const res = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(400)
    })
  })

  describe("GET /:user_id", () => {

    it("Should get the new user", async () => {

      const {body: {_id}} = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      const res = await request(app)
        .get(`/users/${_id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.body.username).to.equal('test_user')
      expect(res.status).to.equal(200)
    })

    it("Should reject invalid IDs", async () => {


      const res = await request(app)
        .get(`/users/banana`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.not.equal(200)
    })
  })

  describe("DELETE /:user_id", () => {

    it("Should allow the deletion of a user", async () => {

      const {body: {_id}} = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      const res = await request(app)
        .delete(`/users/${_id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
    })
  })

  describe("PATCH /:user_id", () => {

    it("Should prevent username modification", async () => {

      const {body: {_id}} = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      const res = await request(app)
        .patch(`/users/${_id}`)
        .send({username: 'not_test_user'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(403)
    })

    it("Should allow the update of a user", async () => {

      const {body: {_id}} = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      const res = await request(app)
        .patch(`/users/${_id}`)
        .send({display_name: 'Test User'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
    })
  })

  describe("PUT /:user_id/password", () => {

    it("Should prevent normal users from updating passwords with incorrect current password", async () => {

      const {body: {_id}} = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      const {body} = await request(app)
        .post("/auth/login")
        .send({username: 'test_user', password: 'banana'})

      const normal_user_jwt = body.jwt

      const res = await request(app)
        .put(`/users/${_id}/password`)
        .send({
          current_password: 'orange',
          new_password: 'apple',
          new_password_confirm: 'apple',
        })
        .set('Authorization', `Bearer ${normal_user_jwt}`)

      expect(res.status).to.equal(403)
    })

    it("Should allow password update", async () => {

      const {body: {_id}} = await request(app)
        .post("/users")
        .send({username: 'test_user', password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      const res = await request(app)
        .put(`/users/${_id}/password`)
        .send({
          new_password: 'apple',
          new_password_confirm: 'apple',
        })
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
    })

  })

})