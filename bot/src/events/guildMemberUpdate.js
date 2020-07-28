const { Event, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {
    async run(oldMember, member) {
        let lc = member.guild.settings.get('channels.logs')
        if (!lc) return;
        let webhooks = await member.guild.fetchWebhooks()
        let logsChannel = webhooks.get(lc)
        if (!logsChannel) return;

        if (!member.guild.settings.get('toggles.logs.members')) return;
        if (!member.guild.me.permissions.has("MANAGE_WEBHOOKS")) return;
        let changes = Object.keys(diff(oldMember, member));
        if (arraysEqual(oldMember._roles, member._roles)) { changes.shift() }
        if (changes.length <= 0) { return }

        const embed = new MessageEmbed()
            .setDescription(`**${member} Updated**`)
            .setColor(this.client.config.colors.blue)
            // .addField('Changed', changes)
            .setAuthor(`${member.user.tag} ${member && member.nick ? `(${member.nick})` : ''}`, await member.user.getAvatar())
            .setTimestamp();
        if (changes.includes("nickname")) {
            embed.setDescription(`**${member} nickname updated**`)
            embed.addField('Before', oldMember.nickname ? oldMember.nickname : "None")
            embed.addField('After', member.nickname ? member.nickname : "None")
        }

        if (changes.includes("_roles")) {
            embed.setDescription(`**${member} roles updated**`)
            let roles = ''
            for (let i = 0; i < member._roles.length; i++) {
                let r = await member.guild.roles.fetch(member._roles[i])
                roles = roles.concat(`${r} \n`)
            }
            embed.addField('Roles', roles.length !== "" ? roles : "None")
        }
        
        let log;
        await member.guild.fetchAuditLogs({ limit: 1 }).then(logs => {
            if (!logs) return;
            log = logs.entries.first();
            if (!log) return;
        }).catch(() => { })
        let user = log.executor;
        let amember = member.guild.members.get(user.id);

        embed.addField(`IDs`, util.codeBlock('ini', `User = ${member.user.id}`))

        if (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime() < 3000) {
            let change = ""
            if (changes.includes("nickname")){ change = "nickname " }
            else if (changes.includes("_roles")){ change = "roles " }
            embed.setDescription(`**${member} ${change}updated by ${amember}**`)
            // embed.setAuthor(`${user.tag} ${amember && amember.nick ? `(${amember.nick})` : ''}`, await user.getAvatar())
            // embed.setThumbnail(await user.getAvatar())
            await logsChannel.send(embed)
        } else {
            await logsChannel.send(embed)
        }
    }
}

function diff(obj1, obj2) {
    const result = {};
    if (Object.is(obj1, obj2)) {
        return undefined;
    }
    if (!obj2 || typeof obj2 !== 'object') {
        return obj2;
    }
    Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
        if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
            result[key] = obj2[key];
        }
        if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
            const value = diff(obj1[key], obj2[key]);
            if (value !== undefined) {
                result[key] = value;
            }
        }
    });
    return result;
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    a.sort()
    b.sort()

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}