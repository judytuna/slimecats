const fs = require('fs');

module.exports = {
  name: 'voice-meow',
  description: 'Listen to your slimecat meow in your voice channel.',
  args: false,
  async execute(message) {
    // Join the same voice channel of the author of the message
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();

      // Create a dispatcher
      const dispatcher = connection.play(fs.createReadStream('media/meow.mp3'));

      dispatcher.on('start', () => {
        console.log('meow.mp3 is now playing!');
      });

      dispatcher.on('finish', () => {
        console.log('meow.mp3 has finished playing!');
      });

      // Always remember to handle errors appropriately!
      dispatcher.on('error', console.error);

    } else {
      message.channel.send('You\'re not in a voice channel I can join, though!');
    }
  },
};
