/** from: https:// github.com/mburst/dijkstras-algorithm/blob/master/dijkstras.js
 * Basic priority queue implementation. If a better priority queue is wanted/needed,
 * this code works with the implementation in google's closure library (https:// code.google.com/p/closure-library/).
 * Use goog.require('goog.structs.PriorityQueue'); and new goog.structs.PriorityQueue()
 */

const PriorityQueue = function () {
  this._nodes = [];

  this.enqueue = function (priority, key) {
    this._nodes.push({
      key,
      priority,
    });
  };
  this.dequeue = function () {
    return this._nodes.shift().key;
  };
  this.sort = function () {
    this._nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  };
  this.isEmpty = function () {
    return !this._nodes.length;
  };
};

export default PriorityQueue;
