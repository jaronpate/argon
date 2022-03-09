require('dotenv').config();
const { ShardingManager } = require('discord.js');
const { tokens, options } = require('./config');
const Api = require('./lib/Api')

const manager = new ShardingManager('./Argon.js', {
   token: tokens.bot
});

manager.on('shardCreate', shard => {
   console.log(`\x1b[44m[Client Manager]\x1b[0m`, `Shard ${shard.id} launched.`)
});

manager.spawn().then((shards) => {
   shards.first().eval('this.webapi.launch()')
}).catch(console.error);
