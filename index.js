const { CHANNEL_ID, TOKEN, TASK_CONFIGS } = require('./config.js');

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const tasks = require('./tasks');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const notificationsChannel = client.channels.resolve(CHANNEL_ID);

  TASK_CONFIGS.forEach(({ taskType, query, interval }) => {
    const runTask = () => tasks[taskType](query).then(messages => messages.forEach(message => notificationsChannel.send(message)));
    runTask();
    setInterval(runTask, interval);
  });
});

client.login(TOKEN);
