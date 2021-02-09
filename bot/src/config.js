exports.owners = ['159126685759832065']
exports.invite = 'https://discord.gg/uAYhzvb'
exports.db = process.env.botDatabase
exports.prefix = '$'

exports.tokens = {
   bot: process.env.botToken
}

exports.emojis = {
   success: '<:check:807923304979103754>',
   error: '<:xmark:807923304845148170>',
   loading: '<a:loading:807923304891285524>',
   rankUp: '<:rankup:807923899119566849>',
   folder: '📁',
   ticketOpen: '📩',
   ticketLock: '🔒',
   ticketUnlock: '🔓',
   ticketResolve: '✅'
}

exports.colors = {
   default: '#7B2BC0',
   success: '#2ECC71',
   error: '#FF5042',
   green: '#23d160',
   yellow: '#fada5e',
   red: '#ff470f',
   blue: '#117ea6',
}

exports.options = {
   prefix: this.prefix,
   commandEditing: true,
   createPiecesFolders: false,
   owners: this.owners,
   partials: ['MESSAGE', 'REACTION'],
   disabledEvents: ['TYPING_START', 'PRESENCE_UPDATE'],
   disabledCorePieces: ['commands', 'providers', 'languages'],
   providers: { default: "mongodb" },
   pieceDefaults: {
      commands: { runIn: ['text'], deletable: false, quotedStringSupport: true, cooldown: 3.5 },
   },
   presence: {
      activity: {
         name: 'argon.wtf',
         type: 'STREAMING',
         url: 'https://www.twitch.tv/bobross'
      }
   }
}
