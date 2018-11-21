import Graph from 'Classes/Graph';
import BlockManager from 'Classes/BlockManager';
import Entity from 'Classes/Entity';
import Directions from 'Classes/Directions';

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
      this.accessibleTiles = [];
      this.levelGraph = {};
      this._graph = undefined;
    }

    createLevelGraph(fnCanMoveFromTo, lvlBlocksObj) {
      this._collectSolidBlocks(lvlBlocksObj);
      this._findAccessibleBlocks(fnCanMoveFromTo);

      // Clone solidBlocks so it doesn't wind up empty
      let objects = this.solidBlocks.slice(0);

      // Replace all floor blocks with the tile above them
      // - unless they're at the top of the screen
      // - or are below another block;
      objects.forEach((sprite, idx) => {
        if (sprite.type === this.g.tileTypes.floor) {
          if (sprite.index >= this.g.world.widthInTiles) {
            const tileAbove = BlockManager.getBlock(this.g.getAdjacentTile(sprite.index, Directions.up));

            if (tileAbove.type !== this.g.tileTypes.floor && tileAbove.type !== this.g.tileTypes.ladder) {
              this.accessibleTiles.push(tileAbove.index);
            }
          }
        }
        if (sprite.type === this.g.tileTypes.ladder) {
          const tileAbove = BlockManager.getBlock(this.g.getAdjacentTile(sprite.index, Directions.up));

          this.accessibleTiles.push(sprite.index);

          if (tileAbove.type !== this.g.tileTypes.floor && tileAbove.type !== this.g.tileTypes.ladder) {
            this.accessibleTiles.push(tileAbove.index);
          }
        }
      });
      // const visitedNodes = [];

      const graph = {};
      // GRAPH: 45 ACCESSIBLE TILES ?

      // const childGraph = {};
      let adjTileIndexes;
      let adjTiles;

      objects = this.accessibleTiles.slice(0);

      while (objects.length) {
        const currentTileIndex = objects.shift();

        adjTileIndexes = this.g.getAdjacentTiles(currentTileIndex);
        adjTiles = BlockManager.getCardinalTilesData(adjTileIndexes);

        if (adjTiles.u.tileTypes === this.g.tileTypes.ladder) {
          console.log('dont process this node');
          continue;
        }

        graph[currentTileIndex] = {};
        //  These should all be tiles which are walkable.

        if (adjTiles.d.isStable) {
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.u)) {
            graph[currentTileIndex][adjTiles.u.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.d)) {
            graph[currentTileIndex][adjTiles.d.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.l)) {
            graph[currentTileIndex][adjTiles.l.index] = 1;
          }
          if (fnCanMoveFromTo(this.entityMock, adjTiles.c, adjTiles.r)) {
            graph[currentTileIndex][adjTiles.r.index] = 1;
          }
        } else if (!adjTiles.d.isStable) {
          graph[currentTileIndex][adjTiles.d.index] = 1;
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
