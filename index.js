const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');

const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  if (message.content === `${config.prefix} meow`) {
    message.channel.send('Slimecat meows back.');
  }

  if (message.content === `${config.prefix} info`) {
    message.channel.send(`I'm a game Arala made for Ludum Dare 48! Try \`${config.prefix} meow\` and see what I do.`);
  }

  if (message.content === `${config.prefix} voice meow`) {
    // Join the same voice channel of the author of the message
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      // Create a dispatcher
      const dispatcher = connection.play('media/meow.mp3');

      dispatcher.on('start', () => {
        console.log('meow.mp3 is now playing!');
      });

      dispatcher.on('finish', () => {
        console.log('meow.mp3 has finished playing!');
      });

      // Always remember to handle errors appropriately!
      dispatcher.on('error', console.error);
    }
    else {
      message.channel.send('You\'re not in a voice channel I can join, though!');
    }
  }

});

client.login(process.env.DISCORD_TOKEN);
