const { Command, CommandStore, KlasaMessage } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         description: language => language.get('COMMAND_REWARD_DESCRIPTION'),
         runIn: ['text'],
         usage: '<add|remove|list> (role:role) (level:integer{1})',
         usageDelim: " ",
         requiredPermissions: ['EMBED_LINKS'],
         subcommands: true
      });
      this.createCustomResolver('role', async (args, possible, msg, [action]) => {
         if (action === "list") return args;
         if (await msg.hasAtLeastPermissionLevel(6)) {
            return this.client.arguments.get('role').run(args, possible, msg)
         }
         throw msg.language.get('COMMAND_REWARD_NO_PERMISSION');
      })
      this.createCustomResolver('integer', (args, possible, msg, [action]) => {
         if (!action) return;
         if (["list", "remove"].includes(action)) return args;
         return this.client.arguments.get('integer').run(args, possible, msg);
      });
   }

   async add(msg, [role, level]) {
      let ignores = await this.client.rewards.getGuildRewards(msg.guild);
      if (await ignores.find(o => o.role === role)) {
         throw msg.language.get('COMMAND_REWARD_ADD_EXISTS');
      }
      await this.client.rewards.addGuildReward(msg.guild, role.id, level)
      return msg.sendLocale('COMMAND_REWARD_ADD_SUCCESS');
   }

   async remove(msg, [role]) {
      let rewards = await this.client.rewards.getGuildRewards(msg.guild);
      if (!await rewards.find(o => o.role === role)) {
         throw msg.language.get('COMMAND_REWARD_REMOVE_NO_EXISTS');
      }
      await this.client.rewards.removeGuildReward(msg.guild, role.id)
      return msg.sendLocale('COMMAND_REWARD_REMOVE_SUCCESS');
   }

   async list(msg) {
      let rewards = await this.client.rewards.getGuildRewards(msg.guild);

      if (rewards.length == 0) {
         throw msg.language.get('COMMAND_REWARD_LIST_NONE');
      }

      let embed = new MessageEmbed()
         .setTitle(`🏆 ${msg.language.get('COMMAND_REWARD_LIST_REWARDS')}`)
         .setDescription(rewards.map((reward) => {
            return `${reward.role} - ${msg.language.get('COMMAND_REWARD_LIST_LEVEL')} ${reward.level}`
         }).join('\n'))
         .setColor(this.client.config.colors.default)
      return msg.sendMessage(embed);
   }
};

