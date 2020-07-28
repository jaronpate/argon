const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
   constructor(...args) {
      super(...args, {
         name: 'clear',
         description: 'Clears messages in the channel the command is ran.',
         requiredPermissions: ['MANAGE_MESSAGES'],
         permissionLevel: 2,
         runIn: ['text'],
         usage: '<amount:integer{1,1000}>'
      });
   }

   async run(msg, [amount]) {
      await msg.delete()
      const array = await getMessages(msg, amount)
      if (msg.flagArgs.nopins) {
         await array.filter(m => m.pinned === false)
      }
      const chunkedArray = chunkArray(array, 100)
      var msgs = 0;
      for (let i = 0; chunkedArray.length > i; i++) {
         await msg.channel.bulkDelete(chunkedArray[i], true).then(messages => {
            msgs = msgs + messages.size
         }).catch(err => { })
      }
      if (msg.guild.settings.get('channels.serverlog')) {

      }
      if (msgs !== 0) {
         msg.sendMessage(`${this.client.config.emojis.success} Cleared ${msgs} message${msgs > 1 ? 's' : ''}.`).then(message => {
            message.delete({ timeout: 5000 });
         })
      }
      throw msg.sendMessage(`${this.client.config.emojis.error} There are no messages that aren't older than 2 weeks i can delete.`)
   }
};

function chunkArray(myArray, chunk_size) {
   var index = 0;
   var arrayLength = myArray.length;
   var tempArray = [];
   for (index = 0; index < arrayLength; index += chunk_size) {
      myChunk = myArray.slice(index, index + chunk_size);
      tempArray.push(myChunk);
   }
   return tempArray;
}

async function getMessages(msg, limit = 100, channel = msg.channel) {
   let out = []
   if (limit <= 100) {
      let messages = await channel.messages.fetch({ limit: limit })
      out.push(...messages.array())
   } else {
      let rounds = (limit / 100) + (limit % 100 ? 1 : 0)
      let last_id = ""
      for (let x = 0; x < rounds; x++) {
         if (last_id.length > 0) options.before = last_id
         const messages = await channel.messages.fetch({ limit: 100 })
         out.push(...messages.array())
         if (messages.size === 0) x = rounds;
         else last_id = messages.array().pop().id;
      }
   }
   return out
}