module.exports = {
  name: 'feed',
  description: 'Feed your slimecat.',
  execute(message) {
    message.channel.send('Your slimecat munches on the treat happily.');
  },
};