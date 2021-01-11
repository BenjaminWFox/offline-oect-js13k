import directions from 'Classes/Directions';
import BlockManager from 'Classes/BlockManager';

const MoveManager = (function () {
  const _settings = new WeakMap();

  class MoveManager {
    constructor(g) {
      console.log('Constructing MoveManager');
      this.g = g;
    }

    /**
     * The `move` method requires an object containing the necessary data to calculate movement, including direction and sprite.
     * @param  {Object} obj   either a Player or Enemy object to be moved.
     * @return {Boolean}      did the object move?
     */
    move(obj) {
      const now = Date.now();
      let didMove = false;

      if (
        obj.lastMove + obj.moveSpeed < now
        && !obj.dead
        && (obj.movement.falling || obj.movement.direction !== directions.still)
      ) {
        didMove = this.moveOneTile(obj);

        obj.lastMove = now;
      }

      if (!didMove && obj.killIfStuck && now > obj.lastMove + 2000) {
        if (this.isStuck(obj)) {
          obj.dead = true;
        } else {
          // console.log('Not stuck, just chillin');
        }
      }

      return didMove;
    }

    /**
     * a method interface for accessing the `settings` setter
     * @param  {Object} valuesObj  An object containing settings values from the Settings.js calss
     */
    updateSettings(valuesObj) {
      this.settings = valuesObj;
    }

    canMoveFromTo(obj, currentTile, destTile) {
      const dir = currentTile.index - destTile.index;

      if (obj.state.extricating) {
        if (dir === 33 || dir === 31) {
          return destTile.type !== this.g.tileTypes.floor;
        }

        return false;
      }

      switch (dir) {
        case 32:
          if (currentTile.type === this.g.tileTypes.ladder &&
            destTile.type !== this.g.tileTypes.floor) {
            return true;
          }
          break;
        case -32:
          if ((currentTile.type === this.g.tileTypes.ladder && destTile.type !== this.g.tileTypes.floor) ||
            (destTile.type === this.g.tileTypes.ladder) ||
            (obj.movement.falling)) {
            return true;
          }
          break;
        case -1:
          if (!obj.movement.falling && destTile.type !== this.g.tileTypes.floor) {
            return true;
          }
          break;
        case 1:
          if (!obj.movement.falling && destTile.type !== this.g.tileTypes.floor) {
            return true;
          }
          break;
        default:
          return false;
      }
    }

    moveOneTile(obj) {
      // Check if landed...
      if (this.isFalling(obj)) {
        // console.log('falling');
        obj.movement.falling = true;
      } else {
        // console.log('not falling');
        obj.movement.falling = false;
      }

      const moveDir = obj.movement.falling ? directions.down.code : obj.movement.direction;
      const currentTile = BlockManager.getBlock(obj.currentTile);
      const moveToTile = BlockManager.getBlock(obj.currentTile, moveDir);

      const canMove = this.canMoveFromTo(obj, currentTile, moveToTile);

      if (canMove) {
        const nextTileIndex = moveToTile.index;
        // const currentCoords = this.g.getTile(currentTileIndex, world.objects[0].data, world);
        const nextCoords = this.g.getTile(nextTileIndex, this.g.world.objects[0].data, this.g.world);

        const nextX = nextCoords.x;
        const nextY = nextCoords.y;

        obj.sprite.x = nextX;
        obj.sprite.y = nextY;
        obj.currentTile = nextTileIndex;

        // Check if stepped off edge...
        if (this.isFalling(obj)) {
        // console.log('falling');
          obj.movement.falling = true;
        } else {
        // console.log('not falling');
          obj.movement.falling = false;
        }

        return true;
      }

      //  Prevent bug at bottom of map w/ infinite loop
      return false;
    }

    isFalling(obj) {
      const thisTile = BlockManager.getBlock(obj.currentTile);
      const belowTile = BlockManager.getBlock(obj.currentTile, directions.down.code);

      if (!belowTile.isStable && belowTile.index && thisTile.type !== this.g.tileTypes.ladder && !thisTile.isStable) {// adjacentTiles.d.type === this.g.tileTypes.air) {
        return true;
      }

      return false;
    }

    isStuck(obj) {
      const l = BlockManager.getBlock(obj.currentTile, directions.left.code);
      const r = BlockManager.getBlock(obj.currentTile, directions.right.code);
      const d = BlockManager.getBlock(obj.currentTile, directions.down.code);

      if (l.type === this.g.tileTypes.floor && r.type === this.g.tileTypes.floor && d.type === this.g.tileTypes.floor) {
        // makePlayerDead();
        return true;
      }

      // player.lastMove = Date.now();
      return false;
    }

    /**
     * getter for private variable _settings
     * @return {Object} An object containing settings values stored for movement
     */
    get settings() {
      return _settings.get(MoveManager);
    }

    /**
     * setter for private variable _settings
     * @param  {Object} values  An object containing settings values from the Settings.js calss
     */
    set settings(values) {
      _settings.set(MoveManager, values);
    }
  }

  return MoveManager;
}());

// Singleton code
const Singleton = (function (g) {
  let instance;

  function createInstance(g) {
    const object = new MoveManager(g);

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
