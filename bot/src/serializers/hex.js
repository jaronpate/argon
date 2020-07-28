const { Serializer } = require('klasa');

module.exports = class extends Serializer {

   constructor(...args) {
      super(...args);
   }

   async deserialize(data, piece, language, guild) {
      if (new RegExp(/^#(?:[0-9a-f]{3}){1,2}$/i).exec(input)) {
         return data;
      } else {
         throw language.get('SERIALIZER_HEX_INVALID')
      }
   }
}