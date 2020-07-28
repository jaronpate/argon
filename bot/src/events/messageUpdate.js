const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
   async run(oldMessage, message) {
      if (message.partial || oldMessage.partial) { return }
      if (!oldMessage.content || !message.content) { return }
      let lc = message.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await message.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return;
      
      if (!message.guild.settings.get('toggles.logs.messages')) return;
      if (!message.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      const embed = new MessageEmbed()
         .setDescription(`**Message from ${message.author} edited in ${message.channel}** [Jump to message](${message.url})`)
         .addField('Before', oldMessage.content)
         .addField('After', message.content)
         .setColor(this.client.config.colors.blue)
         .setAuthor(`${message.author.tag}`, await message.author.getAvatar())
         .addField(`IDs`, util.codeBlock('ini', `User = ${message.author.id} \nMessage = ${message.id}`))
         .setTimestamp();
      await logsChannel.send(embed)
   }
}