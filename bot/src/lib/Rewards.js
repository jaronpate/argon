module.exports = class Rewards {
   constructor(client) {
      this.client = client;
   }

   async getGuildRewards(guild) {
      let rewards = await guild.settings.get('levels.rewards');
      let result = [];
      for (const reward of rewards) {
         let check = await guild.roles.get(reward.role);
         if (!check || guild.me.roles.highest.rawPosition < check.rawPosition) {
            await this.removeGuildReward(guild, reward.role)
         } else {
            result.push({ role: check, level: reward.level })
         }
      } 
      return result;
   }

   async addGuildReward(guild, role, level) {
      let rewards = await guild.settings.get('levels.rewards');
      let object = { role: role, level: level };
      await guild.settings.update('levels.rewards', object, { arrayAction: 'add' });
      return true;
   }

   async removeGuildReward(guild, role) {
      let rewards = await guild.settings.get('levels.rewards');
      let i = rewards.find((i) => i.role === role)
      await guild.settings.update('levels.rewards', i, { arrayAction: 'remove' });
      return true;
   }
}
