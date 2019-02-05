const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   name: String,
   username: String,
   password: String,
   email: String,
   gender: String,
   image:String,
   address: String,
   friends: Array,
   status: {
     type:String,
     default:""
   }

})

module.exports = mongoose.model('User', userSchema);