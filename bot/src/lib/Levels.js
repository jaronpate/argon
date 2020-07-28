const { MessageEmbed } = require('discord.js');
const moment = require('moment');

class Levels {
   constructor(client) {
      this.client = client;
   }

   getLevelExp(level) {
      return 5 * (Math.pow(level, 2)) + 50 * level + 100;
   }

   getExpFromLevel(level) {
      let exp = 0
      for (let i = level - 1; i >= 0; i--) {
         exp += this.getLevelExp(i);
      }
      return exp;
   }

   getLevelFromExp(exp) {
      let level = 0;

      while (exp >= this.getLevelExp(level)) {
         exp -= this.getLevelExp(level);
         level++;
      }

      return level;
   };

   getLevelProgress(exp) {
      let level = 0;

      while (exp >= this.getLevelExp(level)) {
         exp -= this.getLevelExp(level);
         level++;
      }

      return exp;
   };

   async getGlobalLeaderboard() {
      let provider = this.client.providers.get('mongodb');
      let users = await provider.getAll('users');
      return users.sort((a, b) => parseFloat(b.exp) - parseFloat(a.exp))
   }

   getGlobalExp(user) {
      return user.settings.get('exp')
   }

   async setGlobalExp(user, xp) {
      await user.settings.sync(true)
      return user.settings.update({
         'exp': xp,
         'tag': user.tag
      })
   }

   async giveGlobalExp(user) {
      if (moment().diff(user.timeout || 0) < 0) return;
      user.timeout = moment().add(1, 'minutes');

      const oldExp = await this.getGuildMemberExp(user);
      const newExp = oldExp + this.client.util.randomInt(15, 25);

      await this.setGlobalExp(user, newExp);

      return;
   }

   async setGuildMemberExp(member, xp, msg, update = false) {
      await member.settings.sync(true)
      if (update) await this.updateUserRoles(member, msg);
      return member.settings.update({
         'exp': xp
      })
   }

   getGuildLeaderboard(guild) {
      let leaderboard = [];
      guild.members.forEach((member) => {
         let xp = member.settings.get('exp');
         leaderboard.push({ exp: xp, member: member.id })
      })
      return leaderboard.sort((a, b) => parseFloat(b.exp) - parseFloat(a.exp));
   };

   getGuildMemberExp(member) {
      return member.settings.get('exp')
   }


   async giveGuildUserExp(member, msg) {
      if (moment().diff(member.timeout || 0) < 0) return;
      member.timeout = moment().add(1, 'minutes');

      const multiplier = msg.guild.settings.get('levels.multiplier');
      const oldExp = await this.getGuildMemberExp(member);
      const oldLvl = this.getLevelFromExp(oldExp);
      const newExp = oldExp + (this.client.util.randomInt(15, 25) * multiplier);
      const newLvl = this.getLevelFromExp(newExp);

      await this.setGuildMemberExp(member, newExp, msg);

      if (oldLvl != newLvl) {
         await this.updateUserRoles(member, msg);

         const check = await msg.guild.settings.get('levels.rankup.enabled')
         if (!check) return;

         let type = msg.guild.settings.get('levels.rankup.type')
         let text = msg.guild.settings.get('levels.rankup.text')
         text = text.replace(/\%member/ig, member).replace(/\%username/ig, member.user.username).replace(/\%level/ig, newLvl);
         switch (type) {

            case "embed":
               let levelUpEmbed = new MessageEmbed()
                  .setColor(this.client.config.colors.default)
                  .setDescription(text)
               await msg.channel.send(levelUpEmbed).catch(() => { })
               break;
            case "message":
               await msg.channel.send(text).catch(() => { })
               break;
         }
      }
      return;
   }

   async updateUserRoles(member, msg) {
      try {
         const exp = (await this.getGuildMemberExp(member));
         const lvl = this.getLevelFromExp(exp);
         if (lvl === 0) return;
         let rewards = await this.client.rewards.getGuildRewards(msg.guild);
         if (rewards.length > 0) {
            let rolesToAdd = [];
            for (const reward of rewards) {
               if (reward.level > lvl) return;
               if (!member.roles.has(reward) && msg.guild.me.roles.highest.rawPosition > reward.role.rawPosition) {
                  rolesToAdd.push(reward.role);
               }
            }
            try {
               if (!member.roles.has(rolesToAdd)) {
                  return await member.roles.add(rolesToAdd).catch(() => { })
               }
               return;
            } catch (err) {
               return member.client.rewards.removeGuildReward(member.guild, rolesToAdd)
            }
         }
         return;
      } catch (err) {
         console.log(err)
      }
   }
}

module.exports = Levels;
