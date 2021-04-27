const slimecatsDo = require('../../slimecats-do');
const Discord = require('discord.js');

module.exports = {
  name: 'boxes',
  description: 'How many cardboard boxes does your slimecat currently have?',
  args: false,
  alias: ['box'],
  execute(message) {
    const numBoxes = slimecatsDo.listDoneIds().length;
    const responseMsg = new Discord.MessageEmbed().setTitle(`Your slimecat has ${numBoxes} cardboard box${numBoxes === 1 ? '' : 'es'}.`);
    const boxContents = slimecatsDo.boxes();
    console.log(boxContents);
    let msgDescription = '';
    if(boxContents !== {}) {
      for(const thing in boxContents) {
        console.log(thing);
        console.log(boxContents[thing]);
        msgDescription += `${thing}: ${boxContents[thing]}\n`;
      }
    }
    responseMsg.setDescription(msgDescription);
    message.channel.send(responseMsg);
  },
};