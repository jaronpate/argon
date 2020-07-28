const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         description: language => language.get('COMMAND_RANKUP_DESCRIPTION'),
         runIn: ['text'],
         usage: '<toggle|mode|text> (input:string) [...]',
         permissionLevel: 6,
         usageDelim: ' ',
         requiredPermissions: ['EMBED_LINKS'],
         subcommands: true,
         quotedStringSupport: true
      })
      this.createCustomResolver('string', async (args, possible, msg, [action]) => {
         let possibles = ['embed', 'message'];
         if (action === "mode" && !possibles.includes(args)) {
            throw msg.language.get('COMMAND_RANKUP_NO_POSSIBLES', possibles.join(', '));
         }
         if (action === 'toggle') return;
         if (args) return args;
         return this.client.arguments.get('string').run(args, possible, msg);
      })
   }

   async toggle(msg) {
      let check = msg.guild.settings.get('levels.rankup.enabled');
      let boolean;
      check ? boolean = false : boolean = true
      await msg.guild.settings.update('levels.rankup.enabled', boolean);
      return msg.sendLocale('COMMAND_RANKUP_TOGGLE_SUCCESS', [boolean]);
   }

   async mode(msg, [input]) {
      let check = msg.guild.settings.get('levels.rankup.type');
      if (check === input) throw msg.language.get('COMMAND_RANKUP_MODE_EXISTS', input);
      await msg.guild.settings.update('levels.rankup.type', input);
      return msg.sendLocale('COMMAND_RANKUP_MODE_SUCCESS', [input]);
   }

   async text(msg, [...input]) {
      input = input.join(' ');
      let check = msg.guild.settings.get('levels.rankup.text');
      if (check === input) throw msg.language.get('COMMAND_RANKUP_MESSAGE_EXISTS', input);
      await msg.guild.settings.update('levels.rankup.text', input);
      if (!input.includes('%member' && '%level' || '%username' && '%level')) {
         let embed = new MessageEmbed()
            .setColor(this.client.config.colors.default)
            .setDescription(msg.language.get('COMMAND_RANKUP_TEXT_MISSING'));
         msg.sendMessage(embed)
      }
      return msg.sendLocale('COMMAND_RANKUP_MESSAGE_SUCCESS', [input])
   }
};

