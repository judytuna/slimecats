const slimecatsDo = require('../../slimecats-do');

// const { makeNewTodo } = require(slimecatsDo);

module.exports = {
  name: 'add',
  description: 'Add a todo for your slimecat.',
  args: true,
  execute(message, args) {
    message.channel.send('Your slimecat is thrilled to have things to do.');
    if(args) {
      const newTodo = slimecatsDo.makeNewTodo(args.join(' '));
      slimecatsDo.saveTodo(newTodo);
      slimecatsDo.syncOnce();
      const foundTodo = slimecatsDo.lookupTodo(newTodo.id);
      message.channel.send(`id: ${foundTodo.id}\ntext: ${foundTodo.text}\nisDone: ${foundTodo.isDone}`);
      slimecatsDo.closeStorage();
    } else {
      message.channel.send('Unable to add that todo.');
    }
  },
};