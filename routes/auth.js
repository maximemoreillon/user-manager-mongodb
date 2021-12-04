const express = require('express')
const {login} = require('../auth.js')

const router = express.Router()

router.route('/login')
  .post(login)


module.exports = router
