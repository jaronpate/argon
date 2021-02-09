const { Command } = require('klasa');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         description: language => language.get('COMMAND_BAN_DESCRIPTION'),
         requiredPermissions: ['BAN_MEMBERS'],
         permissionLevel: 4,
         usage: '<member:member> [reason:string] [...]',
         usageDelim: ' '
      })
   }

   async run(msg, [member, ...reason]) {
      reason = reason.length > 0 ? reason.join(' ') : null;
      if (member.roles.highest.position >= msg.member.roles.highest.position) {
         return msg.sendMessage(`${this.client.config.error} You can't ban someone above you.`);
      } else if (member.bannable === false) {
         return msg.sendMessage(`${this.client.config.error} I cannot ban that user.`);
      }
      await msg.guild.members.ban(member, { reason });
      if (msg.guild.settings.get('channels.modlog')) {
         new this.client.modlog(msg.guild).setType('ban').setModerator(msg.member).setUser(member).setReason(reason).send();
      }
      return msg.sendMessage(`${this.client.config.success} Banned ${member.user.tag}`);
   }
}