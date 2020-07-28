const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { emojis } = require('../config');
let emojiArray = [emojis.ticketOpen, emojis.ticketLock, emojis.ticketUnlock, emojis.ticketResolve]

module.exports = class extends Event {

    async run(r, u) {
        if (u.bot) return;
        // if (r.emoji.name !== (emojis.ticketOpen && emojis.ticketLock && emojis.ticketUnlock)) return;
        if (!emojiArray.includes(r.emoji.name)) return;
        r.users.remove(u);
        let ticketMsg = r.message.guild.settings.get('messages.tickets');
        let suppRoleId = r.message.guild.settings.get('roles.support');
        let suppRole = r.message.guild.roles.get(suppRoleId);
        let eRole = r.message.guild.roles.everyone.id;
        // Create Channel
        if (r.emoji.name === emojis.ticketOpen && ticketMsg && ticketMsg === r.message.id) {
            let c = await r.message.guild.channels.create(`support-${u.username}-${u.id}`, {
                permissionOverwrites: [
                    {
                        id: eRole,
                        deny: ["VIEW_CHANNEL"],
                        type: 'role'
                    },
                    {
                        id: suppRole,
                        allow: ["VIEW_CHANNEL"],
                        type: 'role'
                    },
                    {
                        id: u.id,
                        allow: ["VIEW_CHANNEL"],
                        type: 'user'
                    },
                    {
                        id: this.client.user.id,
                        allow: ["VIEW_CHANNEL"],
                        type: 'user'
                    }
                ],
                position: r.message.channel.rawPosition,
                parent: r.message.channel.parent,
                // topic: created,
                resolved: false,
                locked: false
            });
            r.message.guild.settings.update('data.tickets', {
                id: c.id,
                channel: c.id,
                user: u.id,
                username: u.username,
                tag: u.tag,
                guild: r.message.guild.id,
                createdTimestamp: Date.now(),
            }, { arrayAction: 'add' });
            this.client.settings.sync()
            let embed = new MessageEmbed()
                .setColor(this.client.config.colors.default)
                .setTitle(`Support Channel For ${u.username}`)
                .setDescription(`<@${u.id}>, this is your personal chat with <@&${suppRoleId}>.`)
            let m = await c.send(embed);
            m.react(emojis.ticketLock);
            m.react(emojis.ticketUnlock);
            m.react(emojis.ticketResolve);
            return;
        }
        let member = await r.message.guild.members.fetch(u.id);
        if (!member.roles.has(suppRoleId) && !member.hasPermission('ADMINISTRATOR')) return;
        let tickets = r.message.guild.settings.get('data.tickets');
        let filteredTicket = tickets.filter(t => t.id.toString() === r.message.channel.id)[0];
        // Lock Channel
        if (r.emoji.name === emojis.ticketLock && filteredTicket) {
            let c = r.message.guild.channels.resolve(filteredTicket.channel);
            c.edit({
                permissionOverwrites: [
                    {
                        id: eRole,
                        deny: ["VIEW_CHANNEL"],
                        type: 'role'
                    },
                    {
                        id: suppRole,
                        allow: ["VIEW_CHANNEL"],
                        type: 'role'
                    },
                    {
                        id: filteredTicket.user,
                        allow: ["VIEW_CHANNEL"],
                        deny: ["SEND_MESSAGES"],
                        type: 'user'
                    },
                    {
                        id: this.client.user.id,
                        allow: ["VIEW_CHANNEL"],
                        type: 'user'
                    }
                ],
            });
            // Update Ticket
            let newTicket = filteredTicket;
            newTicket.locked = true;
            tickets[tickets.indexOf(filteredTicket)] = newTicket;
            await r.message.guild.settings.update('data.tickets', tickets, { arrayAction: 'overwrite' });
            return;
        }
        // Unlock Channel
        if (r.emoji.name === emojis.ticketUnlock && filteredTicket) {
            let c = r.message.guild.channels.resolve(filteredTicket.channel);
            c.edit({
                permissionOverwrites: [
                    {
                        id: eRole,
                        deny: ["VIEW_CHANNEL"],
                        type: 'role'
                    },
                    {
                        id: suppRole,
                        allow: ["VIEW_CHANNEL"],
                        type: 'role'
                    },
                    {
                        id: filteredTicket.user,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                        type: 'user'
                    },
                    {
                        id: this.client.user.id,
                        allow: ["VIEW_CHANNEL"],
                        type: 'user'
                    }
                ],
            });
            // Update Ticket
            let newTicket = filteredTicket;
            newTicket.locked = false;
            tickets[tickets.indexOf(filteredTicket)] = newTicket;
            await r.message.guild.settings.update('data.tickets', tickets, { arrayAction: 'overwrite' });
            return;
        }
        // Resolve Ticket
        if (r.emoji.name === emojis.ticketResolve && filteredTicket) {
            let logChannel = r.message.guild.settings.get('channels.ticketlog');
            let c = r.message.guild.channels.resolve(filteredTicket.channel);
            let ticketLog = await c.messages.fetch();
            c.delete();
            let newTicket = filteredTicket;
            newTicket.resolved = true;
            newTicket.resolvedTimestamp = Date.now();
            newTicket.log = [];
            let usersList = [];
            let users = "";
            ticketLog.forEach(m => {
                newTicket.log.push({
                    author: { id: m.author.id, username: m.author.username, avatar: m.author.displayAvatarURL() },
                    content: m.content,
                    embeds: m.embeds,
                    // edits: m.edits,
                    createdAt: m.createdAt,
                    createdTimestamp: m.createdTimestamp
                });
                if (!usersList.includes(m.author.id) && m.author.id !== this.client.user.id) {
                    usersList.push(m.author.id);
                    users = users.concat(`<@${m.author.id}> \n`);
                }
            });
            tickets[tickets.indexOf(filteredTicket)] = newTicket;
            await r.message.guild.settings.update('data.tickets', tickets, { arrayAction: 'overwrite' });
            if (logChannel) {
                logChannel = await r.message.guild.channels.resolve(logChannel);
                let embed = new MessageEmbed()
                    .setColor(this.client.config.colors.default)
                    .setTitle(`${newTicket.tag} (${newTicket.user})`)
                    .addField('Ticket Owner', `<@${newTicket.user}>`, true)
                    .addField('Ticket ID', `${newTicket.id}`, true)
                    .addField('Users Present', `${(users === "") ? 'None' : users}`, true)
                    .addField('Created', `${new Date(newTicket.createdTimestamp).toUTCString()}`, true)
                    .addField('Resolved', `${newTicket.resolvedTimestamp ? new Date(newTicket.resolvedTimestamp).toUTCString() : "N/A"}`, true)
                logChannel.send(embed);
            }
            return;
        }
    }
};