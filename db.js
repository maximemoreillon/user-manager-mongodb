const mongoose = require('mongoose')
const dotenv = require('dotenv')

const {create_admin_account} = require('./controllers/users.js')

dotenv.config()

// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.set('useCreateIndex', true)

const {
  MONGODB_URL = 'mongodb://mongo',
  MONGODB_DB = 'user_manager',
} = process.env



const mongoose_connection_string = `${MONGODB_URL}/${MONGODB_DB}`


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

exports.db = MONGODB_URL
exports.url = MONGODB_DB
exports.connected = () => mongoose.connection.readyState
