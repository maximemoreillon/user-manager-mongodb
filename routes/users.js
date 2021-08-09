const express = require('express')
const controller = require('../controllers/users.js')
const auth = require('../auth.js')

const router = express.Router()


router.route('/')
  .post(auth.middleware_lax, controller.create_user)
  .get(auth.middleware, auth.admin_only_middlware, controller.get_users)

router.route('/count')
  .get(auth.middleware, auth.admin_only_middlware, controller.get_user_count)

router.route('/:user_id')
  .get(auth.middleware, controller.get_user)
  .delete(auth.middleware, controller.delete_user)
  .put(auth.middleware, controller.update_user)
  .patch(auth.middleware, controller.update_user)

router.route('/:user_id/password')
  .put(auth.middleware, controller.update_password)

module.exports = router
