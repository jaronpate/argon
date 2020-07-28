exports.owners = ['426147523305144322', '159126685759832065']
exports.invite = 'https://discord.gg/7JceW7S'
exports.db = process.env.botDatabase
exports.prefix = '$'

exports.tokens = {
   bot: process.env.botToken
}

exports.emojis = {
   success: '<:success:695674669449216090>',
   error: '<:error:695675079899742259>',
   loading: '<a:loading:695675909943984219>',
   rankUp: '<:up:695688887779196990>',
   folder: '<:folder:719235353562710077>',
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
   }
}
