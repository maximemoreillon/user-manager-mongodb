const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const pjson = require('./package.json')

const auth_router = require('./routes/auth.js')
const users_router = require('./routes/users.js')



dotenv.config()


// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const mongodb_db = process.env.MONGODB_DB || 'user_manager_mongoose'
const mongoose_url = `${process.env.MONGODB_URL}/${mongodb_db}`

mongoose.set('useCreateIndex', true)

function mongoose_connect(){
  console.log('[Mongoose] Attempting connection...')
  mongoose.connect(mongoose_url, mongoose_options)
  .then(() => {console.log('[Mongoose] Connection successful')})
  .catch(error => {
    console.log('[Mongoose] Connection failed')
    setTimeout(mongoose_connect,5000)
  })
}

mongoose_connect()


const db = mongoose.connection
db.on('error', console.error.bind(console, '[Mongoose] connection error:'))
db.once('open', () => { console.log('[Mongoose] Connected') })

require('./controllers/users.js').create_admin_account()


const EXPRESS_PORT = process.env.EXPRESS_PORT || 80

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send({
    application_name: 'User manager (Mongoose version)',
    version: pjson.version,
    author: pjson.author,
    mongodb_url: process.env.MONGODB_URL || 'undefined',
    mongodb_db: mongodb_db,

  })
})

app.use('/auth', auth_router)
app.use('/users', users_router)

app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})

exports.app = app
