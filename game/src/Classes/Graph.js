/** from: https:// github.com/mburst/dijkstras-algorithm/blob/master/dijkstras.js
 * Basic priority queue implementation. If a better priority queue is wanted/needed,
 * this code works with the implementation in google's closure library (https:// code.google.com/p/closure-library/).
 * Use goog.require('goog.structs.PriorityQueue'); and new goog.structs.PriorityQueue()
 */

import PriorityQueue from 'Classes/PriorityQueue';

// Pathfinding starts here
export default function Graph(vertices) {
  const INFINITY = 1 / 0;

  this.vertices = vertices;

  this.addVertex = function (name, edges) {
    this.vertices[name] = edges;
  };

  this.shortestPath = function (start, finish) {
    start = start.toString();
    finish = finish.toString();

    const nodes = new PriorityQueue();
    const distances = {};
    const previous = {};
    let path = [];
    let smallest;
    let vertex;
    let neighbor;
    let alt;

    for (vertex in this.vertices) {
      if (vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(0, vertex);
      } else {
        distances[vertex] = INFINITY;
        nodes.enqueue(INFINITY, vertex);
      }

      previous[vertex] = null;
    }

    nodes.sort();

    while (!nodes.isEmpty()) {
      smallest = nodes.dequeue();

      if (smallest === finish) {
        path = [];

        while (previous[smallest]) {
          path.push(Number(smallest));
          smallest = previous[smallest];
        }
        break;
      }

      // This is custom. In this game, at least, we can assume this means
      // that there is no connected path to the player.
      if (distances[smallest] === INFINITY && smallest === '0') {
        break;
      }

      if (!smallest || distances[smallest] === INFINITY) {
        continue;
      }

      for (neighbor in this.vertices[smallest]) {
        alt = distances[smallest] + this.vertices[smallest][neighbor];

        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;

          nodes.enqueue(alt, neighbor);
          nodes.sort();
        }
      }
    }

    return {
      path: path.concat([Number(start)]).reverse(),
      distance: path.length,
      updated: Date.now(),
    };
  };
}
