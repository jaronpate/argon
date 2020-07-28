const { Serializer } = require('klasa');

module.exports = class extends Serializer {

   constructor(...args) {
      super(...args);
   }

   async deserialize(data, piece, language, guild) {
      const set = new Set();
      for (const command of this.client.commands.values()) for (let i = 0, m = command.file.length - 1; i < m; ++i) set.add(command.file[i]);
      if (set.has(data)) return data;
      throw `That's not a valid command group.`;
   }
};