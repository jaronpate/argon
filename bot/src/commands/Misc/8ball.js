const { Command } = require('klasa'),
   { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         enabled: true,
         runIn: ['text'],
         permissionLevel: 0,
         requiredPermissions: ['EMBED_LINKS'],
         description: 'Gives you a random answer to a question.',
         usage: '<question:string>',
      })
   }

   async run(msg, [question]) {
      var fortunes = [
         "As I see it, yes.",
         "Ask again later.",
         "Better not tell you now.",
         "Cannot predict now.",
         "Concentrate and ask again.",
         "Don’t count on it.",
         "It is certain.",
         "It is decidedly so.",
         "Most likely.",
         "My reply is no.",
         "My sources say no.",
         "Outlook not so good.",
         "Outlook good.",
         "Reply hazy, try again.",
         "Signs point to yes.",
         "Very doubtful.",
         "Without a doubt.",
         "Yes.",
         "Yes – definitely."
      ];
      let math = (fortunes[Math.floor(Math.random() * fortunes.length)]);
      let embed = new MessageEmbed()
         .addField("❓ Question", (question))
         .addField("🎱 8ball", `${math}`)
         .setColor(this.client.config.defaultColor)
         .setFooter(`${msg.author.username}`, msg.author.displayAvatarURL({ dynamic: true, size: 2048 }).replace('.webp', '.png'))
         .setTimestamp(Date.now());
      return msg.sendMessage(embed)
   }
}