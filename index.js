const urls = require('./website_list.json');
const async = require('async');
const request = require('request');
const CronJob = require('cron').CronJob;
const logger = require('./lib/logger');

const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3001';
const SNAPSHOT_PATH = `${API_ENDPOINT}/snapshots`;
const QUEUELEN_PATH = `${API_ENDPOINT}/queue`;

let counter = 0;

const queuePosts = (count) => {
  async.each(urls.slice(count, count + 4), (url, cb) => {
    logger(`Requesting snapshot of ${url}`);
    const snapshotRequest = { requestedUrl: url };

    request(
      {
        method: 'POST',
        url: SNAPSHOT_PATH,
        json: true,
        body: snapshotRequest,
      },
      (err, res, body) => {
        if (err) {
          logger(err);
        } else if (body.status === 'PENDING') {
          logger(`Server has responded and snapshot of ${url} is currently PENDING.`);
        }
      }
    );
    return cb;
  });
};

const getQueueLen = () => {
  request(
    {
      method: 'GET',
      url: QUEUELEN_PATH,
      json: true,
    },
    (err, res, body) => {
      if (err) {
        logger(err);
      } else {
        logger(`Queue length is currently ${body.queueLength}`);
      }
    }
  );
};

new CronJob('00 * * * * *', () => {
  // Runs every day, every hour and every minute when the clock shows 00 seconds.
  queuePosts(counter);
  getQueueLen();
  counter += 4;
  if (counter >= urls.length) {
    // if we're a the end of the list of websites, just go back to the beginning
    counter = 0;
  }
}, () => {
},
  // start this thing up immediately
  true,
  // set time zone
  'America/New_York'
);
