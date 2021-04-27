const slimecatsDo = require('../../slimecats-do');
const Discord = require('discord.js');

// const { makeNewTodo } = require(slimecatsDo);

module.exports = {
  name: 'list',
  description: 'Lists all todos for your slimecat.',
  args: false,
  execute(message, args) {
    const displayIds = args[0] === 'all' ? slimecatsDo.listTodoIds() : slimecatsDo.listUndoneIds();
    const responseMsg = new Discord.MessageEmbed().setTitle('Your slimecat has lots to do.');
    let num = 1;
    let msgBody = '';
    displayIds.forEach(i => {
      const todo = slimecatsDo.lookupTodo(i);
      msgBody += `${todo.isDone ? '~~' : ''}${num}: ${todo.text}${todo.isDone ? '~~' : ''}\n`;
      num++;
    });
    responseMsg.setDescription(msgBody);
    message.channel.send(responseMsg);
  },
};