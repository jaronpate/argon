const mongoose = require('mongoose');

const loggedCommands = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guild: String,
  user: String,
  command: String,
  ran: Date,
}, { collection: "loggedCommands", timestamps: true })

module.exports = mongoose.model("loggedCommands", loggedCommands)