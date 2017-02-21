
var childProcess = require('child_process');
var Redis = require('ioredis');

console.log('==========================');
console.log('redis: ' + require('../package.json').version);
var os = require('os');
console.log('CPU: ' + os.cpus().length);
console.log('OS: ' + os.platform() + ' ' + os.arch());
console.log('OS freemem: ' + os.freemem() / 1024 / 1024 + "MB");
console.log('node version: ' + process.version);
console.log('==========================');

var redisJD, redisJ;
var waitReady = function (next) {
  var pending = 2;
  function check() {
    if (!--pending) {
      next();
    }
  }
  redisJD = new Redis({ parser: 'javascript', dropBufferSupport: true });
  redisJ = new Redis({ parser: 'javascript', dropBufferSupport: false });
  redisJD.on('ready', check);
  redisJ.on('ready', check);
};

var quit = function () {
  redisJD.quit();
  redisJ.quit();
};

suite('SET foo bar with 800w concurrency', function () {
  set('mintime', 5000);
  set('concurrency', 8000000);
  before(function (start) {
    waitReady(start);
  });

  bench('javascript parser + dropBufferSupport: true', function (next) {
    redisJD.set('foo', 'bar', next);
  });

  bench('javascript parser', function (next) {
    redisJ.set('foo', 'bar', next);
  });

  after(quit);
});

suite('decr decrTest with 800w concurrency', function () {
  set('mintime', 5000);
  set('concurrency', 8000000);
  before(function (start) {
    waitReady(start);
    redisJD.set('decrTestJD', 10000000);
    redisJ.set('decrTestJ', 10000000);
  });

  bench('redisJD decr', function (next) {
    redisJD.decr('decrTestJD', next);
  });
  bench('redisJ decr', function (next) {
    redisJ.decr('decrTestJ', next);
  });

  after(quit);
});

suite('decrby decrbyTest 50 with 800w concurrency', function () {
  set('mintime', 5000);
  set('concurrency', 8000000);
  before(function (start) {
    waitReady(start);
    redisJD.set('decrbyTestJD', 10000000);
    redisJ.set('decrbyTestJ', 10000000);
  });

  bench('redisJD decrby', function (next) {
    redisJD.decrby('decrbyTestJD',50, next);
  });
  bench('redisJ decrby', function (next) {
    redisJ.decrby('decrbyTestJ',50, next);
  });

  after(quit);
});
