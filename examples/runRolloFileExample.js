var Cylon = require('cylon');
var myMainApp = require('./main.js').main;

Cylon.robot({
  connections: {
    sphero: {adaptor: 'sphero', port: '/dev/tty.Sphero-ROB-AMP-SPP'}
  },

  devices: {
    sphero: {driver: 'sphero'}
  },

  work: myMainApp

}).start();

