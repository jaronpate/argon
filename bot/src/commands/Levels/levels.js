const { Command, CommandStore, KlasaMessage } = require('klasa');
const { MessageEmbed } = require('discord.js');
const d3 = require('d3-format');
const format = (number) => number > 999 ? d3.format('.3s')(number) : number;

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         description: language => language.get('COMMAND_LEVELS_DESCRIPTION'),
         aliases: ['leaderboard', 'leaderboards'],
         requiredPermissions: ['EMBED_LINKS'],
         usage: '<global|server:default> [page:integer]',
         usageDelim: ' ',
         subcommands: true
      })
   }

   async server(msg, [page]) {
      const data = await msg.client.levels.getGuildLeaderboard(msg.guild)
      const filteredData = data.filter(member => member.exp !== 0)
      if (filteredData.length === 0) {
         throw msg.language.get('COMMAND_LEVELS_NO_DATA');
      }
      const leaderboard = this.client.util.paginate(filteredData, page, 10)

      let embed = new MessageEmbed()
         .setTitle(msg.guild.name)
         .setURL(`https://argon.wtf/leaderboards/${msg.guild.id}/`)
         .setThumbnail(msg.guild.iconURL({ size: 2048, dynamic: true }).replace('.webp', '.png'))
         .setDescription(leaderboard.items.map((item) => {
            let level = msg.client.levels.getLevelFromExp(item.exp)
            let levelExp = msg.client.levels.getLevelExp(level)
            let progress = msg.client.levels.getLevelProgress(item.exp)
            let langLevel = msg.language.get('COMMAND_LEVELS_LEVEL')
            return `**${filteredData.indexOf(item) + 1}.** <@${item.member}> - ${langLevel} ${level} (${format(progress)}/${format(levelExp)})\n`
         }))
         .setColor(this.client.config.colors.default)
         .setFooter(`${filteredData.length} ${
            msg.language.get('COMMAND_LEVELS_USERS')} | ${
            msg.language.get('PAGE')} ${leaderboard.page}/${leaderboard.maxPage}`)
         .setTimestamp();
      await msg.sendMessage(embed);
   }

   async global(msg, [page]) {
      const data = await msg.client.levels.getGlobalLeaderboard()
      const filteredData = data.filter((user) => user.exp !== 0)
      if (filteredData.length === 0) {
         throw msg.language.get('COMMAND_LEVELS_GLOBAL_NO_DATA');
      }
      const leaderboard = this.client.util.paginate(filteredData, page, 10)

      let embed = new MessageEmbed()
         .setTitle(`:globe_with_meridians: ${
            msg.language.get('COMMAND_LEVELS_GLOBAL_LEADERBOARD')}`)
         .setDescription(leaderboard.items.map((item) => {
            let level = msg.client.levels.getLevelFromExp(item.exp)
            let levelExp = msg.client.levels.getLevelExp(level)
            let progress = msg.client.levels.getLevelProgress(item.exp)
            let langLevel = msg.language.get('COMMAND_LEVELS_LEVEL')
            return `**${filteredData.indexOf(item) + 1}.** ${item.tag} - ${langLevel} ${level} (${format(progress)}/${format(levelExp)})\n`
         }))
         .setColor(this.client.config.colors.default)
         .setFooter(`${filteredData.length} ${
            msg.language.get('COMMAND_LEVELS_USERS')} | ${
            msg.language.get('PAGE')} ${leaderboard.page}/${leaderboard.maxPage}`)
         .setTimestamp();
      await msg.sendMessage(embed);
   }
};