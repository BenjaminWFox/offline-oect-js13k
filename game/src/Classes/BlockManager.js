const BlockManager = (function (g) {
  class BlockManager {
    constructor(g) {
      this.g;
      if (g) {
        this.g = g;
      }
      this._blockHash = {};
      // this._destroyedBlocksQueue = [];
      this._destroyedBlocksHash = {};
      this._monitoredTypes = [
        g.tileTypes.floor,
        g.tileTypes.door,
        g.tileTypes.ladder,
      ];

      this.blocksObject = undefined;
      this.respawnTime = 3000;
      console.log('constructed BM', this.g);
    }

    updateSettings(settings) {
      this.respawnTime = settings.blockRespawnSpeed;
    }

    setBlocks(blockSpritesObject) {
      this.blocksObject = this.blockArray ? this.blockArray : blockSpritesObject;

      this._monitoredTypes.forEach(type => {
        this.blocksObject[type].forEach(block => {
          this._blockHash[block.index] = block;
        });
      });

      // console.log('Blocks are set', this.blockArray);
      console.log('Block hash is set', this._blockHash);
    }

    setBlockType(block, type) {
      block.name = type;
      block.type = type;

      switch (type) {
        case this.g.tileTypes.floor:
          block.visible = true;
          block.isStable = true;
          break;
        case this.g.tileTypes.air:
          block.visible = false;
          block.isStable = false;
          break;
        default:
          return false;
      }
    }

    _getBlock(idx, inDir = undefined) {
      let idxToFind = idx;

      if (inDir) {
        idxToFind = this.g.getAdjacentTile(idx, inDir);
      }

      return this._blockHash[idxToFind] ? this._blockHash[idxToFind] : {index: idxToFind, isStable: false, type: undefined};
    }

    _destroyBlock(fromTileIdx, dir) {
      const tileToDestroy = this._getBlock(fromTileIdx, dir);

      if (this._canDestroy(tileToDestroy)) {
        console.log('Destroying a tile!');

        this.setBlockType(this._blockHash[tileToDestroy.index], this.g.tileTypes.air);

        this._addIdxToHash(tileToDestroy.index);

        // this._addBlockToQueue();
        this.g.wait(this.respawnTime, () => {
          this._restoreBlock(tileToDestroy.index);
        });
      }
    }

    _canDestroy(tileMeta) {
      return tileMeta.type === this.g.tileTypes.floor && !this._destroyedBlocksHash[tileMeta.index];
    }

    _restoreBlock(blockTileIdx) {
      this.setBlockType(this._blockHash[blockTileIdx], this.g.tileTypes.floor);

      this._removeIdxFromHash(blockTileIdx);
    }

    _addIdxToHash(idx) {
      this._destroyedBlocksHash[idx] = idx;
    }

    _removeIdxFromHash(idx) {
      delete this._destroyedBlocksHash[idx];
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

  return staticMethods;
}());

export default Singleton;
