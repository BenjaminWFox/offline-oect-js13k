import Directions from 'Classes/Directions';

const BlockManager = (function (g) {
  class BlockManager {
    constructor(g) {
      console.log('Constructing BlockManager');
      this.g;
      if (g) {
        this.g = g;
      }
      this._fps = this.g._fps;
      this._blockHash = {};
      this._closingBlocks = [];
      this._destroyedBlocksHash = {};
      this._destroyedBlocksQueue = [];
      this._occupiedBlocks = {};
      this._fadeOutFrames = 15;
      this._fadeInFrames = 10;
      this._fadeOutMS = this._fadeOutFrames * (1000 / this._fps);
      this._fadeInMS = this._fadeInFrames * (1000 / this._fps);
      this._monitoredTypes = [
        g.tileTypes.floor,
        g.tileTypes.door,
        g.tileTypes.ladder,
      ];

      this.blocksObject = undefined;
      this.respawnTime = 3000;
    }

    updateSettings(settings) {
      this.respawnTime = settings.blockRespawnSpeed;
    }

    updateBlocks(enemyOccupations) {
      if (this._destroyedBlocksQueue.length) {
        const now = Date.now();

        if (now > this._destroyedBlocksQueue[0].destroyedAt + this.respawnTime) {
          this._restoreBlock(this._destroyedBlocksQueue[0].idx);
        }
      }
    }

    fillBlock(obj) {
      this._enemyInBlock(obj);
    }

    vacateBlock(obj) {
      this._enemyLeftBlock(obj);
    }

    setBlocks(blockSpritesObject) {
      this.blocksObject = this.blockArray ? this.blockArray : blockSpritesObject;
      this._monitoredTypes.forEach(type => {
        this.blocksObject[type].forEach(block => {
          this._blockHash[block.index] = block;
        });
      });
    }

    setBlockType(block, type) {
      block.name = type;
      block.type = type;
      // This can be used for an `onComplete = Fn` event if needed
      // let tween;

      switch (type) {
        case this.g.tileTypes.floor:
          this.g.fadeIn(block, this._fadeInFrames);
          block.isStable = true;
          this.g.wait(this._fadeInMS * .8, () => {
            this._makeStable(block);
            removeFromClosing.call(this, block.index);
          });
          break;
        case this.g.tileTypes.air:
          this.g.fadeOut(block, this._fadeOutFrames);
          this._makeUnstable(block);
          break;
        default:
          return false;
      }
      function removeFromClosing(idx) {
        this._closingBlocks.splice(this._closingBlocks.indexOf(idx), 1);
      }
    }

    _enemyInBlock(obj) {
      const block = this._getBlock(obj.occupiedBlock);

      if (block.type === this.g.tileTypes.air) {
        this._makeStable(block);
        console.log('Made block stable', block.index);
        this._occupiedBlocks[obj.id] = obj.occupiedBlock;
      }
    }

    _enemyLeftBlock(obj) {
      const block = this._getBlock(this._occupiedBlocks[obj.id]);

      if (block.type === this.g.tileTypes.air) {
        this._makeUnstable(block);
      }

      delete this._occupiedBlocks[obj.id];
    }

    get closingBlocks() {
      return this._closingBlocks;
    }

    _makeStable(block) {
      block.isStable = true;
    }

    _makeUnstable(block) {
      block.isStable = false;
    }

    _getBlock(idx, inDirection = undefined) {
      let idxToFind = idx;

      if (inDirection) {
        idxToFind = this.g.getAdjacentTile(idx, inDirection);
      }

      return this._blockHash[idxToFind] ? this._blockHash[idxToFind] : {index: idxToFind, isStable: false, type: undefined};
    }

    _getCardinalTilesData(getAdjacentTilesObject) {
      const returnObj = {};

      Object.keys(getAdjacentTilesObject).forEach(key => {
        returnObj[key] = this._getBlock(getAdjacentTilesObject[key]);
      });

      return returnObj;
    }

    _destroyBlock(fromTileIdx, dir) {
      const tileToDestroy = this._getBlock(fromTileIdx, dir);

      if (this._canDestroy(tileToDestroy)) {
        this.setBlockType(this._blockHash[tileToDestroy.index], this.g.tileTypes.air);
        this._addToDBTrackers(tileToDestroy.index);
      }
    }

    _canDestroy(tileMeta) {
      if (tileMeta.type === this.g.tileTypes.floor && !this._destroyedBlocksHash[tileMeta.index]) {
        if (this._getBlock(tileMeta.index, Directions.up).type !== this.g.tileTypes.floor) {
          return true;
        }
      }

      return false;
    }

    _restoreBlock(blockTileIdx) {
      this._closingBlocks.push(blockTileIdx);
      this.setBlockType(this._blockHash[blockTileIdx], this.g.tileTypes.floor);
      this._removeFromDBTrackers(blockTileIdx);
    }

    _addToDBTrackers(idx) {
      const obj = {idx, destroyedAt: Date.now()};

      this._destroyedBlocksHash[idx] = idx;
      this._destroyedBlocksQueue.push(obj);
    }

    _removeFromDBTrackers(idx) {
      delete this._destroyedBlocksHash[this._destroyedBlocksQueue.shift().idx];
    }

    _currentDestroyedBlocks() {
      return this._destroyedBlocksHash;
    }
  }

  return BlockManager;
}());

// Singleton code
const Singleton = (function (g) {
  let instance;

  function createInstance(g) {
    const object = new BlockManager(g);

    return object;
  }

  const staticMethods = {
    getInstance: (g) => {
      if (!instance) {
        instance = createInstance(g);
      }

      return instance;
    },
  };

  // Trigger instance method via static access
  if (!BlockManager['destroyBlock']) {
    staticMethods['destroyBlock'] = function (fromTileIdx, dir) {
      staticMethods.getInstance(g)._destroyBlock(fromTileIdx, dir);
    };
  }
  if (!BlockManager['getBlock']) {
    staticMethods['getBlock'] = function (tileIdx, dir = undefined) {
      return staticMethods.getInstance(g)._getBlock(tileIdx, dir);
    };
  }
  if (!BlockManager['currentDestroyedBlocks']) {
    staticMethods['currentDestroyedBlocks'] = function (tileIdx, dir = undefined) {
      return staticMethods.getInstance(g)._currentDestroyedBlocks();
    };
  }
  if (!BlockManager['getCardinalTilesData']) {
    staticMethods['getCardinalTilesData'] = function (getAdjacentTilesObject) {
      return staticMethods.getInstance(g)._getCardinalTilesData(getAdjacentTilesObject);
    };
  }

  return staticMethods;
}());

export default Singleton;
