const { CHANNEL_ID, TOKEN } = require('./config.js');

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const mercariTask = require('./tasks/mercari');
const yahooAuctionTask = require('./tasks/yahooAuction');

const MINUTE = 60 * 1000;

const taskConfigs = [{
  task: mercariTask,
  query: '<REDACTED>',
  interval: 5 * MINUTE,
}, {
  task: mercariTask,
  query: '<REDACTED_2>',
  interval: 5 * MINUTE,
},{
  task: yahooAuctionTask,
  query: '<REDACTED>',
  interval: 10 * MINUTE,
}, {
  task: yahooAuctionTask,
  query: '<REDACTED_2>',
  interval: 10 * MINUTE,
}];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const notificationsChannel = client.channels.resolve(CHANNEL_ID);

  taskConfigs.forEach(({ task, query, interval }) => {
    const runTask = () => task(query).then(messages => messages.forEach(message => notificationsChannel.send(message)));
    runTask();
    setInterval(runTask, interval);
  });
});

client.login(TOKEN);
