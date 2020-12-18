const { MessageAttachment } = require('discord.js');
const { Canvas } = require('canvas-constructor');
const { Command } = require('klasa');
const fetch = require('node-fetch');
const d3 = require('d3-format');
const toPercentage = (current, total) => Math.round(current / total * 515);
const format = (number) => number > 999 ? d3.format('.3s')(number) : number;

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         description: language => language.get('COMMAND_RANK_DESCRIPTION'),
         requiredPermissions: ['ATTACH_FILES'],
         usage: '<global|server:default> [member:member] [...]',
         usageDelim: ' ',
         subcommands: true
      })
   }

   async server(msg, [member = msg.member]) {
      const data = await msg.client.levels.getGuildLeaderboard(msg.guild),
         filteredData = data.filter((member) => member.exp !== 0),
         currentExp = (await msg.client.levels.getGuildMemberExp(member)),
         currentRank = filteredData.map(e => e.member).indexOf(member.id) + 1,
         currentLevel = await msg.client.levels.getLevelFromExp(currentExp),
         levelExp = await msg.client.levels.getLevelExp(currentLevel),
         currentLevelExp = await msg.client.levels.getLevelProgress(currentExp);

      if (currentExp == 0) {
         throw (msg.member.id === member.id) ?
            msg.language.get('COMMAND_RANK_SELF_UNRANKED') :
            msg.language.get('COMMAND_RANK_USER_UNRANKED')
      }

      const attachment = new MessageAttachment(await this.generate(
         currentLevelExp,
         levelExp,
         currentRank,
         currentLevel,
         member.user,
         member.user.settings.get('colors.rankcard'))
      );
      msg.sendMessage(attachment);
   }

   async global(msg, [member = msg.member]) {
      const data = await msg.client.levels.getGlobalLeaderboard(),
         filteredData = data.filter((user) => user.exp !== 0),
         currentExp = (await msg.client.levels.getGlobalExp(member.user)),
         currentRank = filteredData.map((e) => e.id).indexOf(member.user.id) + 1,
         currentLevel = await msg.client.levels.getLevelFromExp(currentExp),
         levelExp = await msg.client.levels.getLevelExp(currentLevel),
         currentLevelExp = await msg.client.levels.getLevelProgress(currentExp);

      if (currentExp == 0) {
         throw (msg.member.id === member.id) ?
            msg.language.get('COMMAND_RANK_SELF_UNRANKED') :
            msg.language.get('COMMAND_RANK_USER_UNRANKED')
      }

      const attachment = new MessageAttachment(await this.generate(
         currentLevelExp,
         levelExp,
         currentRank,
         currentLevel,
         member.user,
         member.user.settings.get('colors.rankcard'))
      );
      return msg.sendMessage(attachment);
   }

   async generate(current, total, rank, level, user, color) {
      current = current.toString();
      total = total.toString();
      rank = rank.toString();
      level = level.toString();
      color = color.toString();

      let correctX = 0;
      const avatar = await fetch(user.displayAvatarURL({ format: 'png', size: 2048 })).then(res => res.buffer());
      let canvas = new Canvas(934, 282)
      canvas
         .setTextFont("Lucida Sans")
         .setColor(`#1c1c1c`)
         .addRect(0, 0, 934, 282)
         .setColor('#2b2b2b')
         .beginPath()
         .arc(400, 170, 20, Math.PI * 0.5, Math.PI * 1.5)
         .fill()
         .closePath()
         .addRect(400, 150, 475, 40)
         .beginPath()
         .arc(875, 170, 20, Math.PI * 0.5, Math.PI * 1.5, true)
         .fill()
         .closePath()
         .addCircle(270, 230, 20)
         .beginPath()
         .moveTo(0, 0)
         .lineTo(240, 0)
         .lineTo(350, 282)
         .lineTo(0, 282)
         .closePath()
         .setShadowColor('black')
         .setShadowBlur(20)
         .setColor(`${color}`)
         .fill()
         .createRoundPath(141, 141, 100)
         .setShadowColor('black')
         .fill()
         .addCircularImage(avatar, 141, 141, 100)
         .setTextSize(35)
         .setTextAlign('start')
         .setColor('white')
         .addResponsiveText(user.username, 390, 130, 150)
         .measureText(user.username, ({ width }) => correctX = width)
         .setTextSize(25)
         .setColor('#7F8384')
         .addText(`#${user.discriminator}`, correctX + 390, 130)
         .setTextSize(24)
         .setColor('#7F8384')
         .setTextAlign('right')
         .addText(`/ ${format(total)} XP`, 875, 130)
         .measureText(`/ ${format(total)} XP`, (size) => correctX = 870 - size.width)
         .setColor('#FFFFFF')
         .addText(format(current), correctX, 130)
         .save()
         .setColor('white')
         .setTextAlign('center')
         .setShadowColor('black')
         .setShadowBlur(5)
         .addText(`Level ${level} | #${rank}`, (400 + (875 - 400) / 2), 230, 322)


      let percent = toPercentage(current, total);
      if (percent < 40) return canvas.toBufferAsync();
      let width = percent -= 40
      canvas
         .setShadowColor('transparent')
         .setColor(`${color}`)
         .addCircle(400, 170, 20)
         .addRect(400, 150, width, 40)
         .addCircle(400 + percent, 170, 20);

      return canvas.toBufferAsync();
   }
}
