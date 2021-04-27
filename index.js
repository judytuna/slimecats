const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const slimecatsDo = require('./slimecats-do');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

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

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }

});

setInterval(() => {
  slimecatsDo.syncOnce();
  console.log('Synced!'); // later: detect if something has changed and send a lil message
}, 60 * 1000);

client.login(process.env.DISCORD_TOKEN);
