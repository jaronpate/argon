const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
   async run(role) {
      let lc = role.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await role.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return
      
      if (!role.guild.settings.get('toggles.logs.roles')) return;
      if (!channel.guild.me.permissions.has("VIEW_AUDIT_LOG") || !role.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      const embed = new MessageEmbed()
         .addField('Name', role.name)
         .setColor(this.client.config.colors.red)
         .setTitle(`Role Deleted`)
         .setAuthor('Unknown User', 'https://i.imgur.com/OGJoll2.png')
         .addField(`IDs`, util.codeBlock('ini', `Role = ${role.id}`))
         .setTimestamp();
      let log;
      await role.guild.fetchAuditLogs({ limit: 1 }).then(logs => {
         if (!logs) return;
         log = logs.entries.first();
         if (!log) return;
      }).catch(() => { })
      let user = log.executor;
      let member = role.guild.members.get(user.id);
      if (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime() < 3000) {
         embed.setAuthor(`${user.tag} ${member && member.nick ? `(${member.nick})` : ''}`, await user.getAvatar())
         // embed.setThumbnail(await user.getAvatar())
         embed.fields[1].value = util.codeBlock('ini', `User = ${user.id} \nRole = ${role.id}`)
         await logsChannel.send(embed)
      } else {
         await logsChannel.send(embed)
      }
   }
}