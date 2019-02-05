const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
	sillyId: String,
	message: Object,
	sender: String,
	receiver: String,
  date: String,
  datesecs: Number,
  homeimg: String,
})


module.exports = mongoose.model('Message', messageSchema);