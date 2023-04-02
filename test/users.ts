import User from "../models/user"
import request from "supertest"
import { expect } from "chai"
import { app } from "../index"
import * as user_controller from "../controllers/users"

describe("/users", () => {
  let jwt: string, new_user_id: string

  before(async () => {
    //console.log = function () {};

    const { body } = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "admin" })

    jwt = body.jwt
  })

  describe("POST /users", () => {
    it("Should prevent the creation of a user without password", async () => {
      const res = await request(app)
        .post("/users")
        .send({ username: "test_user" })
        .set("Authorization", `Bearer ${jwt}`)

      expect(res.status).to.equal(400)
    })

    it("Should prevent the creation of a user without username", async () => {
      const res = await request(app)
        .post("/users")
        .send({ password: "banana" })
        .set("Authorization", `Bearer ${jwt}`)

      expect(res.status).to.equal(400)
    })

    it("Should allow the creation of a user with username and password", async () => {
      const new_user = { username: "test_user", password: "banana" }

      const { status, body } = await request(app)
        .post("/users")
        .send(new_user)
        .set("Authorization", `Bearer ${jwt}`)

      new_user_id = body._id

      expect(status).to.equal(200)
    })

    it("Should prevent the creation of a duplicate user", async () => {
      await request(app)
        .post("/users")
        .send({ username: "test_user", password: "banana" })
        .set("Authorization", `Bearer ${jwt}`)

      const res = await request(app)
        .post("/users")
        .send({ username: "test_user", password: "banana" })
        .set("Authorization", `Bearer ${jwt}`)

      expect(res.status).to.not.equal(200)
    })

    // it("Should allow user registration", async () => {
    //
    //   const new_user = {
    //     username: 'self_registered_user',
    //     email_address: 'test@example.com',
    //     password: 'banana',
    //   }
    //
    //   const {status, body} = await request(app)
    //     .post("/users")
    //     .send(new_user)
    //
    //   expect(status).to.equal(200)
    // })
  })

  describe("GET /users", () => {
    it("Should return all users", async () => {
      const { status, body } = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
      expect(body.users.length).to.be.above(0)
    })
  })

  describe("GET /users/:user_id", () => {
    it("Should get the new user", async () => {
      const { status, body } = await request(app)
        .get(`/users/${new_user_id}`)
        .set("Authorization", `Bearer ${jwt}`)

      expect(body.username).to.equal("test_user")
      expect(status).to.equal(200)
    })

    it("Should reject invalid IDs", async () => {
      const res = await request(app)
        .get(`/users/banana`)
        .set("Authorization", `Bearer ${jwt}`)

      expect(res.status).to.not.equal(200)
    })
  })

  describe("PATCH /users/:user_id", () => {
    it("Should allow the update of a user", async () => {
      const res = await request(app)
        .patch(`/users/${new_user_id}`)
        .send({ display_name: "Test User" })
        .set("Authorization", `Bearer ${jwt}`)

      expect(res.status).to.equal(200)
    })
  })

  describe("PUT /users/:user_id/password", () => {
    it("Should allow password update", async () => {
      const { status } = await request(app)
        .put(`/users/${new_user_id}/password`)
        .send({
          new_password: "apricot",
          new_password_confirm: "apricot",
        })
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })

  // describe("POST /users/:user_id/password/reset", () => {
  //
  //   it("Should allow requesting password reset", async () => {
  //
  //     const {status} = await request(app)
  //       .post(`/users/self/password/reset`)
  //       .send({ email_address: 'test@example.com'})
  //
  //     expect(status).to.equal(200)
  //   })
  // })

  describe("DELETE /users/:user_id", () => {
    it("Should allow the deletion of a user", async () => {
      const { status, body } = await request(app)
        .delete(`/users/${new_user_id}`)
        .set("Authorization", `Bearer ${jwt}`)

      expect(status).to.equal(200)
    })
  })
})
