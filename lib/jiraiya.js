(function() {
    'use strict';
    var util = require('util');
    var Bot = require('slackbots');
    var Jira = require('./jira');
    var config = require('config');

    var Jiraiya = function Constructor(settings) {
        this.settings = settings;
        this.settings.name = this.settings.name || 'jiraiya';
        this.user = null;
        this.jira = new Jira();
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
    Intercepting message
    */
    Jiraiya.prototype._onMessage = function(message) {
        if (this._isChatMessage(message) &&
            this._isChannelConversation(message) &&
            !this._isFromJiraiya(message)
        ) {
            if (this._isJiraTicket(message)) {
                this._getJiraIssue(message);
            } else if (this._isMentioningJiraiya(message)) {
                var reply = "";
                if (message.text.toLowerCase().indexOf('help') > -1) {
                    reply = "These are the list of what I can do:\n" +
                        "1. To list all your assigned issues type `jiraiya show me my issues`\n" +
                        "2. Type any jira ticket number and I will send you the detail. Example `AUTO-123`";
                    this._replyMessage(message, reply);
                } else if (message.text.toLowerCase().indexOf('my issue') > -1) {
                    this._getMyIssues(message);

                } else {
                    this._replyMessage(message, "What's up? Need Help? Type `jiraiya help me! Please!`\nJust kidding. Type `jiraiya help` is enough.");
                }
            }
        }
    };

    /*
    Getting ticket currently assigned to me (non-closed)
    */
    Jiraiya.prototype._getMyIssues = function(message) {
        var self = this;
        self.getUserById(message.user).then(function(user) {
            var email_safe = encodeURIComponent('"' + user.profile.email + '"');
            self.jira.getMyIssues(email_safe,
                function(error, resp) {
                    var reply = "Cannot find any issue assigned to you ";
                    if (error) {
                        reply = "Sorry, " + error + "\n(╯°□°)╯︵ ┻━┻";
                    } else {
                        var issues = resp.issues;
                        for (var i = 0; i < issues.length; i++) {
                            if (i === 0) {
                                reply = "These are issues (non-closed) assigned to you\n";
                            }
                            reply += self._issueURL(issues[i].key) + ' : ' + issues[i].fields.summary + '\n';
                        }
                        self._replyMessage(message, reply);
                    }
                }
            );
        });

    };
    /*
    Getting Jira ticket issue
    */
    Jiraiya.prototype._getJiraIssue = function(message) {
        var self = this;
        var rx = /[A-z]+[-](\d)+/g;
        var issueNumber = rx.exec(message.text)[0];
        this.jira.getIssue(issueNumber,
            function(error, issue) {
                var reply = "";
                if (error) {
                    reply = "Sorry, " + error + "\n(╯°□°)╯︵ ┻━┻";
                } else {
                    reply = self._issueURL(issue.key) + issue.fields.summary + "\n```" + issue.fields.description.trunc(100) + "```";
                }
                self._replyMessage(message, reply);
            }
        );
    };

    /*
    Format issue # and add link url
    */
    Jiraiya.prototype._issueURL = function(key) {
        return "<" + config.get('jira.url') + '/browse/' + key + "|" + key + "> ";
    };

    /*
    Check if jira ticket is mentioned
    */
    Jiraiya.prototype._isJiraTicket = function(message) {
        var jira_matcher = /(\/|^)[A-z]+[-](\d)+($|\>)/g;
        var msgs = message.text.split(/\s/);
        for (var i = 0; i < msgs.length; i++) {
          if (jira_matcher.test(msgs[i])) {
            return true;
          }
        }
        return false;
    };

    Jiraiya.prototype._isChatMessage = function(message) {
        return message.type === 'message' && Boolean(message.text);
    };

    Jiraiya.prototype._isChannelConversation = function(message) {
        var channel= typeof message.channel === 'string' &&
            (message.channel[0] === 'C' || message.channel[0] === 'G');
        return channel;
    };

    Jiraiya.prototype._isFromJiraiya = function(message) {
        return message.user === this.user.id;
    };

    Jiraiya.prototype._isMentioningJiraiya = function(message) {
        return message.text.toLowerCase().indexOf('@jiraiya') > -1 ||
            message.text.toUpperCase().indexOf('<@' + this.user.id + '>') > -1;
    };

    Jiraiya.prototype._replyMessage = function(originalMessage, newMessage) {
        var self = this;
        self.postMessage(originalMessage.channel, newMessage, {
            as_user: true
        });
    };

    Jiraiya.prototype._getChannelById = function(channelId) {
        return this.channels.filter(function(item) {
            return item.id === channelId;
        })[0];
    };

    /*
    Truncate string
    */
    String.prototype.trunc = String.prototype.trunc ||
        function(n) {
            return (this.length > n) ? this.substr(0, n - 1) + '...(click link for detail)' : this;
        };

    module.exports = Jiraiya;
}());
