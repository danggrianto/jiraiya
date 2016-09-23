(function() {
    'use strict';

    var request = require('request');

    var Jira = function Constructor() {
        // this.settings = settings;
        this.options = {
            method: 'GET',
            baseUrl: 'https://jira.meetmecorp.com/rest/api/2/issue/',
            headers: {
                contentType: 'application/json'
            },
            auth: {
                user: process.env.JIRA_USER,
                pass: process.env.JIRA_PASSWORD
            }
        };
    };
    Jira.prototype.getIssue = function(issueNumber, callback) {
      var options = this.options;
      options.url = issueNumber;
        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var issue = JSON.parse(body);
                callback(null, issue);
            } else {
                if (response.statusCode == 401) {
                  callback('Invalid Username/Password');
                } else if (response.statusCode == 404) {
                  callback("issue not found");
                }
                  else {
                    callback(response);
                }
            }
            return ;
        });
    };

    module.exports = Jira;
}());
