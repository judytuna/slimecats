const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {
  console.log(message.content);
  if (message.content === 'meow') {
    message.channel.send('Slimecat meows back.');
  }
});

client.login(process.env.DISCORD_TOKEN);
