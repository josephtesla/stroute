const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
	sillyId: String,
	message: Object,
	sender: String,
	receiver: String,
  date: String,
  datesecs: Number,
  msgtype: String,
  groupname: {
    type: String,
    default: ""
  }
})


module.exports = mongoose.model('Message', messageSchema);