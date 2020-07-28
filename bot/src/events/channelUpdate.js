const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');
const CHANNEL_TYPE = {
   'text': 'Text channel',
   'voice': 'Voice channel',
   'category': 'Category'
}

module.exports = class extends Event {
   async run(oldChannel, channel) {
      let lc = channel.guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await channel.guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return;

      if (!channel.guild.settings.get('toggles.logs.channels')) return;
      if (!['text', 'voice', 'category'].includes(channel.type) || !channel.guild.me.permissions.has("VIEW_AUDIT_LOG") || !channel.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      let changes = '';
      let keys = Object.keys(diff(oldChannel, channel));
      if (oldChannel.permissionOverwrites.size === channel.permissionOverwrites.size){ keys.shift() }
      keys.forEach((change) => { changes = changes.concat(change + ` \n`) });
      if (keys.length <= 0) { return }

      const embed = new MessageEmbed()
         .addField('Name', channel.name)
         .setColor(this.client.config.colors.yellow)
         .addField('Changed',  changes)
         .setTitle(`${CHANNEL_TYPE[channel.type]} Updated`)
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
         embed.fields[channel.type !== "category" ? 3 : 2].value = util.codeBlock('ini', `User = ${user.id} \nChannel = ${channel.id}`)
         await logsChannel.send(embed)
      } else {
         await logsChannel.send(embed)
      }
   }
}

function diff(obj1, obj2) {
   const result = {};
   if (Object.is(obj1, obj2)) {
       return undefined;
   }
   if (!obj2 || typeof obj2 !== 'object') {
       return obj2;
   }
   Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
       if(obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
           result[key] = obj2[key];
       }
       if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
           const value = diff(obj1[key], obj2[key]);
           if (value !== undefined) {
               result[key] = value;
           }
       }
   });
   return result;
}