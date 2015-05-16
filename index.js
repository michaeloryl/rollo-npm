/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/11/15
 * Time: 9:13 PM
 */
var parse = require('./rolloLanguage').parse;
var execute = require('./rolloExec').execute;

module.exports.execute = execute;
module.exports.parse = parse;

module.exports.run = function(mySphero, source, callback) {
  var tree = parse(source);

  execute(mySphero, tree, callback);
};

