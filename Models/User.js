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
   },
   groups:Array,
   notifications: {
    type:Number,
    default: 0
   },
   requests: {
    type:Number,
    default: 0
   }

})

module.exports = mongoose.model('User', userSchema);