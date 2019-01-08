const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
   message: String,
   sender: String,
   receiver: String,
   date: String
})

module.exports = mongoose.model('Message', messageSchema);