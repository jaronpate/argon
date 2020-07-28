const { Event } = require('klasa');

module.exports = class extends Event {
   run(msg, command, params, error) {
      if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
      if (error.message) msg.sendMessage([
         `\`Error: ${error.message}\``,
         `This is an error and shouldn't happen. Please report this.`,
         `Support Server: ${this.client.config.invite}`
      ]).catch(err => this.client.emit('wtf', err));
      else msg.sendMessage(error).catch(err => this.client.emit('wtf', err));
   }
};