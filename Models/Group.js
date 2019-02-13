const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String,
  createdBy: String,
  description: String,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'User'
    }
  ],
  messages:[
    {
      type:  mongoose.Schema.Types.ObjectId,
      ref:'Message'
    }
  ],
  members: {
    type: Number,
    default: 0
  },
  date: String,
  datesecs: Number,

})

module.exports = mongoose.model('Group', groupSchema);