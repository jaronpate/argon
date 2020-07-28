const { GuildMember } = require('klasa-member-gateway');
const { MessageEmbed } = require('discord.js')

class ModLog {
   constructor(guild) {
      this.guild = guild;
      this.client = this.guild.client;

      this.type = undefined;
      this.moderator = undefined;
      this.user = undefined;
      this.reason = undefined;
      this.duration = undefined;
      this.caseNumber = undefined;
   };

   setType(type) {
      this.type = type;
      return this;
   }

   async setUser(member) {
      this.user = {
         id: member.id,
         tag: member.user.tag,
         avatar: await member.user.getAvatar()
      }
      return this;
   }

   setDuration(duration) {
      this.duration = duration;
      return this;
   }

   async setModerator(moderator, avatar = moderator.user ? moderator.user.getAvatar() : undefined) {
      if (moderator.user) {
         this.moderator = {
            id: moderator.id,
            tag: moderator.user.tag,
            avatar: avatar
         }
         return this;
      }
      this.moderator = {
         id: 0,
         tag: moderator,
         avatar: avatar
      }
      return this;
   }

   setReason(reason = undefined) {
      if (reason instanceof Array) reason = reason.join(' ');
      this.reason = reason
      return this;
   }

   async send() {
      const channel = await this.guild.channels.get(this.guild.settings.get('channels.modlog'));
      if (!channel) return console.log('The modlog channel does not exist, did it get deleted?');
      await this.getCase();
      return channel.send({ embed: this.embed });
   }

   async getCase() {
      this.caseNumber = (this.guild.settings.get('data.modlogs').length) + 1;
      const { errors } = await this.guild.settings.update('data.modlogs', this.pack);
      if (errors) throw errors[0];
      return this.caseNumber;
   }

   static async getMutedRole(client, _guild) {
      const guild = await client.guilds.get(_guild)
      if (!guild) return;
      const get = await guild.settings.get('roles.muted');
      let fetch = await guild.roles.fetch(get);
      if (fetch !== null) {
         return {
            created: false,
            role: fetch
         };
      }
      return await this.findMutedRole(guild);
   }

   static async findMutedRole(guild) {
      return new Promise(async (fulfill, reject) => {
         try {
            let filtered = await guild.roles.filter(r => r.name.match(/Muted/i))
            if (filtered.array().length === 0) {
               await this.createMutedRole(guild).then(role => {
                  fulfill(role)
               })
            }
            for (const role of filtered.values()) {
               if (guild.me.roles.highest.rawPosition >= role.rawPosition) {
                  await guild.settings.update('roles.muted', role.id)
                  fulfill({
                     created: false,
                     role: role
                  });
               }
            }
         } catch (err) {
            console.log(err)
            reject(err)
         }
      })
   }

   static async createMutedRole(guild) {
      return new Promise(async (fulfill, reject) => {
         try {
            let role = await guild.roles.create({
               data: {
                  name: 'Muted',
                  color: '#3D3D3D',
               }
            })
            await guild.settings.update('roles.muted', role.id)
            await this.channelMuteOverwrites(guild, role);
            fulfill({ created: true, role: role });
         } catch (err) {
            reject(err)
         }
      })
   }

   static async channelMuteOverwrites(guild, role) {
      return new Promise(async (fulfill, reject) => {
         try {
            for (const channel of guild.channels.values()) {
               if (channel.type === ("text" || "category")) {
                  await channel.createOverwrite(role, {
                     SEND_MESSAGES: false
                  }).catch(console.error)
               }
               if (channel.type === ("voice" || "category")) {
                  await channel.createOverwrite(role, {
                     CONNECT: false
                  }).catch(console.error)
               } else {
                  continue;
               }
            }
            fulfill();
         } catch (err) {
            reject(err)
         }
      })
   }

   static colour(type) {
      switch (type) {
         case 'ban': return '#FF311D';
         case 'kick': return '#FF311D';
         case 'softban': return '#FF311D';
         case 'warn': return '#E67E22';
         case 'mute': return '#FCC141';
         case 'unban': return '#21CC71';
         case 'unmute': return '#21CC71';
         default: return '#FFFFFF';
      }
   }

   static action(type) {
      switch (type) {
         case 'ban': return 'Member Banned';
         case 'kick': return 'Member Kicked';
         case 'softban': return 'Member Softbanned';
         case 'warn': return 'Member Warned';
         case 'mute': return 'Member Muted';
         case 'unban': return 'Member Unbanned';
         case 'unmute': return 'Member Unmuted';
      }
   }

   toUpperCase(string) {
      return `${string[0].toUpperCase()}${string.slice(1)}`
   }

   get pack() {
      let object = {
         type: this.type,
         user: this.user,
         moderator: this.moderator,
         reason: this.reason,
         duration: ["mute", "unmute"].includes(this.type) ? this.duration : undefined,
         caseNumber: this.caseNumber,
         date: Date.now()
      };

      return object
   }

   get embed() {
      const embed = new MessageEmbed()
         .setColor(ModLog.colour(this.type))
         .setTitle(ModLog.action(this.type))
         .addField(`**Member**`, `${this.user.tag} (${this.user.id})`)
         // .setThumbnail(this.user.avatar)
         .addField(`**Reason**`, (this.moderator.id === 0) ? "Mute expired" : `${this.reason || `No reason specified`}`)
         .setFooter(`Case ${this.caseNumber}`)
         // .setAuthor(this.moderator.avatar, this.moderator.tag)
         .setTimestamp();
      this.type === ("mute" || "unmute") && this.duration ? embed.addField(`**Duration**`, `${toUpperCase(this.duration)}`) : ""
      return embed;
   }
};

module.exports = ModLog