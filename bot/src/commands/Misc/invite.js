const { Command } = require('klasa');

module.exports = class extends Command {

   constructor(...args) {
      super(...args, {
         guarded: true,
         description: `Generates a link for you to invite the bot with.`
      });
   }

   async run(message) {
      return message.sendLocale('COMMAND_INVITE');
   }

   async init() {
      if (this.client.application && !this.client.application.botPublic) this.permissionLevel = 10;
   }
};