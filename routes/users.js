const express = require('express')
const controller = require('../controllers/users.js')
const auth = require('../auth.js')

const router = express.Router()

router.use(auth.middleware)

router.route('/')
  .post(controller.create_user)
  .get(controller.get_users)

router.route('/count')
  .get(controller.get_user_count)

router.route('/:user_id')
  .get(controller.get_user)
  .delete(controller.delete_user)
  .put(controller.update_user)
  .patch(controller.update_user)

router.route('/:user_id/password')
  .put(controller.update_password)

module.exports = router
