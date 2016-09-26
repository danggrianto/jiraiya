(function() {
    'use strict';

    var request = require('request');
    var config = require('config');

    var Jira = function Constructor() {
        // this.settings = settings;
        this.options = {
            method: 'GET',
            baseUrl: config.get('jira.url')+'/rest/api/2/',
            headers: {
                contentType: 'application/json'
            },
            auth: {
                user: config.get('jira.username'),
                pass: config.get('jira.password')
            }
        };
    };

    Jira.prototype.getIssue = function(issueNumber, callback) {
      var options = this.options;
      options.url = 'issue/' + issueNumber;
      request(options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
              var resp = JSON.parse(body);
              callback(null, resp);
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

    Jira.prototype.getMyIssues = function(assignee, callback) {
      var options = this.options;
      options.url = 'search?jql=assignee%20%3D%20'+assignee+'%20AND%20status%20!%3Dclosed';
      request(options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
              var resp = JSON.parse(body);
              callback(null, resp);
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
