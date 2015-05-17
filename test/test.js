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

describe('go', function() {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('Should be able to go', function (done) {
    var mySphero = getMockSphero();
    state.heading = 75;
    state.defaultSpeed = 35;

    state.speed.should.equal(0);

    execute(mySphero, [['go']], function () {
      var now2 = Date.now();
      mySphero.roll.callCount.should.equal(2);
      state.speed.should.equal(35);
      state.heading.should.equal(75);
      done();
    });
  });

  it('Should be able to go for 2 seconds and stop', function (done) {
    var mySphero = getMockSphero();
    state.heading = 45;

    var now = Date.now();

    execute(mySphero, [['go', 2]], function () {
      var now2 = Date.now();
      now2.should.be.above(now+1000);
      now2.should.not.be.above(now+2250); // 250ms wiggle room for other code execution time
      mySphero.roll.callCount.should.equal(3);
      state.speed.should.equal(0);
      state.heading.should.equal(45);
      done();
    });
  });
});

describe('turn', function () {
  var execute = require('../rolloExec').execute;
  var state = require('../rolloExec').state;

  it('Should be able to turn right with no parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['right']], function () {
      state.heading.should.equal(90);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('Should be able to turn right with a parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['right', 45]], function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('Should be able to turn left with no parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['left']], function () {
      state.heading.should.equal(270);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('Should be able to turn left with a parameter', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['left', 30]], function () {
      state.heading.should.equal(330);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('Should be able to turn negative degrees', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['turn', -90]], function () {
      state.heading.should.equal(270);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('Should be able to turn positive 45', function (done) {
    var mySphero = getMockSphero();
    state.heading = 0;

    execute(mySphero, [['turn', 45]], function () {
      state.heading.should.equal(45);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('Should be able to reverse heading', function (done) {
    var mySphero = getMockSphero();
    state.heading = 45;

    execute(mySphero, [['reverse']], function () {
      state.heading.should.equal(225);
      mySphero.roll.calledOnce.should.equal(false);
      done();
    });
  });

  it('Should be able to reverse heading and wrap degrees properly to 0 to 359', function (done) {
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

  it('Should be able to set various default speeds', function (done) {
    var mySphero = getMockSphero();

    execute(mySphero, [['speed', 10]], function () {
      state.defaultSpeed.should.equal(25);
      state.speed.should.equal(0);
      mySphero.roll.calledOnce.should.equal(true);
      done();
    });
  });

  it('Should be able to set various default speeds', function (done) {
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
    configureCollisionDetection: sinon.stub()
  };

  return mySphero;
}
