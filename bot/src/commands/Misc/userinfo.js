const { Command } = require('klasa'),
   { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         enabled: true,
         requiredPermissions: ['EMBED_LINKS'],
         description: 'Displays user info.',
         usage: "[user:user]"
      })
      this.statuses = {
         online: 'Online',
         idle: 'Idle',
         dnd: 'Do Not Disturb',
         offline: 'Offline'
      };
   }

   async run(msg, [user = msg.author]) {
      let member = msg.guild.members.get(user.id) ? msg.guild.members.get(user.id) : undefined;
      let joinedTime = ""
      member ? joinedTime = new Date(member.joinedAt).toUTCString() : ""
      let createdTime = new Date(user.createdTimestamp).toUTCString();
      let embed = new MessageEmbed()
         .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 2048 }).replace('.webp', '.png'))
         .addField('🚶 __**User Info**__', `• Username: ${user.username}#${user.discriminator}\n• Created At: ${createdTime}\n• ID: ${user.id}\n• ${user.bot ? 'Account Type: Bot' : 'Account Type: User'}`)
         .setColor(this.client.config.defaultColor)
         .setFooter(`${msg.author.username}`, msg.author.displayAvatarURL({ dynamic: true, size: 2048 }).replace('.webp', '.png'))
         .setTimestamp(Date.now())
      member ? embed.addField('🛡️ __**Guild-based Info**__', `• Nickname: ${member.nickname ? member.nickname : 'No nickname.'}\n• Roles: ${member.roles.filter(r => r.name !== "@everyone").map(role => `\`${role.name}\``).join(', ')}\n• Joined at: ${joinedTime}\n• Last Message: ${user.lastMessage ? user.lastMessage : "None logged."}`) : ""
      return msg.sendMessage(embed);
   }
}
