const User = require("../models/user.js")
const request = require("supertest")
const expect = require("chai").expect
const app = require("../index.js").app
const user_controller = require('../controllers/users.js')





describe("/users", () => {

  let jwt, new_user_id

  before( async () => {
    //console.log = function () {};

    const {body} = await request(app)
      .post("/auth/login")
      .send({username: 'admin', password: 'admin'})

    jwt = body.jwt

  })




  describe("POST /users", () => {
    it("Should prevent creation of user without password", async () => {

      const res = await request(app)
        .post("/users")
        .send({username: 'test_user'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(400)
    })

    it("Should prevent creation of user without username", async () => {

      const res = await request(app)
        .post("/users")
        .send({password: 'banana'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(400)
    })

    it("Should allow creation of user with username and password", async () => {

      const new_user = {username: 'test_user', password: 'banana'}

      const {status, body} = await request(app)
        .post("/users")
        .send(new_user)
        .set('Authorization', `Bearer ${jwt}`)

      new_user_id = body._id

      expect(status).to.equal(200)
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


  describe("GET /users", () => {
    it("Should return all users", async () => {
      const {status, body} = await request(app)
        .get("/users")
        .set('Authorization', `Bearer ${jwt}`)

      expect(status).to.equal(200)
      expect(body.users.length).to.be.above(0)
    })
  })

  describe("GET /users/:user_id", () => {

    it("Should get the new user", async () => {



      const {status, body} = await request(app)
        .get(`/users/${new_user_id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(body.username).to.equal('test_user')
      expect(status).to.equal(200)
    })

    it("Should reject invalid IDs", async () => {


      const res = await request(app)
        .get(`/users/banana`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.not.equal(200)
    })
  })

  describe("PATCH /users/:user_id", () => {

    it("Should allow the update of a user", async () => {


      const res = await request(app)
        .patch(`/users/${new_user_id}`)
        .send({display_name: 'Test User'})
        .set('Authorization', `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
    })
  })

  describe("PUT /users/:user_id/password", () => {


    it("Should allow password update", async () => {


      const {status} = await request(app)
        .put(`/users/${new_user_id}/password`)
        .send({
          new_password: 'apple',
          new_password_confirm: 'apple',
        })
        .set('Authorization', `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })

  })

  describe("DELETE /users/:user_id", () => {

    it("Should allow the deletion of a user", async () => {

      const {status,body} = await request(app)
        .delete(`/users/${new_user_id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })

})
