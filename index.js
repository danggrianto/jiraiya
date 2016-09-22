var Bot = require('slackbots');

// create a bot
var settings = {
    token: process.env.SLACK_BOT_TOKEN,
    name: 'jiraiya'
};
var bot = new Bot(settings);

bot.on('start', function() {
    bot.postMessageToUser('danggrianto', 'hello bro!');
});
