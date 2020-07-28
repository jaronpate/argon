const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         description: language => language.get('COMMAND_IGNORE_DESCRIPTION'),
         runIn: ['text'],
         usage: '<add|remove|list> (channel:channel) [xpgain:boolean] [commands:boolean]',
         usageDelim: " ",
         requiredPermissions: ['EMBED_LINKS'],
         subcommands: true
      })
      this.createCustomResolver('channel', async (args, possible, msg, [action]) => {
         if (action === 'list') return args;
         if (await msg.hasAtLeastPermissionLevel(6)) return this.client.arguments.get('channel').run(args, possible, msg)
         throw msg.language.get('COMMAND_IGNORE_PERMISSION_DENIED');
      })
   }

   async add(msg, [channel, xp = false, commands = false]) {
      let ignores = await this.getIgnores(msg.guild)
      if (await ignores.find((o) => o.channel === channel)) throw msg.language.get('COMMAND_IGNORE_ADD_EXISTS');
      await this.addIgnore(msg.guild, channel.id, xp, commands)
      return msg.sendLocale('COMMAND_IGNORE_ADD_ADDED');
   }

   async remove(msg, [channel]) {
      let ignores = await this.getIgnores(msg.guild);
      if (!await ignores.find((o) => o.channel === channel)) {
         throw msg.sendLocale('COMMAND_IGNORE_REMOVE_NO_EXISTS');
      }
      await this.removeIgnore(msg.guild, channel.id)
      return msg.sendLocale('COMMAND_IGNORE_REMOVE_REMOVED');
   }

   async list(msg) {
      let ignores = await this.getIgnores(msg.guild);

      if (ignores.length == 0) throw msg.language.get('COMMAND_IGNORE_LIST_NONE')

      let embed = new MessageEmbed()
         .setTitle(`${this.client.config.emojis.error} ${
            msg.language.get('COMMAND_IGNORE_IGNORES')}`)
         .setDescription(ignores.map((ignore) => {
            return `**${ignore.channel}**
            ${msg.language.get('COMMAND_IGNORE_XPGAIN')} ${ignore.xp ? this.client.config.emojis.success : this.client.config.emojis.error}
            ${msg.language.get('COMMAND_IGNORE_COMMANDS')} ${ignore.commands ? this.client.config.emojis.success : this.client.config.emojis.error}`
         }).join('\n\n'))
         .setColor(this.client.config.colors.default)
      return msg.sendMessage(embed);
   }

   async getIgnores(guild) {
      let ignores = await guild.settings.get('levels.ignores');
      let result = [];
      for (const ignore of ignores) {
         let check = await guild.channels.get(ignore.channel);
         if (!check) {
            await this.removeIgnore(guild, ignore.channel)
         } else {
            result.push({ channel: check, xp: ignore.xp, commands: ignore.commands })
         }
      }
      return result;
   }

   async addIgnore(guild, channel, xp, commands) {
      let object = { channel: channel, commands: commands, xp: xp };
      await guild.settings.update('levels.ignores', object, { arrayAction: 'add' });
      return true;
   }

   async removeIgnore(guild, channel) {
      let ignores = await guild.settings.get('ignores');
      let i = ignores.find((i) => i.channel === channel)
      await guild.settings.update('levels.ignores', i, { arrayAction: 'remove' });
      return true;
   }
}

