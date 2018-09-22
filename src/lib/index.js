/* eslint-disable */
/**
 * Created by chrisjshull
 * @link https://github.com/chrisjshull/homebridge-nest
 */
const NestConnection = require('./nest-connection.js');
const Promise = require('bluebird');

const setupConnection = function(config, log) {
  return new Promise(function (resolve, reject) {
    const token = config.token;
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const code = config.code;
    const authURL = clientId ? "https://home.nest.com/login/oauth2?client_id=" + clientId + "&state=STATE" : null;

    let err;
    if (!token && !clientId && !clientSecret && !code) {
      err = "You did not specify {'token'} or {'clientId','clientSecret','code'}, one set of which is required for the new API";
    } else if (!token && clientId && clientSecret && !code) {
      err = "You are missing the one-time-use 'code' param. Should be able to obtain from " + authURL;
    } else if (!token && (!clientId || !clientSecret || !code)) {
      err = "If you are going to use {'clientId','clientSecret','code'} then you must specify all three, otherwise use {'token'}";
    }
    if (err) {
      reject(new Error(err));
      return;
    }

    const conn = new NestConnection(token, log);
    if (token) {
      resolve(conn);
    } else {
      conn.auth(clientId, clientSecret, code)
        .then(function(newToken) {
          if (log) log.warn("CODE IS ONLY VALID ONCE! Update config to use {'token':'" + newToken + "'} instead.");
          resolve(conn);
        })
        .catch(function(authError){
          reject(authError);
          if (log) log.warn("Auth failed which likely means the code is no longer valid. Should be able to generate a new one at " + authURL);
        });
    }
  });
};

module.exports = {
  setupConnection,
};
