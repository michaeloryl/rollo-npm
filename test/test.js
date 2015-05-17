/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/15/15
 * Time: 11:10 PM
 */
var should = require('chai').should();
var sinon = require('sinon');
var moment = require('moment');
var proxyquire = require('proxyquire');

/*
mySphero.on.calledOnce.should.equal(true);
mySphero.configureCollisionDetection.calledOnce.should.equal(true);
*/


describe('state', function () {
  it('Should have default values', function () {
    var state = require('../rolloExec').state;
    state.speed.should.equal(0);
    state.defaultSpeed.should.equal(50);
    state.heading.should.equal(0);
    state.cmdCount.should.equal(0);
    state.unknownCmdCount.should.equal(0);
  })
});

describe('stop', function() {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to stop', function (done) {
    var mySphero = getMockSphero();
    state.heading = 75;
    state.defaultSpeed = 35;
    state.speed = 35;

    execute(mySphero, [['stop']], function () {
      mySphero.roll.callCount.should.equal(2);
      mySphero.roll.calledWith(0,75).should.equal(true);
      state.speed.should.equal(0);
      state.heading.should.equal(75);
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

  it('should be able to flash the color', function (done) {
    var mySphero = getMockSphero();
    state.color = 0xffffff;

    execute(mySphero, [['flash', 'blue']], function () {
      mySphero.setColor.calledOnce.should.equal(true);
      mySphero.setColor.calledWith(0x0000ff).should.equal(true);
      setTimeout(function() {
        mySphero.setColor.calledTwice.should.equal(true);
        mySphero.setColor.calledWith(0xffffff).should.equal(true);
        state.color.should.equal(0xffffff);
        done();
      }, 600);
    });
  });

  it('should be able to pulse the color', function (done) {
    var mySphero = getMockSphero();
    state.color = 0xffffff;

    execute(mySphero, [['pulse', 'green']], function () {
      mySphero.setColor.calledOnce.should.equal(true);
      setTimeout(function() {
        mySphero.setColor.callCount.should.equal(18);
        mySphero.setColor.calledWith(0xffffff).should.equal(true);
        mySphero.setColor.calledWith(0x00ff00).should.equal(true);
        state.color.should.equal(0xffffff);
        done();
      }, 1100);
    });
  });
});

describe('wait', function() {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

/*
  it('should be able to wait 1 second', function (done) {
    var mySphero = getMockSphero();

    var now = Date.now();

    execute(mySphero, [['wait', 1]], function () {
      var now2 = Date.now();
      now2.should.be.above(now+1000);
      now2.should.not.be.above(now+1250); // 250ms wiggle room for other code execution time
      mySphero.roll.callCount.should.equal(1);
      done();
    });
  });
*/
});

describe('command aliases', function() {
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

describe('go', function() {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('should be able to go', function (done) {
    var mySphero = getMockSphero();
    state.heading = 75;
    state.defaultSpeed = 35;

    execute(mySphero, [['go']], function () {
      var now2 = Date.now();
      mySphero.roll.callCount.should.equal(2);
      state.speed.should.equal(35);
      state.heading.should.equal(75);
      done();
    });
  });

/*
  it('should be able to go for 2 seconds and stop', function (done) {
    var mySphero = getMockSphero();
    state.heading = 45;

    var now = Date.now();

    execute(mySphero, [['go', 2]], function () {
      var now2 = Date.now();
      now2.should.be.above(now+2000);
      now2.should.not.be.above(now+2250); // 250ms wiggle room for other code execution time
      mySphero.roll.callCount.should.equal(3);
      state.speed.should.equal(0);
      state.heading.should.equal(45);
      done();
    });
  });
*/
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
    setColor: sinon.stub()
  };

  return mySphero;
}
