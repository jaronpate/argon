const { Argument, util: { regExpEsc } } = require('klasa');
const { Channel, Message } = require('discord.js');

module.exports = class extends Argument {
   async run(arg, possible, msg) {
      if (!arg) throw msg.language.get('COMMANDMESSAGE_MISSING_REQUIRED', possible.name);
      if (!msg.guild) return this.store.get('channel').run(arg, possible, msg);
      const resChannel = this.resolveChannel(arg, msg.guild);
      if (resChannel) return resChannel;

      const results = [];
      const reg = new RegExp(regExpEsc(arg), 'i');
      for (const channel of msg.guild.channels.values()) {
         if (reg.test(channel.name)) results.push(channel);
      }

      let querySearch;
      if (results.length > 0) {
         const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
         const filtered = results.filter(channel => regWord.test(channel.name));
         querySearch = filtered.length > 0 ? filtered : results;
      } else {
         querySearch = results;
      }

      switch (querySearch.length) {
         case 0: throw msg.language.get('RESOLVER_INVALID_CHANNEL', possible.name);
         case 1: return querySearch[0];
         default: throw `Found multiple matches: \`${querySearch.map(channel => channel.name).join('`, `')}\``;
      }
   }

   resolveChannel(query, guild) {
      if (query instanceof Channel) return guild.channels.has(query.id) ? query : null;
      if (query instanceof Message) return query.guild.id === guild.id ? query.channel : null;
      if (typeof query === 'string' && Argument.regex.channel.test(query)) return guild.channels.get(Argument.regex.channel.exec(query)[1]);
      return null;
   }
}