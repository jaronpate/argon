const { Command } = require('klasa'),
   { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         enabled: true,
         requiredPermissions: ['EMBED_LINKS'],
         description: 'Displays bot info.',
      })
   }

   async run(msg) {
      let createdTime = new Date(this.client.user.createdTimestamp).toUTCString();
      let embed = new MessageEmbed()
         .setColor(this.client.config.defaultColor)
         .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true, size: 2048 }).replace('.webp', '.png'))
         .addField("🤖 General", `• Created On: ${createdTime}\n• Default Prefix: ${this.client.config.prefix}\n• Website: [argon.wtf](https://www.argon.wtf)`)
         .addField("📄 Support", `• Bot Owner(s): ${Array.from(this.client.owners).map(owner => owner.tag).join(', ')}\n• Support: [Discord Server](https://discord.gg/zVBQNSm)`)
         .setFooter(`${msg.author.username}`, msg.author.displayAvatarURL({ dynamic: true, size: 2048 }).replace('.webp', '.png'))
         .setTimestamp(Date.now());
      return msg.sendMessage(embed)
   }
}
