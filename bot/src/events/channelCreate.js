const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');
const CHANNEL_TYPE = {
   'text': 'Text channel',
   'voice': 'Voice channel',
   'category': 'Category'
}

module.exports = class extends Event {
   async run(channel) {
      let lc = channel.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await channel.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return
      
      if (!channel.guild.settings.get('toggles.logs.channels')) return;
      if (!['text', 'voice', 'category'].includes(channel.type) || !channel.guild.me.permissions.has("VIEW_AUDIT_LOG") || !channel.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      const embed = new MessageEmbed()
         .addField('Name', channel.name)
         .addField('Position', channel.rawPosition, true)
         .setColor(this.client.config.colors.green)
         .setTitle(`${CHANNEL_TYPE[channel.type]} Created`)
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
      if (channel.permissionOverwrites.size !== 0) {
         channel.permissionOverwrites.forEach(overwrite => {
            if (overwrite.type === 'role') {
               const role = channel.guild.roles.get(overwrite.id)
               if (role.name === '@everyone') return;
               let deny = overwrite.deny.toArray()
               let allow = overwrite.allow.toArray()
               embed.addField(`${role.name}`, `Type: Role\nPermissions:\n  ${(allow.length > 0) ? allow.map(a => `${this.client.config.emojis.success} ${this.client.util.permissions[a]}`).join(', ') : ""} ${(deny.length > 0) ? deny.map(d => `${this.client.config.emojis.error} ${this.client.util.permissions[d]}`).join(', ') : ""}`)
            }
         })
      };
      if (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime() < 3000) {
         embed.setAuthor(`${user.tag} ${member && member.nick ? `(${member.nick})` : ''}`, await user.getAvatar())
         // embed.setThumbnail(await user.getAvatar())
         embed.fields[channel.type !== "category" ? 3 : 2].value = util.codeBlock('ini', `User = ${user.id} \nChannel = ${channel.id}`)
         await logsChannel.send(embed)
      } else {
         await logsChannel.send(embed)
      }
   }
}