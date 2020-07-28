const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

   constructor(...args) {
      super(...args, {
         enabled: true
      });
   }

   async run(msg, command, response, runTime) {
      let data = {
         guild: msg.guild ? msg.guild.id : msg.channel.id,
         // user: msg.author.id,
         command: command.name,
         ran: Date.now()
      }
      this.client.users.get(msg.author.id).settings.update('commandLog', data);
   }
};