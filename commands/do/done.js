const slimecatsDo = require('../../slimecats-do');

// const { makeNewTodo } = require(slimecatsDo);

module.exports = {
  name: 'done',
  description: 'Mark something done.',
  args: true,
  alias: ['markdone'],
  execute(message, args) {
    message.channel.send('Your slimecat is very productive.');
    try {
      const index = args[0] || 1;
      const allIds = slimecatsDo.listTodoIds();
      const todoId = allIds[index];
      const todo = slimecatsDo.lookupTodo(todoId);
      todo.isDone = true;
      slimecatsDo.saveTodo(todo);
      slimecatsDo.syncOnce();
      const foundTodo = slimecatsDo.lookupTodo(todoId);
      message.channel.send(`id: ${foundTodo.id}\ntext: ${foundTodo.text}\nisDone: ${foundTodo.isDone}`);
    } catch {
      message.channel.send('Unable to modify that todo.');
    }
  },
};