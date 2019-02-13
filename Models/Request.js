const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  link: String,
	date: Date,
	time: String,
})


module.exports = mongoose.model('Request', requestSchema);