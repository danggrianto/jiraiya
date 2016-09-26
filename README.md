# Jiraiya

Jira slackbot

# How to install
- clone this repository
- `cd` to the repository
- `npm install`
- copy `config\default.json` to `config\production.json`
- set configuration in `config\production.json` accordingly
- start the server with `NODE_ENV=production npm start`



# Feature

## Issue Detail
Jiraiya will scan all the message sent in the channel and if it find a message containing ticket string (example: `PROJECT-123`), it will post to channel the detail of that ticket.

## Issue assigned to me
Jiraiya will print all issue assigned to the person requested the service. To do that enter this command:
`jiraiya show me my issues`

# TODO
- DM to user
- supervisor setting

# issues
- private channel not working
- DM not working
