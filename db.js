const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const mongodb_db = process.env.MONGODB_DB || 'user_manager_mongoose'
const mongoose_url = `${process.env.MONGODB_URL}/${mongodb_db}`

mongoose.set('useCreateIndex', true)

exports.connect = () => {
  console.log('[Mongoose] Attempting initial connection...')
  mongoose.connect(mongoose_url, mongoose_options)
  .then(() => {console.log('[Mongoose] Initial connection successful')})
  .catch(error => {
    console.log('[Mongoose] Initial connection failed')
    setTimeout(mongoose_connect,5000)
  })
}



const db = mongoose.connection
db.on('error', console.error.bind(console, '[Mongoose] connection error:'))
db.once('open', () => { console.log('[Mongoose] Connected') })

exports.db = mongodb_db
exports.url = mongoose_url
exports.connected = () => mongoose.connection.readyState
