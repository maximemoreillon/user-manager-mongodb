const express = require('express')
const controller = require('../auth.js')

const router = express.Router()

router.route('/login')
  .post(controller.login)


module.exports = router
