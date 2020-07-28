const { fetch, update } = require('../helpers')
DiscordOauth2 = require("discord-oauth2"),
    oauth = new DiscordOauth2()

// ================
// Dashboard Routes
// ================

// loggedIn
exports.index = async (req, res) => {
    let token = req.cookies.get("access_token");
    let guilds = await oauth.getUserGuilds(token);
    let user = await oauth.getUser(token);
    res.render("dashboard/index", { title: "Dashboard", css: "dashboard", guilds: guilds, user: user });
};

// loggedIn, authorized
exports.getGuild = async (req, res) => {
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token);
    let guild_id = req.params.id;
    let guild = await fetch({ type: "guilds", id: guild_id });
    if (!guild) {
        res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${clientID}&response_type=code&scope=bot&permissions=2146958839&guild_id=${guild_id}&redirect_uri=${guildRedirectUri}`)
    } else {
        res.render("dashboard/guild", { title: guild.name, css: "guild", guild: guild, user: user, settings: guild.settings, page: "modules" });
    }
};

// loggedIn, authorized
exports.getLeaderboard = async (req, res) => {
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token);
    let guild_id = req.params.id;
    let guild = await fetch({ type: "guilds", id: guild_id });
    if (!guild) {
        res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${clientID}&response_type=code&scope=bot&permissions=2146958839&guild_id=${guild_id}&redirect_uri=${guildRedirectUri}`);
    } else {
        res.render("dashboard/leaderboard", { title: guild.name, css: "leaderboard", guild: guild, user: user, page: "leaderboard" });
    }
};

// GET
// /dashboard/:id/commands
// loggedIn, authorized
exports.getCommands = async (req, res) => {
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token);
    let guild_id = req.params.id;
    let guild = await fetch({ type: "guilds", id: guild_id });
    let channels = await fetch({ type: "guilds", id: guild_id, action: "channels" });
    let categories = Object.values(await fetch({ type: "commands" }));
    categories.forEach((category) => {
        category.forEach((command) => {
            if (guild.settings.disabledCommands.includes(command.name)) command.enabled = false
        });
    });
    if (guild.error) {
        res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${clientID}&response_type=code&scope=bot&permissions=2146958839&guild_id=${guild_id}&redirect_uri=${guildRedirectUri}`);
    } else {
        res.render("dashboard/commands", { title: guild.name, css: "commands", guild: guild, categories: categories, channels: channels, user: user, page: "commands" });
    }
};

// POST
// /dashboard/:id/commands
// loggedIn, authorized
exports.postCommands = async (req, res) => {
    let guild = await fetch({ type: "guilds", id: req.params.id });
    let categories = Object.values(await fetch({ type: "commands" }));
    let commands = [];
    categories.forEach((category) => {
        category.forEach((command) => {
            if (command.name) commands.push(command.name);
        });
    });
    let disabledCommands = commands.filter(command => !Object.keys(req.body.commands).includes(command));
    await update({ type: "guilds", id: req.params.id }, { settings: { disabledCommands: disabledCommands } }).catch(console.error);
    res.redirect(`/dashboard/${req.params.id}/commands`);
};

// GET
// /dashboard/:id/tickets
// loggedIn, authorized
exports.getTickets = async (req, res) => {
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token);
    let guild = await fetch({ type: "guilds", id: req.params.id });
    let tickets = await fetch({ type: "guilds", id: req.params.id, action: "tickets" });
    res.render("dashboard/tickets", { title: guild.name, css: "tickets", guild: guild, tickets: tickets, user, page: "tickets" });
};

// GET
// /dashboard/:id/tickets/:tid
// loggedIn, authorized
exports.getTicket = async (req, res) => {
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token);
    let guild = await fetch({ type: "guilds", id: req.params.id });
    let tickets = await fetch({ type: "guilds", id: req.params.id, action: "tickets" });
    let ticket = tickets.filter(t => t.id.toString() === req.params.tid)[0];
    if (!ticket) { return next() }
    res.render("dashboard/ticket", { title: guild.name, css: "ticket", guild: guild, ticket: ticket, user, page: "ticket" });
};

// GET
// /dashboard/:id/module
// loggedIn, authorized
exports.getModule = async (req, res) => {
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token);
    let guild_id = req.params.id;
    let guild = await fetch({ type: "guilds", id: guild_id });
    let roles = null;
    let channels = null;
    switch (req.params.module) {
        case "welcome":
            channels = await fetch({ type: "guilds", id: guild_id, action: "channels" });
            roles = await fetch({ type: "guilds", id: guild_id, action: "roles" });
            break;
        case "moderation":
            channels = await fetch({ type: "guilds", id: guild_id, action: "channels" });
            break;
    }

    if (guild.error) {
        res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${clientID}&response_type=code&scope=bot&permissions=2146958839&guild_id=${guild_id}&redirect_uri=${guildRedirectUri}`);
    } else {
        res.render(`dashboard/modules/${req.params.module}`, { title: guild.name, css: req.params.module, guild: guild, roles: roles, channels: (channels) ? channels.filter(c => c.type === "text") : null, user: user, page: "modules", module: req.params.module });
    }
};

// POST
// /dashboard/:id/module
// loggedIn, authorized
exports.postModule = async (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.redirect(`/dashboard/${req.params.id}/${req.params.module}?a=error`)
    }
    if (req.body.settings.ignore) { delete req.body.settings.ignore; }
    if (req.params.module === "welcome" && !req.body.settings.autoRole) {
        req.body.settings.autoRole = [];
    }
    if (req.params.module === "levels") {
        req.body.settings.rankup = (req.body.settings.rankup) ? true : false;
    }
    if (req.params.module === "moderation") {
        req.body.settings.antiinvite = (req.body.settings.antiinvite) ? true : false;
    }

    let settings = {};
    switch (req.params.module) {
        case "general":
            settings = {
                settings: {
                    prefix: req.body.settings.prefix
                }
            }
            break;
        case "levels":
            settings = {
                settings: {
                    toggles: {
                        rankup: req.body.settings.rankup
                    }
                }
            }
            break;
        case "welcome":
            settings = {
                settings: {
                    channels: {
                        welcome: req.body.settings.welcomeChannel
                    },
                    messages: {
                        welcome: req.body.settings.welcomeMsg
                    },
                    roles: {
                        autorole: req.body.settings.autoRole
                    }
                }
            }
            break;
        case "moderation":
            settings = {
                settings: {
                    toggles: {
                        antiinvite: req.body.settings.antiinvite
                    },
                    channels: {
                        report: req.body.settings.reportsChannel
                    }
                }
            }
            break;
    }
    await update({ type: "guilds", id: req.params.id }, settings).catch(console.error);

    // let settings = { settings: JSON.stringify(req.body.settings) }
    // await update({ type: "guilds", id: req.params.id }, settings).catch(console.error);
    res.redirect(`/dashboard/${req.params.id}/${req.params.module}`)
};
