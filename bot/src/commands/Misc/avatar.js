const { Command } = require('klasa'),
   { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         enabled: true,
         aliases: ['av'],
         runIn: ['text'],
         requiredPermissions: ['EMBED_LINKS'],
         description: 'Displays the users avatar.',
         usage: '[user:user]',
      })
   }

   async run(msg, [user = msg.author]) {
      let embed = new MessageEmbed()
         .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }).replace('.webp', '.png'))
         .setTitle("Avatar for " + user.tag)
         .setColor(this.client.config.defaultColor);
      return msg.sendMessage(embed)
   }
}