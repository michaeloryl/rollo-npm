/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/15/15
 * Time: 11:10 PM
 */
var should = require('chai').should();
var sinon = require('sinon');
var events = require('../events');
var parse = require('../rolloLanguage').parse;
var proxyquire = require('proxyquire');

var doSlowTests = false;

describe('state', function () {
  it('should have default values', function () {
    var state = require('../rolloExec').state;
    state.speed.should.equal(0);
    state.defaultSpeed.should.equal(50);
    state.heading.should.equal(0);
    state.cmdCount.should.equal(0);
    state.unknownCmdCount.should.equal(0);
  })
});

describe('parse', function () {
  it('should parse a simple command with no params', function () {
    parse('go').should.deep.equal([['go']]);
  });

  it('should parse a simple command with 1 string param', function () {
    parse('color "red"').should.deep.equal([['color', 'red']]);
  });

  it('should parse a simple command with 1 numeric param', function () {
    parse('go 3 seconds').should.deep.equal([['go', 3]]);
  });

  it('should parse a block command with 1 numeric param', function () {
    parse('repeat 3 times {\ngo\nstop\n}')
      .should.deep.equal([['repeat', 3, [['go'], ['stop']]]]);
  });

  it('should parse a conditional > block', function () {
    parse('if 2 > 4 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']]]]);
    parse('if 2 greater than 4 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']]]]);
    parse('if 2 is greater than 4 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']]]]);
    parse('if 2 more than 4 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']]]]);
    parse('if 2 is more than 4 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['>', 2, 4], [['stop'], ['go']]]]);
  });

  it('should parse a conditional < block', function () {
    parse('if 5 < 2 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['<', 5, 2], [['stop'], ['go']]]]);
    parse('if 5 less than 2 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['<', 5, 2], [['stop'], ['go']]]]);
    parse('if 5 is less than 2 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['<', 5, 2], [['stop'], ['go']]]]);
  });

  it('should parse a conditional == block', function () {
    parse('if 1 == 7 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']]]]);
    parse('if 1 === 7 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']]]]);
    parse('if 1 equals 7 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']]]]);
    parse('if 1 is equal to 7 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['==', 1, 7], [['stop'], ['go']]]]);
  });

  it('should parse a conditional >= block', function () {
    parse('if 10 >= 11 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['>=', 10, 11], [['stop'], ['go']]]]);
  });

  it('should parse a conditional <= block', function () {
    parse('if 10 <= 11 {\nstop\ngo\n}')
      .should.deep.equal([['if', ['<=', 10, 11], [['stop'], ['go']]]]);
  });

  it('should parse a conditional block with a complex comparison', function () {
    //console.log("Object: " + JSON.stringify(parse('if 10 >= 2 + 3 {\nstop\ngo\n}')));
    parse('if 10 >= 2 + 3 {\nstop\ngo\n}')
      .should.deep.equal([["if", [">=", 10, ["+", [2, 3]]], [["stop"], ["go"]]]]);
  });

  it('should parse a sub and gosub', function () {
    parse('gosub mySub\nsub mySub {\nstop\ngo\n}')
      .should.deep.equal([["gosub", "mySub"], ["sub", "mySub", [["stop"], ["go"]]]]);
  });
});

describe('if', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;
  var variables = require('../rolloExec').variables;

  it('should process a true expression evaluation', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['if', ['<=', 10, 11], [['color', 'red'], ['go']]]], function () {
      console.log('count: ' + mySphero.setColor.callCount);
      mySphero.setColor.callCount.should.equal(1);
      mySphero.roll.callCount.should.equal(2);
      done();
    });
  });

  it('should skip a false expression evaluation', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['if', ['<=', 11, 10], [['color', 'red'], ['go']]]], function () {
      console.log('count: ' + mySphero.setColor.callCount);
      mySphero.setColor.callCount.should.equal(0);
      mySphero.roll.callCount.should.equal(1);
      done();
    });
  });

  it('should process a complex true expression evaluation', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero,
      [['if', ['==', ["+", [3, ["/", [["*", [2, ["-", [10, 2]]]], 4]]]], 7],
        [['color', 'red'], ['go']]]], function () {
        console.log('count: ' + mySphero.setColor.callCount);
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
  var execute = require('../rolloExec').execute;
  var variables = require('../rolloExec').variables;

  it('should be able to assign a value to a variable', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['let', '$myVar', [2]]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(2);
      done();
    });
  });

  it('should be able to assign an addition expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, [['let', '$myVar',
      [
        "+",
        [
          2,
          3
        ]
      ]
    ]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(5);
      done();
    });
  });

  it('should be able to assign a multiplication expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, [['let', '$myVar',
      [
        "*",
        [
          2,
          3
        ]
      ]
    ]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(6);
      done();
    });
  });

  it('should be able to assign a subtraction expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, [['let', '$myVar',
      [
        "-",
        [
          3,
          2
        ]
      ]
    ]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(1);
      done();
    });
  });

  it('should be able to assign a division expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, [['let', '$myVar',
      [
        "/",
        [
          6,
          2
        ]
      ]
    ]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(3);
      done();
    });
  });

  it('should be able to assign a complex expression to a variable', function (done) {
    var mySphero = getMockSphero();
    execute(mySphero, [['let', '$myVar',
      [
        "+",
        [
          [
            "*",
            [
              2,
              3
            ]
          ],
          3
        ]
      ]
    ]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(9);
      done();
    });
  });

  it('should be able to evaluate an expression with a self-refrencing variable', function (done) {
    var mySphero = getMockSphero();
    variables['$myVar'] = 4;

    execute(mySphero, [['let', '$myVar',
      [
        "+",
        [
          [
            "*",
            [
              '$myVar',
              3
            ]
          ],
          3
        ]
      ]
    ]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(15);
      done();
    });
  });

  it('should be able to evaluate an expression with a variable', function (done) {
    var mySphero = getMockSphero();
    variables['$someVar'] = 5;

    execute(mySphero, [['let', '$myVar',
      [
        "+",
        [
          [
            "*",
            [
              '$someVar',
              3
            ]
          ],
          3
        ]
      ]
    ]], function () {
      variables.hasOwnProperty('$myVar').should.equal(true);
      variables['$myVar'].should.equal(18);
      variables['$someVar'].should.equal(5);
      done();
    });
  });
});

describe('waitForTap', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  if (doSlowTests) {
    it('should be able to waitForTap with 1 second timeout', function (done) {
      var mySphero = getMockSphero();

      var now = Date.now();

      execute(mySphero, [['waitForTap', 1]], function () {
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

      execute(mySphero, [['waitForTap', 1]], function () {
        var now2 = Date.now();
        console.log(now2 - now);
        now2.should.be.above(now + 250);
        mySphero.finishCalibration.callCount.should.equal(1);
        done();
      });
    });
  }
});

describe('repeat', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should call a block of commands multiple times', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['repeat', 2, [['color', 'red'], ['stop']]]], function () {
      mySphero.setColor.callCount.should.equal(2);
      mySphero.roll.callCount.should.equal(3);  // exec calls it once every time, so 2 + 1 = 3
      done();
    });
  });
});

describe('gosub', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should call a named sub that appears at end of code', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['gosub', 'myTestSub'], ['sub', 'myTestSub', [['color', 'red'], ['stop']]]], function () {
      mySphero.setColor.callCount.should.equal(1);
      mySphero.roll.callCount.should.equal(2);  // exec calls it once every time, so 2 + 1 = 3
      done();
    });
  });

  it('should call a named sub that appears at start of code', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['sub', 'myTestSub', [['color', 'red'], ['stop']]], ['gosub', 'myTestSub']], function () {
      mySphero.setColor.callCount.should.equal(1);
      mySphero.roll.callCount.should.equal(2);  // exec calls it once every time, so 2 + 1 = 3
      done();
    });
  });
});

describe('stop', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to stop', function (done) {
    var mySphero = getMockSphero();
    state.heading = 75;
    state.defaultSpeed = 35;
    state.speed = 35;

    execute(mySphero, [['stop']], function () {
      mySphero.roll.callCount.should.equal(2);
      mySphero.roll.calledWith(0, 75).should.equal(true);
      state.speed.should.equal(0);
      state.heading.should.equal(75);
      done();
    });
  });
});

describe('pointMe', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to start calibration mode', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['pointMe']], function () {
      mySphero.startCalibration.callCount.should.equal(1);
      done();
    });
  });
});

describe('color', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to set the color', function (done) {
    var mySphero = getMockSphero();
    state.color = 0xffffff;

    execute(mySphero, [['color', 'red']], function () {
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

      execute(mySphero, [['flash', 'blue']], function () {
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

      execute(mySphero, [['pulse', 'green']], function () {
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
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  if (doSlowTests) {
    it('should be able to wait 1 second', function (done) {
      var mySphero = getMockSphero();

      var now = Date.now();

      execute(mySphero, [['wait', 1]], function () {
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
  var commands = require('../rolloExec').commands;

  it('should use delay as an alias for wait', function () {
    commands.wait.should.equal(commands.delay);
  });

  it('should use turnRight as an alias for right', function () {
    commands.right.should.equal(commands.turnRight);
  });

  it('should use turnLeft as an alias for left', function () {
    commands.left.should.equal(commands.turnLeft);
  });

  it('should use log as an alias for say', function () {
    commands.log.should.equal(commands.say);
  });

  it('should use waitForHit as an alias for waitForTap', function () {
    commands.waitForHit.should.equal(commands.waitForTap);
  });

  it('should use turnAround as an alias for reverse', function () {
    commands.turnAround.should.equal(commands.reverse);
  });

  it('should use loop as an alias for repeat', function () {
    commands.repeat.should.equal(commands.loop);
  });

  it('should use call as an alias for gosub', function () {
    commands.gosub.should.equal(commands.call);
  });
});

describe('go', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to go', function (done) {
    var mySphero = getMockSphero();
    state.heading = 75;
    state.defaultSpeed = 35;

    execute(mySphero, [['go']], function () {
      mySphero.roll.callCount.should.equal(2);
      state.speed.should.equal(35);
      state.heading.should.equal(75);
      done();
    });
  });

  if (doSlowTests) {
    it('should be able to go for 2 seconds and stop', function (done) {
      var mySphero = getMockSphero();
      state.heading = 45;

      var now = Date.now();

      execute(mySphero, [['go', 2]], function () {
        var now2 = Date.now();
        now2.should.be.above(now + 2000);
        now2.should.not.be.above(now + 2250); // 250ms wiggle room for other code execution time
        mySphero.roll.callCount.should.equal(3);
        state.speed.should.equal(0);
        state.heading.should.equal(45);
        done();
      });
    });
  }
});

describe('turn', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to turn right with no parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['right']], function () {
      state.heading.should.equal(90);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn right with a parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['right', 45]], function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn left with no parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['left']], function () {
      state.heading.should.equal(270);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn left with a parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['left', 30]], function () {
      state.heading.should.equal(330);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn negative degrees', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['turn', -90]], function () {
      state.heading.should.equal(270);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to turn positive 45', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['turn', 45]], function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to reverse heading', function (done) {
    var mySphero = getMockSphero();
    state.heading = 45;

    execute(mySphero, [['reverse']], function () {
      state.heading.should.equal(225);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('should be able to reverse heading and wrap degrees properly to 0 to 359', function (done) {
    var mySphero = getMockSphero();
    state.heading = 225;

    execute(mySphero, [['reverse']], function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });
});

describe('speed', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to set various default speeds', function (done) {
    var mySphero = getMockSphero();
    state.speed = 0;
    state.defaultSpeed = 50;

    execute(mySphero, [['speed', 10]], function () {
      state.defaultSpeed.should.equal(25);
      state.speed.should.equal(0);
      mySphero.roll.calledOnce.should.equal(true);
      done();
    });
  });

  it('should be able to set various default speeds', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['speed', 100]], function () {
      state.defaultSpeed.should.equal(255);
      state.speed.should.equal(0);
      mySphero.roll.calledOnce.should.equal(true);
      done();
    });
  })
});

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
