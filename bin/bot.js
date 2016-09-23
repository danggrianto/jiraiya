#!/usr/bin/env node

'use strict';

/**
 * Jiraiya launcher script.
 *
 * @author Daniel Anggrianto <d.anggrianto@gmail.com>
 */

var Jiraiya = require('../lib/jiraiya');

/**
 * Environment variables used to configure the bot:
 *
 *  BOT_API_KEY : the authentication token to allow the bot to connect to your slack organization. You can get your
 *      token at the following url: https://<yourorganization>.slack.com/services/new/bot (Mandatory)
 *  BOT_NAME: the username you want to give to the bot within your organisation.
 */
var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;

var jiraiya = new Jiraiya({
    token: token,
    name: name
});

jiraiya.run();
