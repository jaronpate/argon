const { Command, version: klasaVersion, Duration } = require('klasa');
const { version: discordVersion } = require('discord.js');

module.exports = class extends Command {

   constructor(...args) {
      super(...args, {
         guarded: true,
         permissionLevel: 10,
         hidden: true,
         description: language => language.get('COMMAND_STATS_DESCRIPTION')
      });
   }

   async run(message) {
      let [users, guilds, channels, memory] = [0, 0, 0, 0];

      if (this.client.shard) {
         const results = await this.client.shard.broadcastEval(`[this.users.size, this.guilds.size, this.channels.size, (process.memoryUsage().heapUsed / 1024 / 1024)]`);
         for (const result of results) {
            users += result[0];
            guilds += result[1];
            channels += result[2];
            memory += result[3];
         }
      }

      return message.sendCode('asciidoc', message.language.get('COMMAND_STATS',
         (memory || process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
         Duration.toNow(Date.now() - (process.uptime() * 1000)),
         (users || this.client.users.size).toLocaleString(),
         (guilds || this.client.guilds.size).toLocaleString(),
         (channels || this.client.channels.size).toLocaleString(),
         klasaVersion, discordVersion, process.version, message
      ));
   }

};