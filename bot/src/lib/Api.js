const d3 = require('d3-format');
const express = require("express");
const bodyParser = require("body-parser");
const util = require('util')
const app = express();

/**
 * API Reply
 * @param  {any} data Data to reply with
 * @param  {any} res Express response instance
 * @param  {String} error Error string if present
 * @param  {Number} code Status code
 */
const reply = (data, res, error = undefined, status = 200) => {
   let object = new Object();
   if (error && error !== null) {
      object["error"] = error;
   } else if (!error || error === null) {
      object["data"] = data;
   }
   return res.status(status).json(object);
}

class Api {
   constructor(client) {
      const apikey = "NTgzMDYyNjkyNTk2NTQ3NTg1OjE1OTEyNjY4NTc1OTgzMjA2NQ"

      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      function auth(req, res, next) {
         if (!req.headers.authorization) {
            return reply(null, res, "API token missing.", 401)
         } else if (req.headers.authorization !== `${apikey}`) {
            return reply(null, res, "API token missing.", 401)
         } else if (req.headers.authorization === `${apikey}`) {
            next();
         }
      }

      app.get("/", (req, res) => {
         let data = {}
         if (client.user) {
            data = {
               status: 'online',
               ready: client.ready,
               user: {
                  username: client.user.username,
                  tag: client.user.tag,
                  id: client.user.id
               },
               uptime: client.uptime,
               readyTimestamp: client.readyTimestamp,
               invite: client.invite,
               shardCount: client.shard.count
            }
         } else {
            data = {
               status: 'offline'
            }
         }
         res.status(200).json(data);
      });

      app.get("/users/:id", auth, (req, res) => {
         let user = client.users.get(req.params.id);
         if (user === undefined) {
            return reply(null, res, "No user found.", 404)
         }
         reply(user, res)
      });

      app.get("/users/fetch/:id", auth, async (req, res) => {
         let user = await client.users.fetch(req.params.id).catch((err) => {
            return reply(null, res, "No user found.", 404)
         })
         if (user.id) {
            return reply(user, res)
         };
      });

      app.get("/guilds/:id", auth, async (req, res) => {
         let guild = await client.guilds.get(req.params.id);
         if (guild === undefined) { return reply(null, res, "No guild found.", 404); }
         reply(guild, res);
      });

      app.get("/guilds/:id/roles", auth, (req, res) => {
         let roles;
         let guild = client.guilds.get(req.params.id);
         if (guild) { roles = guild.roles.array().filter(r => r.rawPosition < guild.me.roles.highest.rawPosition) }
         else { return reply(null, res, "No guild found.", 404); }
         reply(roles, res);
      });

      app.get("/guilds/:id/channels", auth, (req, res) => {
         let guild = client.guilds.get(req.params.id);
         let channels = guild.channels.array()
         if (guild === undefined) {
            return reply(null, res, "No guild found.", 404);
         }
         // res.status(200).json(channels);
         reply(channels, res);
      });

      app.get("/guilds/:id/leaderboard", async (req, res) => {
         // Check for guild
         let guild = await client.guilds.get(req.params.id);
         if (guild === undefined) {
            return reply(null, res, "No guild found.", 404);
         }

         // Get leaderboard data
         const data = await client.levels.getGuildLeaderboard(guild);
         const filteredData = data.filter(member => member.exp !== 0);
         if (filteredData.length === 0) return res.status(200).json({ error: "No leaderboard data for this guild" });
         filteredData.forEach(async d => {
            const d3 = require('d3-format');
            const format = (number) => number > 999 ? d3.format('.3s')(number) : number;
            let u = client.users.get(d.member);
            d.tag = u.tag;
            d.username = u.username;
            d.avatar = u.displayAvatarURL({ size: 2048, dynamic: true }).replace('.webp', '.png');
            d.level = client.levels.getLevelFromExp(d.exp);
            let levelExp = client.levels.getLevelExp(d.level)
            d.progress = parseInt((client.levels.getLevelProgress(levelExp) / levelExp) * 100);
            d.currentExp = format(client.levels.getLevelProgress(d.exp));
            d.totalExp = format(levelExp);
            d.id = d.member;
            delete d.member;
            delete d.exp;
         });
         reply(filteredData, res);
      });

      app.get("/guilds/:id/tickets", auth, async (req, res) => {
         // Check for guild
         let guild = await client.guilds.get(req.params.id);
         if (guild === undefined) { return reply(null, res, "No guild found.", 404); }

         let data = await guild.settings.get('data.tickets');
         console.log(data)
         reply(data, res);
      });

      app.get("/users/:id/leaderboard", auth, async (req, res) => {
         let array = [];
         const format = (number) => number > 999 ? d3.format('.3s')(number) : number;
         for (const guild of client.guilds.values()) {
            for (const member of guild.members.values()) {
               if (member.id !== req.params.id) continue;
               let exp = await member.settings.get('exp')
               if (exp !== 0) {
                  const data = await client.levels.getGuildLeaderboard(guild);
                  // const filteredData = data.filter(member => member.exp !== 0 && member.id === `${req.params.id}:${guild.id}`);
                  let level = client.levels.getLevelFromExp(exp);
                  let levelExp = client.levels.getLevelExp(level);
                  const d = {
                     user: {
                        id: member.id,
                        username: member.user.username,
                        tag: member.user.tag
                     },
                     values: {
                        level: level,
                        progress: parseInt((client.levels.getLevelProgress(levelExp) / levelExp) * 100),
                        currentExp: format(client.levels.getLevelProgress(exp)),
                        totalExp: format(levelExp)
                     },
                     guild: {
                        id: guild.id,
                        name: guild.name,
                        icon: guild.iconURL({ size: 2048, dynamic: true })
                     }
                  }
                  array.push(d);
               }
            }
         }
         return reply(array, res);
      });

      app.get('/commands', auth, async (req, res) => {
         const commands = new Map();
         await Promise.all(client.commands.map((command) => {
            if (command.hidden || command.permissionLevel >= 9) return;
            const category = commands.get(command.category);
            if (category) category.push(command);
            else commands.set(command.category, [command]);
         }));
         reply(Object.fromEntries(commands), res);
      });

      app.post("/run", auth, (req, res) => {
         const ev = util.promisify(eval)
         ev(req.body.command)
            .then(result => {
               reply(result, res);
            })
            .catch(err => {
               reply(null, res, err, 500)
            })
      });

      app.post("/users/:id/settings", auth, async (req, res) => {
         let user = await client.users.fetch(req.params.id);
         if (user === undefined) {
            return reply(null, res, "No user found.", 404);
         }
         let settings = req.body.settings;
         await user.settings.update(settings)
            .then(async result => {
               await user.settings.sync();
               return reply(result, res);
            })
            .catch(err => {
               return reply(null, res, err, 500);
            });
      });

      app.post("/guilds/:id/settings", auth, async (req, res) => {
         let guild = client.guilds.get(req.params.id);
         if (guild === undefined) {
            return reply(null, res, "No guild found.", 404);
         }
         let settings = req.body.settings;
         await guild.settings.update(settings, { force: true, arrayAction: (settings.roles || settings.disabledCommands) ? 'overwrite' : 'auto' })
            .then(async result => {
               await guild.settings.sync();
               return reply(result, res);
            })
            .catch(err => {
               return reply(null, res, err, 500)
            });
      });
      
      this.launch = function(){
         app.listen(process.env.PORT || 3000, function () {
            console.log(`\x1b[44m[Client Manager]\x1b[0m`, `API launched.`)
         })
      }
   }
}

module.exports = Api;