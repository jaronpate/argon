const { Argument } = require('klasa');
const truths = ['1', 'true', '+', 't', 'yes', 'y', 'on'];
const falses = ['0', 'false', '-', 'f', 'no', 'n', 'off'];

module.exports = class extends Argument {
   run(arg, possible, msg) {
      const boolean = String(arg).toLowerCase();
      if (truths.includes(boolean)) return true;
      if (falses.includes(boolean)) return false;
      throw msg.language.get('RESOLVER_INVALID_BOOL', possible.name);
   }
}
