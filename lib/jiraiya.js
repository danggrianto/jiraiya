(function() {
    'use strict';
    var util = require('util');
    var path = require('path');
    var fs = require('fs');
    var SQLite = require('sqlite3').verbose();
    var Bot = require('slackbots');

    var Jiraiya = function Constructor(settings) {
        this.settings = settings;
        this.settings.name = this.settings.name || 'jiraiya';
        this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'jiraiya.db');

        this.user = null;
        this.db = null;
    };

    // inherits methods and properties from the Bot constructor
    util.inherits(Jiraiya, Bot);

    /*
    running the bot
    */
    Jiraiya.prototype.run = function() {
        Jiraiya.super_.call(this, this.settings);

        this.on('start', this._onStart);
        this.on('message', this._onMessage);
    };

    /*
    starting function
    */
    Jiraiya.prototype._onStart = function() {
        this._loadBotUser();
        this._connectDb();
        this._firstRunCheck();
    };

    /*
    loading user
    */
    Jiraiya.prototype._loadBotUser = function() {
        var self = this;
        this.user = this.users.filter(function(user) {
            return user.name.toUpperCase() === self.settings.name.toUpperCase();
        })[0];
    };

    /*
    loading the databaes
    */
    Jiraiya.prototype._connectDb = function() {
        if (!fs.existsSync(this.dbPath)) {
            console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
            process.exit(1);
        }

        this.db = new SQLite.Database(this.dbPath);
    };

    /*
    Check if this is the first run
    */
    Jiraiya.prototype._firstRunCheck = function() {
        var self = this;
        self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function(err, record) {
            if (err) {
                return console.error('DATABASE ERROR:', err);
            }

            var currentTime = (new Date()).toJSON();

            // this is a first run
            if (!record) {
                self._welcomeMessage();
                return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
            }

            // updates with new last running time
            self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
        });
    };

    /*
    Welcome message
    */
    Jiraiya.prototype._welcomeMessage = function() {
        this.postMessageToChannel(this.channels[0].name, 'Hello world!' +
            '\n Call my name `' + this.name + '` to invoke me!', {
                as_user: true
            });
    };

    /*
    Intercepting message
    */
    Jiraiya.prototype._onMessage = function(message) {
        if (this._isChatMessage(message) &&
            this._isChannelConversation(message) &&
            !this._isFromJiraiya(message)
        ) {
            if (this._isJiraTicket(message)) {
                this._replyMessage(message, "this is a jira ticket");
            } else if (this._isMentioningJiraiya(message)) {
                var help = this._isAskingHelp(message);
                var reply = help || "what's up? you can ask me anything.\nFor list of command you can type `jiraiya help me!`";
                this._replyMessage(message, reply);
            }
        }
    };

    /*
    user asking help
    */
    Jiraiya.prototype._isAskingHelp = function(message) {
        if (message.text.toLowerCase().indexOf('help') > -1) {
            return "so you need help?";
        } else {
            return null;
        }
    };

    /*
    Check if jira ticket is mentioned
    */
    Jiraiya.prototype._isJiraTicket = function(message) {
        var jira_matcher = /[A-z]+[-](\d)+/g;
        return jira_matcher.test(message.text);
    };

    Jiraiya.prototype._isChatMessage = function(message) {
        return message.type === 'message' && Boolean(message.text);
    };

    Jiraiya.prototype._isChannelConversation = function(message) {
        return typeof message.channel === 'string' &&
            message.channel[0] === 'C';
    };

    Jiraiya.prototype._isFromJiraiya = function(message) {
        return message.user === this.user.id;
    };

    Jiraiya.prototype._isMentioningJiraiya = function(message) {
        return message.text.toLowerCase().indexOf('jiraiya') > -1 ||
            message.text.toUpperCase().indexOf('<@' + this.user.id + '>') > -1;
    };

    Jiraiya.prototype._replyMessage = function(originalMessage, newMessage) {
        var self = this;
        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, newMessage, {
            as_user: true
        });

    };

    Jiraiya.prototype._getChannelById = function(channelId) {
        return this.channels.filter(function(item) {
            return item.id === channelId;
        })[0];
    };

    module.exports = Jiraiya;
}());
