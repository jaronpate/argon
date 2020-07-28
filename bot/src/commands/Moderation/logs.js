const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { emojis } = require('../../config');

module.exports = class extends Command {

   constructor(...args) {
      super(...args, {
         name: 'logs',
         description: 'Add logs to your server.',
         permissionLevel: 5,
         runIn: ['text'],
         usage: '<setup> [channel:channel]',
         usageDelim: " ",
         subcommands: true
      })
   }

   async setup(msg, [channel]) {
      await msg.delete();
      if (channel.type !== "text") { return }
      let wh = await channel.createWebhook(this.client.user.username, {
         avatar: this.client.user.displayAvatarURL(),
         reason: 'Logs'
      })
      msg.guild.settings.update('channels.logs', wh.id)
      msg.guild.settings.sync()
      let m = await msg.channel.send(`${this.client.config.emojis.success} Log channel set to ${channel}.`)
      await m.delete({ timeout: 5000 })
   }
};