const mongoose = require('mongoose')
const dotenv = require('dotenv')

const {create_admin_account} = require('./controllers/users.js')

dotenv.config()

// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const mongodb_url = process.env.MONGODB_URL || 'mongodb://mongo'
const mongodb_db = process.env.MONGODB_DB || 'user_manager_mongoose'
const mongoose_connection_string = `${mongodb_url}/${mongodb_db}`

mongoose.set('useCreateIndex', true)

exports.connect = () => {
  console.log('[Mongoose] Attempting initial connection...')
  mongoose.connect(mongoose_connection_string, mongoose_options)
  .then(() => {
    console.log('[Mongoose] Initial connection successful')
    create_admin_account()
  })
  .catch(error => {
    console.log('[Mongoose] Initial connection failed')
    setTimeout(mongoose_connect,5000)
  })
}



const db = mongoose.connection
db.on('error', console.error.bind(console, '[Mongoose] connection error:'))
db.once('open', () => { console.log('[Mongoose] Connected') })

exports.db = mongodb_db
exports.url = mongodb_url
exports.connected = () => mongoose.connection.readyState
