const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const {version, author} = require('./package.json')
const db = require('./db.js')
const mail = require('./mail.js')
const auth_router = require('./routes/auth.js')
const users_router = require('./routes/users.js')

dotenv.config()

const EXPRESS_PORT = process.env.EXPRESS_PORT || 80

db.connect()

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send({
    application_name: 'User manager (Mongoose version)',
    version,
    author,
    mongodb: {
      url: db.url || 'Undefined',
      db: db.db,
      connected: db.connected(),
    },
    registration_allowed: process.env.ALLOW_REGISTRATION || false,
    smtp: {
      host: mail.options.host || 'undefined',
      port: mail.options.port || 'undefined',
      from: mail.options.from || 'undefined',
    }
  })
})

app.use('/auth', auth_router)
app.use('/users', users_router)

app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})

exports.app = app
