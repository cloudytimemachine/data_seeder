const urls = require('./500websites.json');
const async = require('async');
const request = require('request');
const CronJob = require('cron').CronJob;
const logger = require('./lib/logger');

const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3001/api';
const SNAPSHOT_PATH = `${API_ENDPOINT}/snapshots`;
const QUEUELEN_PATH = `${API_ENDPOINT}/queue`;

var counter = 0;

const queuePosts = (count) => {
  async.each(urls.slice(count, count + 7), (url, cb) => {
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
          logger(`Server has responded and and snapshot is currently PENDING. Here is the response:`);
          console.log(body);
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

//
function cronSchedule() {
  if (process.env.NODE_ENV === 'production') {
    // Runs every day, every hour, every 20 minutes (3x hour).
    return '00 */20 * * * *';
  }
  // Runs every minute on the minute.
  return '00 * * * * *';
};

new CronJob(cronSchedule(), () => {
  queuePosts(counter);
  getQueueLen();
  counter += 7;
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

function startUp() {
  logger('Data_seeder is starting up.');
  request(
    {
      method: 'GET',
      url: QUEUELEN_PATH,
      json: true,
    },
    (err, res) => {
      if (err) {
        logger(`An error has occurred  ${err}`);
      } else {
        logger('Data_seeder has a working connection to the API and is ready to work.');
      }
    }
  );
}

startUp();
