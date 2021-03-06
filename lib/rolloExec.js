/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/11/15
 * Time: 8:48 PM
 */

var async = require('async');
var colors = require('./colors');
var events = require('./events');
var config = require('./config');
var _ = require('lodash');
var constants = require('./constants');

var subroutines = {};

var variables = {};

var operands = {
  '+': add,
  '-': subtract,
  '*': multiply,
  '/': divide,
  '=': assign,
  '==': compareEquals,
  '!=': compareNotEquals,
  '<': compareLessThan,
  '>': compareGreaterThan,
  '<=': compareLessThanEquals,
  '>=': compareGreaterThanEquals
};

var state = {
  sphero: null,
  speed: 0,
  defaultSpeed: 50,
  heading: 0,
  cmdCount: 0,
  unknownCmdCount: 0,
  stopped: false
};

var functions = {
  '^getspeed': function () {
    return state.speed;
  },
  '^getdefaultspeed': function () {
    return state.defaultSpeed;
  },
  '^getheading': function () {
    return state.heading;
  },
  '^getcommandcount': function () {
    return state.cmdCount;
  },
  '^getunknowncommandcount': function () {
    return state.unknownCmdCount;
  }
};

var commands = {
  log: log,
  say: log,
  wait: wait,
  delay: wait,
  turnright: turnRight,
  right: turnRight,
  turnleft: turnLeft,
  left: turnLeft,
  turn: turn,
  speed: speed,
  flash: flash,
  color: color,
  pulse: pulse,
  go: go,
  stop: stop,
  waitfortap: waitForTap,
  waitforhit: waitForTap,
  turnaround: turnAround,
  reverse: turnAround,
  pointme: pointMe,
  loop: repeat,
  repeat: repeat,
  gosub: gosub,
  call: gosub,
  'let': _let,
  'if': _if,
  'while': _while,
  dowhile: doWhile,
  dountil: doUntil,
  '#': comment
};

// ***********
// EXPRESSIONS
// ***********

/*
 * LET
 */
function _let(params, cb) {
  var total;
  var varName = params[0];
  var exp = params[1];

  value = evaluate(exp);

  setVar(varName, value);

  return cb();
}

// ************
// FLOW CONTROL
// ************

/*
 * IF
 */
function _if(params, cb) {
  var condition = params[0]; // condition = [op, exp, exp]
  var op = condition[0];
  var a = condition[1];
  var b = condition[2];
  var lines = params[1];
  var elseLines = params[2];

  if (operands[op](a, b)) {
    logIt("if: " + op);
    executeLines(lines, function () {
      logIt("if: end " + op);
      return cb();
    });
  } else {
    if (elseLines) {
      logIt("if-else: " + op);
      executeLines(elseLines, function () {
        logIt("if-else: end " + op);
        return cb();
      });
    } else {
      return cb();
    }
  }
}

/*
 * DO ... UNTIL
 */
function doUntil(params, cb) {
  var condition = params[0]; // condition = [op, exp, exp]
  var op = condition[0];
  var a = condition[1];
  var b = condition[2];
  var lines = params[1];

  logIt("do until:");
  async.doUntil(
    function () {
      return operands[op](a, b);
    },
    function (next) {
      if (state.stopped) {
        return false; // returning false is basically returning an error to stop the loop
      }
      logIt('  do until: loop');
      executeLines(lines, function (err) {
        logIt('  do until: end-loop');
        return next();
      });
    },
    function (err, res) {
      logIt("do until: end");
      return cb();
    });
}

/*
 * DO ... WHILE
 */
function doWhile(params, cb) {
  var condition = params[0]; // condition = [op, exp, exp]
  var op = condition[0];
  var a = condition[1];
  var b = condition[2];
  var lines = params[1];

  logIt("do while:");
  async.doWhilst(
    function () {
      return operands[op](a, b);
    },
    function (next) {
      if (state.stopped) {
        return false; // returning false is basically returning an error to stop the loop
      }
      logIt('  do while: loop');
      executeLines(lines, function (err) {
        logIt('  do while: end-loop');
        return next();
      });
    },
    function (err, res) {
      logIt("do while: end");
      return cb();
    }
  );
}

/*
 * WHILE
 */
function _while(params, cb) {
  var condition = params[0]; // condition = [op, exp, exp]
  var op = condition[0];
  var a = condition[1];
  var b = condition[2];
  var lines = params[1];

  logIt("while:");
  async.whilst(
    function () {
      return operands[op](a, b);
    },
    function (next) {
      if (state.stopped) {
        return false; // returning false is basically returning an error to stop the loop
      }
      logIt('  while: loop');
      executeLines(lines, function (err) {
        logIt('  while: end-loop');
        return next();
      });
    },
    function (err, res) {
      logIt("while: end");
      return cb();
    });
}

/*
 * WAIT
 */
function wait(params, cb) {
  var count = params[0];

  logIt("wait: " + count + " seconds");

  setTimeout(function () {
    logIt("wait: done");
    return cb();
  }, count * 1000);
}

/*
 * WAIT FOR TAP
 */
function waitForTap(params, cb) {
  logIt("waitForTap:");
  var timer;

  var topic = events.subscribe(constants.COLLISION, function () {
    logIt("TAP!");
    topic.remove(); // no longer listen once we catch one collision
    if (sphero()) {
      sphero().finishCalibration();
    }
    if (timer) {
      clearTimeout(timer); // abort the timeOut
    }
    setTimeout(function () {
      return cb();
    }, 300); // gives 300ms for ball to settle after tapping
  });

  if (params[0]) {
    timer = setTimeout(function () {
      topic.remove();
      logIt("waitForTap: timed out waiting for tap");
      if (sphero()) {
        sphero().finishCalibration();
      }
      return cb();
    }, (params[0] * 1000));
  }
}

/*
 * REPEAT
 */
function repeat(params, cb) {
  var count = params[0];
  var lines = params[1];

  async.timesSeries(count,
    function (n, next) {
      if (state.stopped) {
        return false; // returning false is basically returning an error to stop the loop
      }
      logIt("repeat: " + (n + 1) + " of " + count);
      executeLines(lines, function (err) {
        logIt("repeat: end");
        return next();
      });
    },
    function (err, res) {
      return cb();
    });
}

function gosub(params, cb) {
  var label = params[0];

  if (subroutines.hasOwnProperty(label)) {
    return executeLines(subroutines[label], cb);
  } else {
    return cb();
  }
}

// ****
// MOVE
// ****

/*
 * GO
 */
function go(params, cb) {
  logIt("go: speed=" + getDefaultSpeed() + " heading=" + state.heading
    + (params[0] ? " duration=" + params[0] : ''));
  if (sphero()) {
    sphero().roll(getDefaultSpeed(), state.heading)
  }

  setSpeed(getDefaultSpeed());

  if (params[0]) {
    var count = params[0];

    setTimeout(function () {
      //logIt("go: done");
      setSpeed(0);
      sphero().roll(0, state.heading);
      return cb();
    }, count * 1000);
  } else {
    return cb();
  }
}

/*
 * STOP
 */
function stop(params, cb) {
  logIt("stop:");

  setSpeed(0);

  if (sphero()) {
    sphero().roll(0, state.heading)
  }
  return cb();
}

/*
 * POINT ME
 */
function pointMe(params, cb) {
  logIt("pointMe:");
  sphero().startCalibration();
  return cb();
}

// **********
// NAVIGATION
// **********

/*
 * SPEED
 */
function speed(params, cb) {
  var speed = params[0];
  setDefaultSpeed(Math.floor(255 * speed / 100)); // speed is a percentage of max, 255 being max
  logIt("speed: " + speed);
  return cb();
}

/*
 * TURN
 */
function turn(params, cb) {
  var degrees = params[0];
  adjustHeading(degrees);
  logIt("turn: " + degrees);
  return cb();
}

/*
 * TURN RIGHT
 */
function turnRight(params, cb) {
  var degrees = 90;

  if (params.length > 0) {
    degrees = params[0];
  }

  adjustHeading(degrees);
  logIt("turnRight: " + degrees);
  return cb();
}

/*
 * TURN LEFT
 */
function turnLeft(params, cb) {
  var degrees = 90;

  if (params.length > 0) {
    degrees = params[0];
  }

  adjustHeading(-degrees);
  logIt("turnLeft: " + degrees);
  return cb();
}

/*
 * TURN AROUND
 */
function turnAround(params, cb) {
  adjustHeading(180, cb);
  logIt("turnAround:");
}

// ******
// COLORS
// ******

/*
 * COLOR
 */
function color(params, cb) {
  var color = colors.parseColor(params[0]);
  setColor(color);
  logIt("color: " + color);
  return cb();
}

/*
 * FLASH
 */
function flash(params, cb) {
  var color = colors.parseColor(params[0]);
  var oldColor = getColor();
  setColor(color);
  setTimeout(function () {
    setColor(oldColor);
  }, 500);

  logIt("flash: " + color);
  return cb();
}

/*
 * PULSE
 */
function pulse(params, cb) {
  var brightness = [10, 18, 25, 50, 75, 82, 90, 95, 100, 95, 90, 82, 75, 50, 25, 18, 10, 0];
  var color = colors.parseColor(params[0]);
  var oldColor = getColor();

  logIt("pulse: " + color);

  async.eachSeries(brightness,
    function (b, next) {
      if (state.stopped) {
        return false; // returning false is basically returning an error to stop the loop
      }
      if (b !== 0) {
        setColor(darkenColor(color, b));
        setTimeout(function () {
          return next();
        }, 18);
      } else {
        setColor(oldColor);
        return next();
      }
    });

  return cb();
}

// ******
// OUTPUT
// ******

/*
 * LOG / SAY
 */
function log(params, cb) {
  params.forEach(function (param, index, array) {
    logIt("say: " + param);
    events.publish(constants.SAY_LINE, param);
  });
  return cb();
}

/*
 * COMMENT
 */
function comment(params, cb) {
  return cb();
}

// -------- Commands to adjust Sphero features and state

function setSpeed(speed) {
  if (state.speed == null) {
    state.speed = 0;
  }
  state.speed = speed;
}

function getSpeed() {
  return state.speed;
}

function setDefaultSpeed(speed) {
  if (state.defaultSpeed == null) {
    state.defaultSpeed = 0;
  }
  state.defaultSpeed = speed;
}

function getDefaultSpeed() {
  return state.defaultSpeed;
}

function setHeading(heading, cb) {
  if (sphero()) { // maybe this will actually turn us if we're not moving
    if (getSpeed() === 0) {
      sphero().roll(0, state.heading);
      if (cb) {
        setTimeout(function () {
          return cb();
        }, 600); // gives 600ms for ball to fully turn around if still
      }
    } else {
      sphero().roll(state.speed, state.heading);
      if (cb) {
        return cb();
      }
    }
  }
}

function adjustHeading(heading, cb) {
  if (state.heading == null) {
    state.heading = 0;
  }

  state.heading += heading;

  if (state.heading > 359) {
    state.heading -= 360;
  }

  if (state.heading < 0) {
    state.heading += 360;
  }

  return setHeading(heading, cb);
}

function setColor(color) {
  if (state.color == null) {
    state.color = 0;
  }
  state.color = color;

  if (sphero()) {
    sphero().setColor(color);
  }
}

function getColor() {
  return state.color || 0x000000;
}

function sphero() {
  return state.sphero;
}

function disconnectHandler(data) {
  events.publish(constants.DISCONNECT, {});
}

function collisionHandler(data) {
  events.publish(constants.COLLISION, convertCollisionData(data.DATA));
}

function convertCollisionData(data) {
  var obj = {};

  obj.xImpact = convertToSignedInt(data[7], data[8]);
  obj.yImpact = convertToSignedInt(data[9], data[10]);
  obj.speed = data[11];

  return obj;
}

function convertToSignedInt(msb, lsb) {
  var negative = msb > 128;
  if (negative) {
    msb -= 128;
  }
  var value = msb * 256 + lsb;
  if (negative) {
    value = 0 - value;
  }
  return value;
}

function darkenColor(color, percentage) {
  var r = (color >> 16) & 0xFF;
  var g = (color >> 8) & 0xFF;
  var b = color & 0xFF;

  r = Math.floor(r * (percentage / 100)) << 16;
  g = Math.floor(g * (percentage / 100)) << 8;
  b = Math.floor(b * (percentage / 100));

  return r + g + b;
}
// -------- expression processing

function getVar(varName) {
  if (!variables.hasOwnProperty(varName)) {
    variables[varName] = 0;
  }
  return variables[varName];
}

function setVar(varName, value) {
  variables[varName] = value;
  return value;
}

function evaluate(data) {
  var op;
  var exp;

  if (typeof data === 'number') {
    return data;
  } else if (typeof data[0] === 'number') {
    return data[0];
  } else if (typeof data === 'string') {
    if (data.charAt(0) === '$') {
      return getVar(data);
    }
    if (data.charAt(0) === '^') {
      if (functions.hasOwnProperty(data)) {
        return functions[data]();
      }
    }
  } else {
    op = data[0];
    exp = data[1];
  }

  var v1 = exp[0];

  if (typeof v1 === 'object') {
    v1 = evaluate(v1);
  } else if (typeof v1 === 'string') { // assume variable
    v1 = getVar(v1);
  }

  var v2 = exp[1];

  if (typeof v2 === 'object') {
    v2 = evaluate(v2);
  } else if (typeof v2 === 'string') { // assume variable
    v2 = getVar(v2);
  }

  return operands[op](v1, v2);
}

function assign(a) {
  return a;
}

function add(a, b) {
  if (typeof a === 'string' || typeof b === 'string') {
    return "" + a + b;
  }
  return a + b;
}

function subtract(a, b) {
  if (typeof a === 'string' || typeof b === 'string') {
    throw {err: "Subtract type error", msg: "Cannot subtract a string from a number, a string from a string, or a number from a string. Check your variables."}
  }
  return a - b;
}

function multiply(a, b) {
  if (typeof a === 'string' || typeof b === 'string') {
    throw {err: "Multiply type error", msg: "Cannot multiple a string with a number, a string with a string, or a number with a string. Check your variables."}
  }
  return a * b;
}

function divide(a, b) {
  if (typeof a === 'string' || typeof b === 'string') {
    throw {err: "Divide type error", msg: "Cannot divide a string by a number, a string by a string, or a number by a string. Check your variables."}
  }
  if (b === 0) {
    throw "Cannot divide a number by 0.";
  }
  return a / b;
}

function compareEquals(a, b) {
  return evaluate(a) == evaluate(b);
}

function compareNotEquals(a, b) {
  return evaluate(a) != evaluate(b);
}

function compareLessThan(a, b) {
  return evaluate(a) < evaluate(b);
}

function compareGreaterThan(a, b) {
  return evaluate(a) > evaluate(b);
}

function compareLessThanEquals(a, b) {
  return evaluate(a) <= evaluate(b);
}

function compareGreaterThanEquals(a, b) {
  return evaluate(a) >= evaluate(b);
}

// -------- event handlers

function logIt(string) {
  if (config.debug) {
    console.log(string);
    events.publish(constants.LOG_LINE, string);
  }
}

// -------- parse and execute lines of Rollo code

function hoistSubroutines(lines) {
  return _.filter(lines, function (lineObject) {
    var line = lineObject.line;
    var cmd = line[0];
    var params = line.slice(1);
    if (cmd === 'sub') {
      subroutines[params[0]] = params[1];
      return false;
    } else {
      return true;
    }
  });
}

function executeLine(lineObject, callback) {
  if (state.stopped) {
    return callback({err: "received a stop command"}); // aka an error
  } else {
    var line = lineObject.line;
    var cmd = line[0];
    var params = line.slice(1);
    if (lineObject.hasOwnProperty('line') && commands.hasOwnProperty(cmd)) {
      state.cmdCount++;
      if (cmd !== '#') {
        events.publish(constants.LINE_RUNNING, lineObject); // don't publish comment line events
      }
      return commands[cmd].call(this, params, callback);
    } else {
      state.unknownCmdCount++;
      events.publish(constants.UNKNOWN_LINE_RUNNING, lineObject);
      logIt("Rollo: Unsupported command -> " + cmd);
      return callback();
    }
  }
}

function executeLines(lines, done) {
  async.eachSeries(lines, executeLine,
    function (err) {
      done();
    });
}

function execute(mySphero, lines, done) {
  state.sphero = mySphero;
  state.stopped = false;

  var catchStop = events.subscribe(constants.STOP, function () {
    state.stopped = true;
    logIt("Rollo: Received STOP event");
  });

  if (sphero()) {
    setHeading(0);
    sphero().configureCollisionDetection(0x01, 0x40, 0x40, 0x40, 0x40, 0x50); // defaults: 0x01, 0x40, 0x40, 0x50, 0x50, 0x50
    sphero().on("collision", collisionHandler);
    sphero().on("disconnect", disconnectHandler);
  }

  return executeLines(hoistSubroutines(lines), function () {
    catchStop.remove(); // stop catching stop requests
    events.publish(constants.TOPIC_ROLLO_COMPLETE, {});
    done();
  });
}

module.exports.execute = execute;
module.exports.state = state;
module.exports.commands = commands;
module.exports.subroutines = subroutines;
module.exports.variables = variables;
