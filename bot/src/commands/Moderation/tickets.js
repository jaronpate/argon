const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { emojis } = require('../../config');

module.exports = class extends Command {

   constructor(...args) {
      super(...args, {
         name: 'tickets',
         description: 'Add ticket support to your server.',
         permissionLevel: 5,
         runIn: ['text'],
         usage: '<setup|find> (role:role) [channel:channel]',
         usageDelim: " ",
         subcommands: true
      })
      this.createCustomResolver('role', async (args, possible, msg, [action]) => {
         if (action === "find") {
            return this.client.arguments.get('string').run(args, possible, msg);
         }
         return this.client.arguments.get('role').run(args, possible, msg);
      })
   }

   async setup(msg, [role, channel]) {
      await msg.delete()
      let embed = new MessageEmbed()
         .setColor(this.client.config.colors.default)
         .setTitle('Support')
         .setDescription(`React to open a support ticket.`)
      let m = await msg.channel.send(embed);
      m.react(emojis.ticketOpen);
      m.guild.settings.update({
         'messages.tickets': m.id,
         'roles.support': role.id,
         'channels.ticketlog': (channel) ? channel.id : null
      });

      m.guild.settings.sync();
   }

   async find(msg, [id]) {
      let tickets = await msg.guild.settings.get('data.tickets');
      if (!tickets) { return msg.channel.send("No tickets found.") }
      let t = tickets.filter(t => t.created.toString() === id)[0];
      if (!t) { return msg.channel.send("No tickets found.") }

      let usersList = [];
      let users = "";

      if (t.log) {
         t.log.forEach(m => {
            if (!usersList.includes(m.author.id) && m.author.id !== this.client.user.id) {
               usersList.push(m.author.id);
               users = users.concat(`<@${m.author.id}> \n`);
            }
         });
      }

      let embed = new MessageEmbed()
         .setColor(this.client.config.colors.default)
         .setTitle(`${t.tag} (${t.user})`)
         .addField('Ticket Owner', `<@${t.user}>`, true)
         .addField('Ticket ID', `${t.id}`, true)
         .addField('Users Present', `${(users === "") ? users : "None"}`, true)
         .addField('Created', `${new Date(t.createdTimestamp).toUTCString()}`, true)
         .addField('Resolved', `${t.resolvedTimestamp ? new Date(t.resolvedTimestamp).toUTCString() : "N/A"}`, true)
      msg.channel.send(embed);
   }
};
