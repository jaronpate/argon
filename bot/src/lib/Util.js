module.exports = class Util {
   static randomInt(low, high) {
      return Math.floor(Math.random() * (high - low + 1) + low);
   }

   static paginate(items, page = 1, pageLength = 10) {
      const maxPage = Math.ceil(items.length / pageLength);
      if (page < 1) page = 1;
      if (page > maxPage) page = maxPage;
      const startIndex = (page - 1) * pageLength;
      return {
         items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
         page,
         maxPage,
         pageLength
      };
   }

   static timeCalc(seconds) {
      var h = Math.floor(seconds % (3600 * 24) / 3600);
      var m = Math.floor(seconds % 3600 / 60);
      var s = Math.floor(seconds % 60);

      var hDisplay = h > 0 ? (h >= 10 ? "" : h >= 10 ? "" : "0") + h + (h == 1 ? ":" : ":") : "";
      var mDisplay = m > 0 ? (hDisplay ? m >= 10 ? "" : "0" : m >= 10 ? "" : "0") + m + (m == 1 ? ":" : ":") : "00:";
      var sDisplay = s > 0 ? (mDisplay ? s >= 10 ? "" : "0" : s >= 10 ? "00:" : "00:0") + s : "00";
      return hDisplay + mDisplay + sDisplay;
   }

   static permissions = {
      ADMINISTRATOR: 'Administrator',
      VIEW_AUDIT_LOG: 'View audit log',
      MANAGE_GUILD: 'Manage server',
      MANAGE_ROLES: 'Manage roles',
      MANAGE_CHANNELS: 'Manage channels',
      KICK_MEMBERS: 'Kick members',
      BAN_MEMBERS: 'Ban members',
      CREATE_INSTANT_INVITE: 'Create invites',
      CHANGE_NICKNAME: 'Change nickname',
      MANAGE_NICKNAMES: 'Manage nicknames',
      MANAGE_EMOJIS: 'Manage emojis',
      MANAGE_WEBHOOKS: 'Manage webhooks',
      VIEW_CHANNEL: 'Read messages',
      SEND_MESSAGES: 'Send messages',
      SEND_TTS_MESSAGES: 'Send TTS messages',
      MANAGE_MESSAGES: 'Manage messages',
      EMBED_LINKS: 'Embed links',
      ATTACH_FILES: 'Attach files',
      READ_MESSAGE_HISTORY: 'Read message history',
      MENTION_EVERYONE: 'Mention everyone',
      USE_EXTERNAL_EMOJIS: 'Use external emojis',
      ADD_REACTIONS: 'Add reactions',
      CONNECT: 'Connect',
      SPEAK: 'Speak',
      MUTE_MEMBERS: 'Mute members',
      DEAFEN_MEMBERS: 'Deafen members',
      MOVE_MEMBERS: 'Move members',
      USE_VAD: 'Use voice activity'
   }
}
