const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
   async run(message) {
      if (message.partial) { return }
      let lc = message.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await message.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return;
      
      if (!message.guild.settings.get('toggles.logs.messages')) return;
      if (!message.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      const embed = new MessageEmbed()
         .setDescription(`**Message from ${message.author} deleted in ${message.channel}** \n${message.content}`)
         .setColor(this.client.config.colors.red)
         .setAuthor(`${message.author.tag}`, await message.author.getAvatar())
         .addField(`IDs`, util.codeBlock('ini', `User = ${message.author.id}`))
         .setTimestamp();
      await logsChannel.send(embed)
   }
}