const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {
  if (!message.content.startsWith(`${config.prefix}`)) {
    console.log('NOPE');
    return;
  }

  if (message.content === `${config.prefix} meow`) {
    message.channel.send('Slimecat meows back.');
  }

  if (message.content === `${config.prefix} info`) {
    message.channel.send(`I'm a game Arala made for Ludum Dare 48! Try \`${config.prefix} meow\` and see what I do.`);
  }
});

client.login(process.env.DISCORD_TOKEN);
