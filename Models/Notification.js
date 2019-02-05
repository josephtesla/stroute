const mongoose = require('mongoose');

const notSchema = new mongoose.Schema({
	userId:String,
	message: String,
	link: String,
	date: Date,
	time: String,
})

const Notification = mongoose.model('Notification', notSchema);
module.exports = Notification;