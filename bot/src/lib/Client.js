const PermissionLevels = require('./setup/PermissionLevels');
const Extensions = require('./extensions/Extensions');
const Schemas = require('./schemas/Schemas');
const { KlasaClient } = require('klasa');
const Rewards = require('./Rewards');
const ModLog = require('./ModLog');
const Config = require('../config');
const Levels = require('./Levels');
const Util = require('./Util');
const Api = require('./Api');

module.exports = class ArgonClient extends KlasaClient {
   constructor(options) {
      super(options || new KlasaClientOptions);
      this.levels = new Levels(this);
      this.rewards = new Rewards(this);
      this.webapi = new Api(this);
      this.config = Config;
      this.util = Util;
      this.modlog = ModLog;
      // this.permissionLevels = PermissionLevels;
   }
}
