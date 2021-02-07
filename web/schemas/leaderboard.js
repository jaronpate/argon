const mongoose = require('mongoose');
const { stringify } = require('querystring');

const leaderboardsSchema = mongoose.Schema({
  guild: String,
  vanity: String
}, { collection: "leaderboards", timestamps: true })

module.exports = mongoose.model("leaderboards", leaderboardsSchema)