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
      this.levelGraph = {};
    }

    createLevelGraph(fnCanMoveFromTo, lvlBlocksObj) {
      this._collectSolidBlocks(lvlBlocksObj);

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

        if (adjTiles.u.tileTypes === this.g.tileTypes.ladder) {
          console.log('dont process this node');
          continue;
        }

        graph[co.index] = {};
        //  These should all be tiles which are walkable.

        if (adjTiles.d.isStable) {
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.u)) {
            graph[co.index][adjTiles.u.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.d)) {
            graph[co.index][adjTiles.d.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.l)) {
            graph[co.index][adjTiles.l.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.r)) {
            graph[co.index][adjTiles.r.index] = 1;
          }
        } else if (!adjTiles.d.isStable) {
          graph[co.index][adjTiles.d.index] = 1;
        }
      }

      this.levelGraph = graph;
      console.log('Graph complete', this.levelGraph);
    }

    _collectSolidBlocks(lvlBlocksObj) {
      this.allowedBlockTypes.forEach(type => {
        if (lvlBlocksObj.hasOwnProperty(type)) {
          lvlBlocksObj[type].forEach(block => {
            this.solidBlocks.push(block);
          });
        }
      });
      console.log(this.solidBlocks);
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
