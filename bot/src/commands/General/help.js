const { Command, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         aliases: ['commands', 'cmd', 'cmds'],
         guarded: true,
         requiredPermissions: ['EMBED_LINKS'],
         description: language => language.get('COMMAND_HELP_DESCRIPTION'),
         usage: '[command:command]'
      })
      this.handlers = new Map();
   }

   async run(msg, [command]) {
      if (command) {
         let embed = new MessageEmbed()
            .setColor(this.client.config.colors.default)
            .setTitle(command.name)
            .addField(
               msg.language.get(`COMMAND_DESCRIPTION`),
               util.isFunction(command.description) ? command.description(msg.language) : command.description
            )
            .addField(
               msg.language.get(`COMMAND_USAGE`),
               command.usage.fullUsage(msg)
            )
            .addField(
               msg.language.get(`COMMAND_HELP_EXTENDED_HELP`),
               util.isFunction(command.extendedHelp) ? command.extendedHelp(msg.language) : command.extendedHelp
            )
            .addField(
               `NSFW`,
               command.nsfw ? msg.language.get('COMMAND_HELP_YES') : msg.language.get('COMMAND_HELP_NO')
            )
            .addField(
               msg.language.get(`COMMAND_HELP_COOLDOWN`),
               command.cooldown ? command.cooldown : msg.language.get('COMMAND_HELP_NO_COOLDOWN')
            )
         return msg.channel.send(embed)
      }

      const commands = await this.fetchCommands(msg);
      const prefix = msg.guild.settings.get('prefix');
      const embed = new MessageEmbed()
         .setTitle(msg.language.get('COMMAND_HELP_COMMANDS'))
         .setColor(this.client.config.colors.default);
      for (const [category, list] of commands) {
         embed.addField(`• **${category}**`, list.map(this.formatCommand.bind(this, msg, prefix)).join('\n'))
      }
      return msg.channel.send(embed);
   }

   formatCommand(msg, prefix, command) {
      const description = util.isFunction(command.description) ?
         command.description(msg.language) :
         command.description;
      return `${prefix}${command.name} → ${description}`;
   }

   async fetchCommands(msg) {
      const commands = new Map();
      await Promise.all(this.client.commands.map((command) => {
         if (command.hidden || command.permissionLevel >= 9 && !msg.hasAtLeastPermissionLevel(9)) return;
         const category = commands.get(command.category);
         if (category) category.push(command);
         else commands.set(command.category, [command]);
      }));
      return commands;
   }
}; 