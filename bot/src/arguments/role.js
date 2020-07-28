const { Argument, util, Possible, KlasaMessage, KlasaGuild } = require('klasa');
const { Role } = require('discord.js');

module.exports = class extends Argument {
   async run(arg, possible, msg) {
      if (!arg) throw msg.language.get('COMMANDMESSAGE_MISSING_REQUIRED', possible.name);
      if (!msg.guild) return this.store.get('role').run(arg, possible, msg);
      const resRole = this.resolveRole(arg, msg.guild);
      if (resRole) return resRole;
      const results = [];
      const reg = new RegExp(util.regExpEsc(arg), 'i');
      for (const role of msg.guild.roles.values()) { if (reg.test(role.name)) results.push(role); }
      let querySearch;
      if (results.length > 0) {
         const regWord = new RegExp(`${util.regExpEsc(arg)}`);
         const filtered = results.filter(role => regWord.test(role.name));
         querySearch = filtered.length > 0 ? filtered : results;
      } else {
         querySearch = results;
      }
      switch (querySearch.length) {
         case 0: throw msg.language.get('RESOLVER_INVALID_ROLE', possible.name);
         case 1: return querySearch[0];
         default:
            if (querySearch[0].name.toLowerCase() === arg.toLowerCase()) return querySearch[0];
            throw `Found multiple matches: \`${querySearch.map(role => role.name).join('`, `')}\``;
      }
   }

   resolveRole(query, guild) {
      if (query instanceof Role) return guild.roles.has(query.id) ? query : null;
      if (typeof query === 'string' && Argument.regex.role.test(query)) return guild.roles.get(Argument.regex.role.exec(query)[1]);
      return null;
   }
}