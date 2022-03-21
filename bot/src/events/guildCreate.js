const { Event } = require('klasa');

module.exports = class extends Event {
    run(guild) {
        console.log(guild)
        guild.channels[0].sendMessage("Hi I have joined")
    }
};