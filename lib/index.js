/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/11/15
 * Time: 9:13 PM
 */
var events = require('./events');
var parse = require('./rolloLanguage').parse;
var execute = require('./rolloExec').execute;
var constants = require('./constants');
var fs = require('fs');
var config = require('./config');

module.exports.execute = execute;
module.exports.parse = parse;
module.exports.run = run;
module.exports.runFile = runFile;
module.exports.registerDisconnectEvent = registerDisconnectEvent;
module.exports.registerCompleteEvent = registerCompleteEvent;
module.exports.registerLineEvent = registerLineEvent;
module.exports.registerSayEvent = registerSayEvent;
module.exports.registerLogEvent = registerLogEvent;
module.exports.stop = stop;
module.exports.setDebug = setDebug;
module.exports.setEcho = setEcho;

function runFile(mySphero, sourceFile, callback) {
  fs.readFile(sourceFile, 'utf8', function (err, source) {
    if (err) {
      console.log("Could not read file " + sourceFile);
      console.log("Error: " + err.message);
      return;
    }

    run(mySphero, source, callback);
  });
}

function run(mySphero, source, callback) {
  var tree = parse(source);

  execute(mySphero, tree, callback);
}

function registerDisconnectEvent(callback) {
  return events.subscribe(constants.DISCONNECT, callback);
}

function registerCompleteEvent(callback) {
  return events.subscribe(constants.COMPLETE, callback);
}

function registerLineEvent(callback) {
  return events.subscribe(constants.LINE_RUNNING, callback);
}

function registerSayEvent(callback) {
  return events.subscribe(constants.SAY_LINE, callback);
}

function registerLogEvent(callback) {
  return events.subscribe(constants.LOG_LINE, callback);
}

function stop() {
  events.publish(constants.STOP, {}); // Just issues the stop event, which is caught by the line processor
}

function setDebug(bool) {
  config.debug = bool;
}

function setEcho(bool) {
  config.sayEcho = bool;
}
