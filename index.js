const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const pjson = require('./package.json')
const groups_router = require('./routes/users.js')

dotenv.config()

// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URL, mongoose_options)

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
    application_name: 'User manager',
    version: pjson.version,
    author: pjson.author
  })
})

app.use('/groups', groups_router)

app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})
