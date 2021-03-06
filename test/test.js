/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/15/15
 * Time: 11:10 PM
 */
var should = require('chai').should();
var sinon = require('sinon');
var events = require('../lib/events');
var parse = require('../lib/rolloLanguage').parse;
var constants = require('../lib/constants');
var proxyquire = require('proxyquire');

//console.log("skip: " + process.env.MOCHA_SKIP_SLOW_TESTS);

var doSlowTests = process.env.MOCHA_SKIP_SLOW_TESTS ? false : true;

describe('state', function () {
  it('should have default values', function () {
    var state = require('../lib/rolloExec').state;
    state.speed.should.equal(0);
    state.defaultSpeed.should.equal(50);
    state.heading.should.equal(0);
    state.cmdCount.should.equal(0);
    state.unknownCmdCount.should.equal(0);
    state.stopped.should.equal(false);
  })
});

function linesOnly(obj) {
  if (obj.hasOwnProperty('line')) {
    var a = obj.line;

    var b = [];
    a.forEach(function (element) {
      if (typeof element != 'object') {
        b.push(element);
      } else {
        b.push(element.map(linesOnly));
      }
    });
    return b;
  } else {
    return obj;
  }
}

function getMockSphero() {
  mySphero = {
    roll: sinon.stub(),
    on: sinon.stub(),
    configureCollisionDetection: sinon.stub(),
    setColor: sinon.stub(),
    startCalibration: sinon.stub(),
    finishCalibration: sinon.stub()
  };

  return mySphero;
}

describe('parse', function () {
  it('should parse a simple command with no params', function () {
    parse('go').map(linesOnly).should.deep.equal([['go']]);
  });

  it('should parse a simple command with 1 string param', function () {
    parse('color "red"').map(linesOnly).should.deep.equal([['color', 'red']]);
  });

  it('should parse a simple command with 1 numeric param', function () {
    parse('go 3 seconds').map(linesOnly).should.deep.equal([['go', 3]]);
  });

  it('should parse a block command with 1 numeric param', function () {
    parse('repeat 3 times {\ngo\nstop\n}').map(linesOnly)
      .should.deep.equal([['repeat', 3, [['go'], ['stop']]]]);
  });

  it('should parse a conditional > block', function () {
    parse('if 2 > 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 greater than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 is greater than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 more than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 is more than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
  });

  it('should parse a conditional > block', function () {
    parse('if 2 > 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 greater than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 is greater than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 more than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
    parse('if 2 is more than 4 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']], []]]);
  });

  it('should parse EOL comments', function () {
    parse('if 5 < 2 {\nstop# comment here\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['<', 5, 2], [['stop'], ['go']], []]]);
    parse('if 5 less than 2 {\nstop\ngo #comment here\n}').map(linesOnly)
      .should.deep.equal([['if', ['<', 5, 2], [['stop'], ['go']], []]]);
    parse('if 5 is less than 2 {#comment here\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['<', 5, 2], [['stop'], ['go']], []]]);
  });

  it('should parse line comments', function () {
    parse('if 5 < 2 {\n# comment here\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['<', 5, 2], [['#'], ['stop'], ['go']], []]]);
    parse('if 5 less than 2 {\n  #comment here\nstop\ngo \n}').map(linesOnly)
      .should.deep.equal([['if', ['<', 5, 2], [['#'], ['stop'], ['go']], []]]);
    parse('if 5 is less than 2 {\nstop\n#comment here\n # more comment here\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['<', 5, 2], [['stop'], ['#'], ['#'],  ['go']], []]]);
  });

  it('should parse a conditional == block', function () {
    parse('if 1 == 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']], []]]);
    parse('if 1 === 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']], []]]);
    parse('if 1 equals 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']], []]]);
    parse('if 1 is equal to 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']], []]]);
  });

  it('should parse a conditional != block', function () {
    parse('if 1 != 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
    parse('if 1 !== 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
    parse('if 1 not equals 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
    parse('if 1 is not equal to 7 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
  });

  it('should parse a conditional >= block', function () {
    parse('if 10 >= 11 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>=', 10, 11], [['stop'], ['go']], []]]);
  });

  it('should parse a conditional <= block', function () {
    parse('if 10 <= 11 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['<=', 10, 11], [['stop'], ['go']], []]]);
  });

  it('should parse a conditional block with a complex comparison', function () {
    //console.log("Object: " + JSON.stringify(parse('if 10 >= 2 + 3 {\nstop\ngo\n}')));
    parse('if 10 >= 2 + 3 {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([["if", [">=", 10, ["+", [2, 3]]], [["stop"], ["go"]], []]]);
  });

  it('should parse an if ... else', function () {
    parse('if 10 >= 11 {\nstop\n}\nelse {\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['>=', 10, 11], [['stop']], [['go']]]]);
  });

  it('should parse a sub and gosub', function () {
    parse('gosub mySub\nsub mySub {\nstop\ngo\n}').map(linesOnly)
      .should.deep.equal([["gosub", "mysub"], ["sub", "mysub", [["stop"], ["go"]]]]);
  });

  it('should parse regardless of case', function () {
    parse('iF 1 != 7 {\nsTOp\nGo\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
    parse('IF 1 !== 7 {\nSTOP\nGO\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
    parse('If 1 NOT EQuals 7 {\nstOP\nGO\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
    parse('if 1 IS nOt EquAL to 7 {\nSTOP\ngo\n}').map(linesOnly)
      .should.deep.equal([['if', ['!=', 1, 7], [['stop'], ['go']], []]]);
  });
});

describe('functions', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;
  var variables = require('../lib/rolloExec').variables;

  it('should return the getSpeed() value', function (done) {
    var mySphero = getMockSphero();
    delete variables['$var1'];
    state.speed = 23;

    execute(mySphero, parse('let $var1 = getSpeed()'),
      function () {
        variables['$var1'].should.equal(23);
        done();
      });
  });

  it('should return the getHeading() value', function (done) {
    var mySphero = getMockSphero();
    delete variables['$var1'];
    state.heading = 42;

    execute(mySphero, parse('let $var1 = getHeading()'),
      function () {
        variables['$var1'].should.equal(42);
        done();
      });
  });

  it('should return the getDefaultSpeed() value', function (done) {
    var mySphero = getMockSphero();
    delete variables['$var1'];
    state.defaultSpeed = 3.1415;

    execute(mySphero, parse('let $var1 = getDefaultSpeed()'),
      function () {
        variables['$var1'].should.equal(3.1415);
        done();
      });
  });
});

describe('while', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;
  var variables = require('../lib/rolloExec').variables;

  it('should loop until the condition is true', function (done) {
    var mySphero = getMockSphero();
    delete variables['$var1'];

    execute(mySphero, parse('while $var1 < 3 {\n  let $var1 = $var1 + 1\n  color "blue"\n}'),
      function () {
        variables['$var1'].should.equal(3);
        mySphero.setColor.callCount.should.equal(3);
        done();
      });
  });
});

describe('do ... while', function () {
  var execute = require('../lib/rolloExec').execute;
  var variables = require('../lib/rolloExec').variables;

  it('should loop until the condition is true', function (done) {
    var mySphero = getMockSphero();
    delete variables['$var1'];

    execute(mySphero, parse('do {\n  let $var1 = $var1 + 1\n  color "blue"\n} while $var1 < 3\n'),
      function () {
        variables['$var1'].should.equal(3);
        mySphero.setColor.callCount.should.equal(3);
        done();
      });
  });
});

describe('do ... until', function () {
  var execute = require('../lib/rolloExec').execute;
  var variables = require('../lib/rolloExec').variables;

  it('should loop until the condition is true', function (done) {
    var mySphero = getMockSphero();
    delete variables['$var1'];

    execute(mySphero, parse('do {\n  let $var1 = $var1 + 1\n  color "blue"\n} until $var1 > 2 '),
      function () {
        //console.log('count: ' + mySphero.setColor.callCount);
        variables['$var1'].should.equal(3);
        mySphero.setColor.callCount.should.equal(3);
        done();
      });
  });
});

describe('if', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;
  var variables = require('../lib/rolloExec').variables;

  it('should process a true expression evaluation', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('if 10> 9 {\ncolor "red"\n go\n}'), function () {
      //console.log('count: ' + mySphero.setColor.callCount);
      mySphero.setColor.callCount.should.equal(1);
      mySphero.roll.callCount.should.equal(2);
      done();
    });
  });

  it('should skip a false expression evaluation', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('if 10 <= 9 {\ncolor "red"\n go\n}'), function () {
      //console.log('count: ' + mySphero.setColor.callCount);
      mySphero.setColor.callCount.should.equal(0);
      mySphero.roll.callCount.should.equal(1);
      done();
    });
  });

  it('should run an else block when false', function (done) {
    var mySphero = getMockSphero();
    var state = require('../lib/rolloExec').state;

    execute(mySphero, parse('if 10 <= 9 {\ncolor "red"\n go\n}\nelse {\nspeed 50\n}\n'), function () {
      //console.log('count: ' + mySphero.setColor.callCount);
      mySphero.setColor.callCount.should.equal(0);
      mySphero.roll.callCount.should.equal(1);
      state.defaultSpeed.should.equal(127);
      done();
    });
  });

  it('should process a complex true expression evaluation', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero,
      parse('if 10 - 2 > 3 * (9 - 2*4) {\ncolor "red"\n go\n}'), function () {
        //console.log('count: ' + mySphero.setColor.callCount);
        mySphero.setColor.callCount.should.equal(1);
        mySphero.roll.callCount.should.equal(2);
        done();
      });
  });

});

/*
 * let $var = 2 + 3*2 + (2+$v2) /3
 */

describe('let', function () {
  var execute = require('../lib/rolloExec').execute;
  var variables = require('../lib/rolloExec').variables;

  it('should be able to assign a value to a variable', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('let $myVar= 2'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(2);
      done();
    });
  });

  it('should be able to assign an addition expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, parse('let $myVar= 2 + 3'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(5);
      done();
    });
  });

  it('should be able to assign a multiplication expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, parse('let $myVar= 2* 3'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(6);
      done();
    });
  });

  it('should be able to assign a subtraction expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, parse('let $myVar= 3-2'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(1);
      done();
    });
  });

  it('should be able to assign a division expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, parse('let $myVar=6 /2'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(3);
      done();
    });
  });

  it('should be able to assign a complex expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, parse('let $myVar= 2*3+3'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(9);
      done();
    });
  });

  it('should be able to evaluate an expression with a self-refrencing variable', function (done) {
    var mySphero = getMockSphero();
    variables['$myVar'] = 4;

    execute(mySphero, parse('let $myVar= 3*$myVar + 3'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(15);
      done();
    });
  });

  it('should be able to evaluate an expression with a variable', function (done) {
    var mySphero = getMockSphero();
    variables['$someVar'] = 5;

    execute(mySphero, parse('let $myVar= 3* $someVar + 3'), function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(18);
      variables['$someVar'].should.equal(5);
      done();
    });
  });
});

describe('waitForTap', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  if (doSlowTests) {
    it('should be able to waitForTap with 1 second timeout', function (done) {
      var mySphero = getMockSphero();

      var now = Date.now();

      execute(mySphero, parse('waitForTap 1'), function () {
        var now2 = Date.now();
        now2.should.be.above(now + 1000);
        now2.should.not.be.above(now + 1250); // 250ms wiggle room for other code execution time
        mySphero.finishCalibration.callCount.should.equal(1);
        done();
      });
    });
  }

  if (doSlowTests) {
    it('should be able to waitForTap and respond to tap event', function (done) {
      var mySphero = getMockSphero();
      var TOPIC_COLLISION = 'collision';
      var now = Date.now();

      setTimeout(function () {
        events.publish(TOPIC_COLLISION, {xImpact: 1, yImpact: 2, speed: 50});
      }, 250);

      execute(mySphero, parse('waitForTap 1'), function () {
        var now2 = Date.now();
        //console.log(now2 - now);
        now2.should.be.above(now + 250);
        mySphero.finishCalibration.callCount.should.equal(1);
        done();
      });
    });
  }
});

describe('stop()', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;
  var stop = require('../lib').stop;

  if (doSlowTests) {
    it('show allow a stop() command to halt execution', function (done) {
      var mySphero = getMockSphero();

      state.stopped = true;

      execute(mySphero, parse('waitForTap 1\ncolor "blue"\ncolor "red"'), function () {
        mySphero.setColor.callCount.should.equal(0); // if >0, then the stop command didn't prevent it
        done();
      });

      setTimeout(function() { stop(); }, 250);
    });
  }
});

describe('line numbers', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should know how many lines have been run', function (done) {
    var mySphero = getMockSphero();
    var lineEvent = sinon.stub();
    var unknownLineEvent = sinon.stub();

    var testSub = events.subscribe(constants.LINE_RUNNING, lineEvent);
    var testSubUnknown = events.subscribe(constants.UNKNOWN_LINE_RUNNING, unknownLineEvent);

    execute(mySphero, parse('color "orange"\nstop\n\r  say "test"'), function () {
      lineEvent.callCount.should.equal(3);
      unknownLineEvent.callCount.should.equal(0);

      testSub.remove();
      testSubUnknown.remove();
      return done();
    })
  });

  it('should know how many unknown lines have been run', function (done) {
    var mySphero = getMockSphero();
    var lineEvent = sinon.stub();
    var unknownLineEvent = sinon.stub();

    var testSub = events.subscribe(constants.LINE_RUNNING, lineEvent);
    var testSubUnknown = events.subscribe(constants.UNKNOWN_LINE_RUNNING, unknownLineEvent);

    execute(mySphero, [{"number": 1, "line": ["color", "orange"]}, {"number": 2, "line": ["STOOP"]}, {"number": 4, "line": ["say", "test"]}]
      , function () {
        lineEvent.callCount.should.equal(2);
        unknownLineEvent.callCount.should.equal(1);

        testSub.remove();
        testSubUnknown.remove();
        return done();
      })
  });

  it('should get a valid line object with the event', function (done) {
    var mySphero = getMockSphero();
    var lineEvent = sinon.stub();
    var unknownLineEvent = sinon.stub();

    var testSub = events.subscribe(constants.LINE_RUNNING, lineEvent);
    var testSubUnknown = events.subscribe(constants.UNKNOWN_LINE_RUNNING, unknownLineEvent);

    execute(mySphero, parse('color "red"'), function () {
      lineEvent.callCount.should.equal(1);
      unknownLineEvent.callCount.should.equal(0);
      lineEvent.calledWith({"number": 1, "line": ["color", "red"]}).should.equal(true);

      testSub.remove();
      testSubUnknown.remove();
      return done();
    })
  });
});

describe('repeat', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should call a block of commands multiple times', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('repeat 2 times {\n  color "blue"\n  stop\n}'), function () {
      mySphero.setColor.callCount.should.equal(2);
      mySphero.roll.callCount.should.equal(3);  // exec calls it once every time, so 2 + 1 = 3
      done();
    });
  });
});

describe('gosub', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should call a named sub that appears at end of code', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('gosub myTestSub\n sub myTestSub{\n  color "yellow"\n  go\n}'), function () {
      mySphero.setColor.callCount.should.equal(1);
      mySphero.roll.callCount.should.equal(2);  // exec calls it once every time, so 2 + 1 = 3
      done();
    });
  });

  it('should call a named sub that appears at start of code', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('sub myTestSub{\n  color "yellow"\n  go\n}\ngosub myTestSub\n'), function () {
      mySphero.setColor.callCount.should.equal(1);
      mySphero.roll.callCount.should.equal(2);  // exec calls it once every time, so 2 + 1 = 3
      done();
    });
  });
});

describe('stop', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should be able to stop', function (done) {
    var mySphero = getMockSphero();
    state.heading = 75;
    state.defaultSpeed = 35;
    state.speed = 35;

    execute(mySphero, parse('stop'), function () {
      mySphero.roll.callCount.should.equal(2);
      mySphero.roll.calledWith(0, 75).should.equal(true);
      state.speed.should.equal(0);
      state.heading.should.equal(75);
      done();
    });
  });
});

describe('pointMe', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should be able to start calibration mode', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('pointMe'), function () {
      mySphero.startCalibration.callCount.should.equal(1);
      done();
    });
  });
});

describe('color', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should be able to set the color', function (done) {
    var mySphero = getMockSphero();
    state.color = 0xffffff;

    execute(mySphero, parse("color 'red'"), function () {
      mySphero.setColor.calledOnce.should.equal(true);
      mySphero.setColor.calledWith(0xff0000).should.equal(true);
      state.color.should.equal(0xff0000);
      done();
    });
  });

  it('should be able to set the color with mixed case', function (done) {
    var mySphero = getMockSphero();
    state.color = 0xffffff;

    execute(mySphero, parse("color 'rED'"), function () {
      mySphero.setColor.calledOnce.should.equal(true);
      mySphero.setColor.calledWith(0xff0000).should.equal(true);
      state.color.should.equal(0xff0000);
      done();
    });
  });

  if (doSlowTests) {
    it('should be able to flash the color', function (done) {
      var mySphero = getMockSphero();
      state.color = 0xffffff;

      execute(mySphero, parse("flash 'blue'"), function () {
        mySphero.setColor.calledOnce.should.equal(true);
        mySphero.setColor.calledWith(0x0000ff).should.equal(true);
        setTimeout(function () {
          mySphero.setColor.calledTwice.should.equal(true);
          mySphero.setColor.calledWith(0xffffff).should.equal(true);
          state.color.should.equal(0xffffff);
          done();
        }, 600);
      });
    });
  }

  if (doSlowTests) {
    it('should be able to pulse the color', function (done) {
      var mySphero = getMockSphero();
      state.color = 0xffffff;

      execute(mySphero, parse('pulse "green"'), function () {
        mySphero.setColor.calledOnce.should.equal(true);
        setTimeout(function () {
          mySphero.setColor.callCount.should.equal(18);
          mySphero.setColor.calledWith(0xffffff).should.equal(true);
          mySphero.setColor.calledWith(0x00ff00).should.equal(true);
          state.color.should.equal(0xffffff);
          done();
        }, 1100);
      });
    });
  }
});

describe('wait', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  if (doSlowTests) {
    it('should be able to wait 1 second', function (done) {
      var mySphero = getMockSphero();

      var now = Date.now();

      execute(mySphero, parse('wait 1'), function () {
        var now2 = Date.now();
        now2.should.be.above(now + 1000);
        now2.should.not.be.above(now + 1250); // 250ms wiggle room for other code execution time
        mySphero.roll.callCount.should.equal(1);
        done();
      });
    });
  }
});

describe('command aliases', function () {
  var commands = require('../lib/rolloExec').commands;

  it('should use delay as an alias for wait', function () {
    commands.wait.should.equal(commands.delay);
  });

  it('should use turnRight as an alias for right', function () {
    commands.right.should.equal(commands.turnright);
  });

  it('should use turnLeft as an alias for left', function () {
    commands.left.should.equal(commands.turnleft);
  });

  it('should use log as an alias for say', function () {
    commands.log.should.equal(commands.say);
  });

  it('should use waitForHit as an alias for waitForTap', function () {
    commands.waitforhit.should.equal(commands.waitfortap);
  });

  it('should use turnAround as an alias for reverse', function () {
    commands.turnaround.should.equal(commands.reverse);
  });

  it('should use loop as an alias for repeat', function () {
    commands.repeat.should.equal(commands.loop);
  });

  it('should use call as an alias for gosub', function () {
    commands.gosub.should.equal(commands.call);
  });
});

describe('go', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should be able to go', function (done) {
    var mySphero = getMockSphero();
    state.heading = 75;
    state.defaultSpeed = 35;

    execute(mySphero, parse('go'), function () {
      mySphero.roll.callCount.should.equal(2);
      state.speed.should.equal(35);
      state.heading.should.equal(75);
      done();
    });
  });

  if (doSlowTests) {
    it('should be able to go for 1 seconds and stop', function (done) {
      var mySphero = getMockSphero();
      state.heading = 45;

      var now = Date.now();

      execute(mySphero, parse('go 1'), function () {
        var now2 = Date.now();
        now2.should.be.above(now + 1000);
        now2.should.not.be.above(now + 1250); // 250ms wiggle room for other code execution time
        mySphero.roll.callCount.should.equal(3);
        state.speed.should.equal(0);
        state.heading.should.equal(45);
        done();
      });
    });
  }
});

describe('turn', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should be able to turn right with no parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, parse('right'), function () {
      state.heading.should.equal(90);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn right with a parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, parse('right 45'), function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn left with no parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, parse('left'), function () {
      state.heading.should.equal(270);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn left with a parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, parse('left 30'), function () {
      state.heading.should.equal(330);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn negative degrees', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, parse('turn -90'), function () {
      state.heading.should.equal(270);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn positive 45', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, parse('turn 45'), function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to reverse heading', function (done) {
    var mySphero = getMockSphero();
    state.heading = 45;

    execute(mySphero, parse('reverse'), function () {
      state.heading.should.equal(225);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to reverse heading and wrap degrees properly to 0 to 359', function (done) {
    var mySphero = getMockSphero();
    state.heading = 225;

    execute(mySphero, parse('reverse'), function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });
});

describe('speed', function () {
  var execute = require('../lib/rolloExec').execute;
  var state = require('../lib/rolloExec').state;

  it('should be able to set various default speeds', function (done) {
    var mySphero = getMockSphero();
    state.speed = 0;
    state.defaultSpeed = 50;

    execute(mySphero, parse('speed 10'), function () {
      state.defaultSpeed.should.equal(25);
      state.speed.should.equal(0);
      mySphero.roll.calledOnce.should.equal(true);
      done();
    });
  });

  it('should be able to set various default speeds', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, parse('speed 100'), function () {
      state.defaultSpeed.should.equal(255);
      state.speed.should.equal(0);
      mySphero.roll.calledOnce.should.equal(true);
      done();
    });
  })
});
