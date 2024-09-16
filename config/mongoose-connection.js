const mongoose = require('mongoose')
const debuglog = require('debug')("development:mongoose")
const config = require('config')
mongoose.connect(`${config.get("MONGODB_URL")}/khatabook`)
.then(() => debuglog("Connected to MongoDB"))
.catch((err) => console.error(err))

module.exports = mongoose.connection