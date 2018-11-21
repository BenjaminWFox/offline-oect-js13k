import Graph from 'Classes/Graph';
import BlockManager from 'Classes/BlockManager';
import Entity from 'Classes/Entity';

const GraphManager = (function () {
  class GraphManager {
    constructor(g) {
      this.g = g;
      this.entityMock = new Entity(null);
      this.allowedBlockTypes = [
        g.tileTypes.floor,
        g.tileTypes.ladder,
      ];
      this.solidBlocks = [];
      this.accessibleBlocks = [];
      this.levelGraph = {};
      this._graph = undefined;
    }

    createLevelGraph(fnCanMoveFromTo, lvlBlocksObj) {
      this._collectSolidBlocks(lvlBlocksObj);
      this._findAccessibleBlocks(fnCanMoveFromTo);

      const objects = this.solidBlocks;
      // const visitedNodes = [];

      const graph = {};
      // const childGraph = {};
      let adjTileIndexes;
      let adjTiles;

      while (objects.length) {
        const co = objects.shift();
        const indexToFind = co.type === this.g.tileTypes.floor ? co.index - 32 : co.index;

        adjTileIndexes = this.g.getAdjacentTiles(indexToFind);
        adjTiles = BlockManager.getCardinalTilesData(adjTileIndexes);

        if (co.index === 582) {
          console.log('Below enemy');
        }

        if (adjTiles.u.tileTypes === this.g.tileTypes.ladder) {
          console.log('dont process this node');
          continue;
        }

        graph[indexToFind] = {};
        //  These should all be tiles which are walkable.

        if (adjTiles.d.isStable) {
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.u)) {
            graph[indexToFind][adjTiles.u.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.d)) {
            graph[indexToFind][adjTiles.d.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.l)) {
            graph[indexToFind][adjTiles.l.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.r)) {
            graph[indexToFind][adjTiles.r.index] = 1;
          }
        } else if (!adjTiles.d.isStable) {
          graph[indexToFind][adjTiles.d.index] = 1;
        }
      }

      this.levelGraph = graph;
      console.log('Graph complete', this.levelGraph);

      this._setGraph(this.levelGraph);
    }

    get graph() {

      return this._graph;
    }

    _setGraph(graph) {
      this._graph = new Graph(graph);

      console.log('GRAPH?', this._graph);
    }

    _findAccessibleBlocks(fnCanMoveFromTo) {
      this.solidBlocks.forEach(block => {
        // ...
      });
    }

    _collectSolidBlocks(lvlBlocksObj) {
      this.allowedBlockTypes.forEach(type => {
        if (lvlBlocksObj.hasOwnProperty(type)) {
          lvlBlocksObj[type].forEach(block => {
            this.solidBlocks.push(block);
          });
        }
      });
    }
  }

  return GraphManager;
}());

// Singleton code
const Singleton = (function (g) {
  let instance;

  function createInstance(g) {
    const object = new GraphManager(g);

    return object;
  }

  return {
    getInstance: (g) => {
      if (!instance) {
        instance = createInstance(g);
      }

      return instance;
    },
  };
}());

export default Singleton;
