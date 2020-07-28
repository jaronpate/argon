const { Command } = require('klasa');

module.exports = class extends Command {

   constructor(...args) {
      super(...args, {
         description: language => language.get('COMMAND_MULTIPLIER_DESCRIPTION'),
         runIn: ['text'],
         usage: '<0.5|1.0|1.5|2.0>',
         usageDelim: " ",
         permissionLevel: 6,
         requiredPermissions: ['EMBED_LINKS'],
      })
   }

   async run(msg, [choice]) {
      let check = msg.guild.settings.get('levels.multiplier');
      if (check == choice) throw msg.language.get('COMMAND_MULTIPLIER_EXISTS', choice);
      await msg.guild.settings.update('levels.multiplier', choice);
      return msg.sendLocale('COMMAND_MULTIPLIER_SUCCESS', [choice])
   }
}

