const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
   async run(oldGuild, guild) {
      let lc = guild.settings.get('channels.logs')
      if (!lc) return;
      let webhooks = await guild.fetchWebhooks()
      let logsChannel = webhooks.get(lc)
      if (!logsChannel) return;

      if (!guild.settings.get('toggles.logs.guild')) return;
      if (!guild.me.permissions.has("VIEW_AUDIT_LOG") || !guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
      let changes = '';
      let keys = Object.keys(diff(oldGuild, guild));
      
      keys.forEach((change) => { changes = changes.concat(change + ` \n`) });
      if (keys.length <= 0) { return }

      const embed = new MessageEmbed()
         .addField('Name', guild.name)
         .setColor(this.client.config.colors.yellow)
         .addField('Changed',  changes)
         .setTitle(`Guild Updated`)
         .setAuthor('Unknown User', 'https://i.imgur.com/OGJoll2.png')
         .addField(`IDs`, util.codeBlock('ini', `Guild = ${guild.id}`))
         .setTimestamp();
      let log;
      await guild.fetchAuditLogs({ limit: 1 }).then(logs => {
         if (!logs) return;
         log = logs.entries.first();
         if (!log) return;
      }).catch(() => { })
      let user = log.executor;
      let member = guild.members.get(user.id);
      if (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime() < 3000) {
         embed.setAuthor(`${user.tag} ${member && member.nick ? `(${member.nick})` : ''}`, await user.getAvatar())
         // embed.setThumbnail(await user.getAvatar())
         embed.fields[2].value = util.codeBlock('ini', `User = ${user.id} \nGuild = ${guild.id}`)
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