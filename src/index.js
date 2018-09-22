require('dotenv').config();
const logger = require('homeautomation-winston-logger');

const { setupConnection } = require('./lib/index');

const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  token: process.env.TOKEN,
};

const log = logger('data.log', false);
let connection;
let eventsLogged = 0;

const handleUpdates = (data) => {
  log.info(data && data.devices && data.devices.thermostats);
  eventsLogged += 1;
};

setInterval(
  () => {
    console.log(`${new Date()}: Still running - Events logged since last update: ${eventsLogged}`);
    eventsLogged = 0;
  },
  30 * 60 * 1000,
);
console.log(`${new Date()}: Starting`);

setupConnection(config, console)
  .then((conn) => {
    connection = conn;
    return connection.open();
  })
  .then(() => connection.subscribe(handleUpdates))
  .then(data => handleUpdates(data))
  .catch((err) => {
    console.error(err);
    log.error(err);
  });
