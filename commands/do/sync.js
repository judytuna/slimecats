const slimecatsDo = require('../../slimecats-do');

// const { makeNewTodo } = require(slimecatsDo);

module.exports = {
  name: 'sync',
  description: 'Syncs with the Earthstar pub.',
  args: false,
  execute(message) {
    slimecatsDo.syncOnce();
    message.channel.send('Syncing!');
  },
};