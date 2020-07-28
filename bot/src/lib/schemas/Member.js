const { KlasaClient } = require('klasa');
const MGateway = require('klasa-member-gateway');

KlasaClient.use(MGateway);

module.exports = KlasaClient.defaultMemberSchema
   .add('exp', 'integer', { default: 0 })