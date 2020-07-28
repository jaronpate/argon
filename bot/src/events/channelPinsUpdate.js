const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
   async run(channel, time) {
      let lc = channel.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await channel.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return;
      
      if (!channel.guild.settings.get('toggles.logs.channels')) return;
      if (!['text', 'voice', 'category'].includes(channel.type) || !channel.guild.me.permissions.has("VIEW_AUDIT_LOG") || !channel.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      const embed = new MessageEmbed()
         .addField('Channel', channel)
         .setColor(this.client.config.colors.default)
         .setTitle(`Pins Updated`)
         .setAuthor('Unknown User', 'https://i.imgur.com/OGJoll2.png')
         .setTimestamp();
      if (channel.type !== "category") { embed.addField('Parent', channel.parent.name, true) }
      embed.addField(`IDs`, util.codeBlock('ini', `Channel = ${channel.id}`))
      let log;
      await channel.guild.fetchAuditLogs({ limit: 1 }).then(logs => {
         if (!logs) return;
         log = logs.entries.first();
         if (!log) return;
      }).catch(() => { })
      let user = log.executor;
      let member = channel.guild.members.get(user.id);
      if (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime() < 3000) {
         embed.setAuthor(`${user.tag} ${member && member.nick ? `(${member.nick})` : ''}`, await user.getAvatar())
         // embed.setThumbnail(await user.getAvatar())
         embed.fields[channel.type !== "category" ? 2 : 1].value = util.codeBlock('ini', `User = ${user.id} \nChannel = ${channel.id}`)
         await logsChannel.send(embed)
      } else {
         await logsChannel.send(embed)
      }
   }
}