const { Argument } = require('klasa');

module.exports = class extends Argument {
   async run(arg, possible, msg) {
      if (!arg) throw msg.language.get('COMMANDMESSAGE_MISSING_REQUIRED', possible.name)
      const matches = this.getMatches(arg)
      if (!matches) throw msg.language.get('RESOLVER_INVALID_HEX')
      return matches
   }

   getMatches(input) {
      return new RegExp(/^#(?:[0-9a-f]{3}){1,2}$/i).exec(input)
   }
}
