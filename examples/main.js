/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/7/15
 * Time: 7:48 PM
 */

var Rollo = require('rollo');

module.exports.main = function(my) {
  if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1].substr(process.argv[1].lastIndexOf('/')+1) + ' filename.rol');
    console.log('\nYou must specify the name of the Rollo script file.\n');
    process.exit(1);
  }

  var fileName = process.argv[2];

  Rollo.runFile(my.sphero, fileName, function () {
    console.log("ROLLO: Shutting down");
    process.exit(0);
  });
};

