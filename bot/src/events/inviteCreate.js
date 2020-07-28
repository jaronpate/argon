const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
   async run(invite) {
      let lc = invite.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await invite.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return;
      
      if (!invite.guild.settings.get('toggles.logs.invites')) return;
      if (!invite.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      const embed = new MessageEmbed()
         .setTitle(`Invite Created`)
         .setDescription(invite.toString())
         .setColor(this.client.config.colors.blue)
         .setAuthor(`${invite.inviter.tag}`, await invite.inviter.getAvatar())
         .addField(`IDs`, util.codeBlock('ini', `User = ${invite.inviter.id}`))
         .setTimestamp();
      await logsChannel.send(embed)
   }
}