/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/11/15
 * Time: 9:13 PM
 */
var parse = require('./rolloLanguage').parse;
var execute = require('./rolloExec').execute;
var fs = require('fs');

module.exports.execute = execute;
module.exports.parse = parse;
module.exports.run = run;
module.exports.runFile = runFile;

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

