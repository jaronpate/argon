const { Monitor } = require('klasa');

module.exports = class extends Monitor {
   async run() {
      if (msg.author.bot) return;
      await this.client.levels.giveGlobalExp(msg.author)
      if (!msg.guild) return;
      let check = await msg.guild.settings.get('levels.ignores');
      if (await check.find((o) => o.channel === msg.channel.id && o.xp === false)) return;
      await this.client.levels.giveGuildUserExp(msg.member, msg)
   }
}