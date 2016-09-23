(function() {
  'use strict';

  /**
   * Command line script that generates a SQLite database file
   *
   * Usage:
   *
   *   node databaseGenerator.js [destFile]
   *
   *   destFile is optional and it will default to "jiraiya.db"
   *
   * @author Daniel Anggrianto <d.anggrianto@gmail.com>
   */

  var path = require('path');
  var sqlite3 = require('sqlite3').verbose();

  var outputFile = process.argv[2] || path.resolve(__dirname, 'jiraiya.db');
  var db = new sqlite3.Database(outputFile);

  db.serialize();
  // Creates the database structure
  db.run('CREATE TABLE IF NOT EXISTS username (slack TEXT PRIMARY KEY, jira TEXT DEFAULT NULL)');

}());
