(function() {
    'use strict';

    var request = require('request');
    request({
        method: 'GET',
        uri: 'https://jira.meetmecorp.com/rest/api/2/issue/MOBILE-9843',
        headers: {
            contentType: 'application/json'
        },
        auth: {
            'user': process.env.JIRA_USER,
            'pass': process.env.JIRA_PASSWORD
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var issue = JSON.parse(body);
            console.log(issue.id); // Show the HTML for the Google homepage.
        } else {
          if (response.statusCode == 401) {
            console.log('Invalid Username/Password');
          }else {
            console.log(response);
          }

        }
    });

}());
