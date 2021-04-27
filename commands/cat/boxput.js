const slimecatsDo = require('../../slimecats-do');
const Discord = require('discord.js');

module.exports = {
  name: 'boxput',
  description: 'Put a thing in one of your slimecat\'s cardboard boxes.',
  args: true,
  alias: ['put'],
  execute(message, args) {
    const numDone = slimecatsDo.listDoneIds().length;
    const currentBoxes = slimecatsDo.boxes();
    let count = 0;
    for (const thing in currentBoxes) {
      count += currentBoxes[thing];
    }
    if(count < numDone) {
      message.channel.send(`Putting one ${args[0]} in a box.`);
      slimecatsDo.addThingToBoxes(args[0]);
      slimecatsDo.syncOnce();
    } else {
      message.channel.send(`You have already filled ${count} of your ${numDone} available box${numDone === 1 ? '' : 'es'}! Do some more todos to get more!`);
    }
    const responseMsg = new Discord.MessageEmbed().setTitle(`Your slimecat has ${numDone} cardboard box${numDone === 1 ? '' : 'es'}.`);
    responseMsg.setDescription(`${JSON.stringify(slimecatsDo.boxes())}`);
    message.channel.send(responseMsg);
  },
};