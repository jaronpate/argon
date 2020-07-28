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
         .setTitle(`Invite Deleted`)
         .setDescription(invite.toString())
         .setColor(this.client.config.colors.yellow)
         .addField(`IDs`, util.codeBlock('ini', ``))
         .setTimestamp();
      let log;
      await invite.guild.fetchAuditLogs({ limit: 1 }).then(logs => {
         if (!logs) return;
         log = logs.entries.first();
         if (!log) return;
      }).catch(() => { })
      let user = log.executor;
      let member = invite.guild.members.get(user.id);
      if (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime() < 3000) {
         embed.setAuthor(`${user.tag} ${member && member.nick ? `(${member.nick})` : ''}`, await user.getAvatar())
         embed.fields[0].value = util.codeBlock('ini', `User = ${user.id}`)
         await logsChannel.send(embed)
      } else {
         await logsChannel.send(embed)
      }
   }
}