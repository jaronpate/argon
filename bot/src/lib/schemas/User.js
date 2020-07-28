const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultUserSchema
   .add('exp', 'integer', { default: 0 })
   .add('tag', 'string')
   .add('colors', folder => folder
      .add('rankcard', 'string', { default: '#7B2BC0' })
   )
   .add('description', 'string')
   .add('socialMedia', folder => folder
      .add('github', 'string')
      .add('twitter', 'string')
      .add('steam', 'string')
      .add('snapchat', 'string')
      .add('facebook', 'string')
      .add('twitch', 'string')
      .add('soundcloud', 'string')
      .add('instagram', 'string')
      .add('mixer', 'string')
      .add('reddit', 'string')
      .add('youtube', 'string')
      .add('telegram', 'string')
   )
   .add('statistics', folder => folder
      .add('messages', 'integer')
      .add('reputation', folder => folder
         .add('positive', 'integer')
         .add('negative', 'integer')
      )
   )
   .add('statuses', folder => folder
      .add('supporter', 'boolean', { default: false })
   )
   .add('commandLog', 'any', { array: true })