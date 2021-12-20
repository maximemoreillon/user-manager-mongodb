const { Router } = require('express')
const {
  create_user,
  get_users,
  get_user,
  delete_user,
  update_user,
  update_password,
  password_reset
} = require('../controllers/users.js')
const {
  middleware_lax,
  admin_only_middlware,
  middleware,
} = require('../auth.js')

const router = Router()

router.route('/')
  .post(middleware_lax, create_user)
  .get(middleware, admin_only_middlware, get_users)

router.route('/:user_id')
  .get(middleware, get_user)
  .delete(middleware, delete_user)
  .put(middleware, update_user)
  .patch(middleware, update_user)

// middleware lax here because reset using token
router.route('/:user_id/password')
  .put(middleware, update_password)
  .patch(middleware, update_password)

router.route('/:user_id/password/reset')
  .post(password_reset)

module.exports = router
