const ArgonClient = require('./lib/Client');
const { tokens, options } = require('./config');

const client = new ArgonClient(options)

client.login(tokens.bot);