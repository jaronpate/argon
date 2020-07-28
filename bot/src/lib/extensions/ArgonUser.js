const { Structures } = require('discord.js');

module.exports = Structures.extend('User', (User) => class ArgonUser extends User {
   async getAvatar() {
      return this.displayAvatarURL({ size: 2048, dynamic: true }).replace('.webp', '.png');
   }
})

