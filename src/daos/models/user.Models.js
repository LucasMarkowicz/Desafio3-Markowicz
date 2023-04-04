const mongoose = require('mongoose')

const userCollection = 'user'

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },

})

const User = mongoose.model(userCollection, userSchema)

module.exports = User