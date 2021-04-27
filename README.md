# slimecats
ludum dare 48
https://ldjam.com/events/ludum-dare/48/slimecats-do
A Discord bot that tracks your todos and rewards you with cardboard boxes to keep toys in. Also a soundboard with exactly 1 sound.
Is it a game? I mean, sort of? lol

## Test it here

https://discord.gg/et8Mm9rT

## Technologies & tutorials used

* Earthstar: https://earthstar-docs.netlify.app/docs/tutorials/making-an-app
** inspect the data in Earthstar: https://earthstar-demo-pub-v5-a.glitch.me/workspace/+slimecatsdo.iu8nhj2anvr74slnjei
* DiscordJS: https://discordjs.guide/creating-your-bot/#creating-the-bot-file

## To deploy on Heroku: 

1. add this buildpack: https://elements.heroku.com/buildpacks/jonathanong/heroku-buildpack-ffmpeg-latest
1. turn off the web dyno
1. turn on the worker dyno
