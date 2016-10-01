var urls = require('./website_list.json');
var async = require('async');
var request = require('request');
var CronJob = require('cron').CronJob;

var counter = 0;

var queuePosts = function() {
  async.each(urls.slice(counter, counter + 4), function(url, cb) {
    console.log(`I'm going to hit this url: ${url}`);
    //request.post({url: 'http://localhost:3001/api/archives', form: {url: url}}, cb)
  });
};

new CronJob('00 * * * * *', function() {
  // Runs every day, every hour on the minute.
  queuePosts();
  counter = counter + 4;
  }, function () {

  },
  true,
  'America/New_York'
);
