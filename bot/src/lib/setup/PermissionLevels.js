const { Client } = require('klasa');

module.exports = Client.defaultPermissionLevels
   .add(1, ({ guild, member }) => guild && member.roles.has(member.guild.settings.get('roles.dj')) || member.roles.find(r => r.name === "DJ"), { break: false, fetch: true })
   .add(2, ({ guild, member }) => guild && member.permissions.has('MANAGE_MESSAGES'), { break: false, fetch: true })
   .add(3, ({ guild, member }) => guild && member.permissions.has('KICK_MEMBERS'), { break: false, fetch: true })
   .add(4, ({ guild, member }) => guild && member.permissions.has('BAN_MEMBERS'), { break: false, fetch: true })
   .add(5, async ({ guild, member }) => {
      if (member.permissions.has('MANAGE_GUILD')) return true;
      if (!guild) return false;
      const get = await member.guild.settings.get('roles.mod')
      for (const role of member.roles.values()) {
         if (get.includes(role.id)) return true;
      }
      return false
   }, { break: false, fetch: true })
   .add(6, ({ guild, member }) => guild && member.permissions.has('ADMINISTRATOR'), { break: false, fetch: true })