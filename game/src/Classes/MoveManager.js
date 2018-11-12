import directions from 'Classes/Directions';

const MoveManager = (function () {
  const _settings = new WeakMap();

  class MoveManager {
    constructor(g) {
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

      if ((obj.movement.falling || obj.movement.direction !== directions.still) && obj.lastMove < now - obj.moveSpeed) {
        console.log('Moving object', obj.sprite.name);
        didMove = this.moveOneTile(obj);

        obj.lastMove = now;
        console.log('Did move?', didMove);
      }

      return didMove;
    }

    updateSettings(valuesObj) {
      this.settings = valuesObj;
    }

    get settings() {
      return _settings.get(MoveManager);
    }

    set settings(values) {
      _settings.set(MoveManager, values);
    }

    canMoveFromTo(obj, currentTile, destTile) {
      const dir = currentTile.index - destTile.index;

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
          if (destTile.type !== this.g.tileTypes.floor) {
            return true;
          }
          break;
        case 1:
          if (destTile.type !== this.g.tileTypes.floor) {
            return true;
          }
          break;
        default:
          return false;
      }
    }

    moveOneTile(obj) { // sprite, currentTileIndex, dir) {
      const moveDir = obj.movement.falling ? directions.down.code : obj.movement.direction;
      const currentTile = this.g.getAdjacentTile(obj.currentTile, directions.current);
      const moveToTile = this.g.getAdjacentTile(obj.currentTile, moveDir);

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

        if (this.isFalling(obj)) {
          console.log('falling');
          obj.movement.falling = true;
        } else {
          console.log('not falling');
          obj.movement.falling = false;
        }

        return true;
      }

      //  Prevent bug at bottom of map w/ infinite loop
      return false;
    }

    isFalling(obj) {
      const thisTile = this.g.getAdjacentTile(obj.currentTile, directions.current);
      const belowTile = this.g.getAdjacentTile(obj.currentTile, directions.down.code);

      if (thisTile.type !== this.g.tileTypes.ladder && !belowTile.isStable && belowTile.index) {// adjacentTiles.d.type === this.g.tileTypes.air) {
        //  sprite.movement.falling = true;
        return true;
      }

      //  sprite.movement.falling = false;
      return false;
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
