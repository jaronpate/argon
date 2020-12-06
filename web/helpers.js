const axios = require('axios'),
dotenv = require("dotenv");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config();

const clientID = process.env.client_id;
const redirectUri = process.env.redirectUri;
const guildRedirectUri = process.env.guildRedirectUri;
const apiURL = process.env.apiURL;
const apiKey = process.env.apiKey;
const apiUser = process.env.apiUser;

exports.fetch = async function (parameters) {
   return new Promise(async (fulfill, reject) => {
       try {
           var options = {
               headers: {
                   'authorization': apiKey
               }
           };

           axios.get(`${apiURL}/${parameters.type}${parameters.id ? `/${parameters.id}` : ""}${(parameters.action) ? `/${parameters.action}` : ""}`, options).then((result) => {
               fulfill(result.data.data);
           }).catch((result) => fulfill(result.data))
       }
       catch (err) { reject(err) }
   })
}

exports.update = async function (parameters, settings) {
   return new Promise(async (fulfill, reject) => {
       try {
           axios({
               method: 'post',
               url: `${apiURL}/${parameters.type}/${parameters.id}/settings`,
               headers: {
                   'authorization': apiKey,
                   "Content-Type": "application/json"
               },
               data: JSON.stringify(settings)
           }).then(fulfill).catch(reject);
       }
       catch (err) {
           reject(err)
       }
   })
}