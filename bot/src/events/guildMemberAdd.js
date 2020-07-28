const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
   async run(member) {
      let lc = member.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await member.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return;

      if (!member.guild.settings.get('toggles.logs.members')) return;
      if (!member.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;

      const embed = new MessageEmbed()
         .setTitle('Member Joined')
         .setColor(this.client.config.colors.green)
         .setAuthor(`${member.user.tag} ${member && member.nick ? `(${member.nick})` : ''}`, await member.user.getAvatar())
         .addField(`IDs`, util.codeBlock('ini', `User = ${member.user.id}`))
         .setTimestamp();
      await logsChannel.send('', [embed])
   }
}
