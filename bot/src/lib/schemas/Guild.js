const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultGuildSchema
   .add('disabledGroups', 'Command-Group', { array: true })
   .add('channels', folder => folder
      .add('logs', 'string')
      .add('welcome', 'string')
      .add('modlog', 'string')
      .add('ticketlog', 'string')
   )
   .add('messages', folder => folder
      .add('tickets', 'string')
   )
   .add('roles', folder => folder
      .add('autorole', 'string', { array: true })
      .add('mod', 'string', { array: true })
      .add('dj', 'string')
      .add('muted', 'string')
      .add('support', 'string')
   )
   .add('data', folder => folder
      .add('modlogs', 'any', { array: true, configurable: false })
      .add('tickets', 'any', { array: true, configurable: false })
   )
   .add('colors', folder => folder
      .add('welcomecard', 'hex', { default: '#7B2BC0' })
   )
   .add('levels', folder => folder
      .add('ignores', 'any', { array: true })
      .add('rewards', 'any', { array: true })
      .add('multiplier', 'number', { default: 1.0 })
      .add('rankup', folder => folder
         .add('enabled', 'boolean', { default: true })
         .add('type', 'string', { default: 'message' })
         .add('text', 'string', { default: ':partying_face: Congratulations %member, you are now level %level!' })
      )
   )
   .add('toggles', folder => folder
      .add('logs', folder => folder
         .add('invites', 'boolean', { default: true })
         .add('channels', 'boolean', { default: true })
         .add('messages', 'boolean', { default: true })
         .add('members', 'boolean', { default: true })
         .add('roles', 'boolean', { default: true })
         .add('guild', 'boolean', { default: true })
      )
   )
