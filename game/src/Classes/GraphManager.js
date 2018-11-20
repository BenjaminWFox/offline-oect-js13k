const GraphManager = (function () {
  class GraphManager {
    constructor(g) {
      this.g = g;
      this.entityMock = {movement: {falling: false}};
      this.allowedBlockTypes = [
        g.tileTypes.floor,
        g.tileTypes.ladder,
      ];
      this.solidBlocks = [];
      this.levelGraph = {};
    }

    createLevelGraph(fnCanMoveFromTo, lvlBlocksObj) {
      const graph = {};

      this._collectSolidBlocks(lvlBlocksObj);

      //  There should be 48 tiles in the graph
      //  object[n].index is the unique ID for this tile.
      const objects = this.solidBlocks;
      const len = objects.length;

      // for (let i = 0; i < len; i++) {
      //   const co = objects[i];

      //   if (co.name !== 'level') {

      //     graph[co.index] = {};
      //     //  These should all be tiles which are walkable.
      //     const adjTiles = this.g.getAdjacentTiles(co.index);

      //     console.log('Have adjacent tiles!', adjTiles);
      //     if (adjTiles.d.isStable) {
      //       if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.u)) {
      //         graph[co.index][adjTiles.u.index] = 1;
      //       }
      //       if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.d)) {
      //         graph[co.index][adjTiles.d.index] = 1;
      //       }
      //       if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.l)) {
      //         graph[co.index][adjTiles.l.index] = 1;
      //       }
      //       if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.r)) {
      //         graph[co.index][adjTiles.r.index] = 1;
      //       }
      //     } else if (!adjTiles.d.isStable) {
      //       graph[co.index][adjTiles.d.index] = 1;
      //     }

      //   }
      // }

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
