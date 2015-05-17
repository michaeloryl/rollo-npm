/**
 * Created with IntelliJ IDEA.
 * User: moryl
 * Date: 5/11/2015
 * Time: 8:59 AM
 */
var topics = {};
var hasOwnProperty = topics.hasOwnProperty;

module.exports.subscribe = function (topic, listener) {
  if (!hasOwnProperty.call(topics, topic)) {
    topics[topic] = [];
  }

  var index = topics[topic].push(listener) - 1;

  return {
    remove: function () {
      delete topics[topic][index];
    }
  };
};

module.exports.publish = function (topic, info) {
  if (!hasOwnProperty.call(topics, topic)) {
    return;
  }

  topics[topic].forEach(function (item) {
    item(info != undefined ? info : {});
  });
};
