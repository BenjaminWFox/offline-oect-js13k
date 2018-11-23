import directions from 'Classes/Directions';
import BlockManager from 'Classes/BlockManager';
import Entity from 'Classes/Entity';
import GraphManager from 'Classes/GraphManager';

const Enemey = (function () {
  // const _direction = new WeakMap();

  class Enemey extends Entity {
    constructor(sprite, moveSpeed, pathUpdateFreq, unstuckSpeed, g) {
      super(sprite, moveSpeed, g);

      this.gm = GraphManager.getInstance(g);
      this.id = uuidv4();
      this._pathUpdateFreq = pathUpdateFreq;
      this._isStuck = false;
      this._pathData = undefined;
      this._occupiedBlock = null;
      this.moveVariance = [0, 10, 20];
      this.moveSpeed = this.moveSpeed + getVariantMoveSpeed.call(this);
      this.unstuckSpeed = unstuckSpeed;

      this.state = {
        stuck: false,
        extricating: false,
        free: true,
      };
      this.states = {};
      Object.keys(this.state).forEach(key => {
        this.states[key] = key;
      });
      this.stateChangedAt = Date.now();

      function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function getVariantMoveSpeed() {
        const rndVariance = getRandomIntInclusive(0, this.moveVariance.length - 1);
        const rndAddDir = getRandomIntInclusive(0, 1) ? 1 : -1;

        return rndAddDir * this.moveVariance[rndVariance];
      }

      function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); // eslint-disable-line

          return v.toString(16);
        });
      }
    }

    get occupiedBlock() {
      return this._occupiedBlock;
    }

    update(pathDestIdx) {
      this._updatePath(pathDestIdx);
      this._checkForStateChange();
    }

    _updateState(state) {
      Object.keys(this.state).forEach(key => {
        this.state[key] = false;
      });
      this.state[state] = true;
      this.stateChangedAt = Date.now();
    }

    _checkForStateChange() {
      const now = Date.now();

      if (!this.state.stuck && BlockManager.currentDestroyedBlocks()[this.currentTile]) {
        this._makeStuck(now);
      }
      if (this.state.stuck && this.stateChangedAt + this.unstuckSpeed < now) {
        this._makeClimb(now);
      }
      if (this.state.extricating && this.stateChangedAt + this.moveSpeed < now) {
        this._makeFree(now);
      }
    }

    _updatePath(tileIdx) {
      const now = Date.now();

      if (!this._pathData || this._pathData.updated + this._pathUpdateFreq < now) {
        this._pathData = this.gm.graph.shortestPath(this.currentTile, tileIdx);
        this._pathData.updated = now;
      }

      if (this._pathData && this.lastMove + this.moveSpeed < now && !this.state.stuck) {
        // I don't think this needs to be used.
        // It was a way to assign the 2nd and 3rd indexes
        // if the enemy was not yet free of the hole.
        const indexes = this.state.free ? [0, 1] : [0, 1];

        this._convertPathToDirection(this._pathData.path[indexes[0]], this._pathData.path[indexes[1]]);
        this._pathData.path.shift();
      }

      // console.log('Path data', this._pathData.path);
    }

    _makeStuck(time) {
      console.log('Enemy Stuck');
      this._updateState(this.states.stuck);
      this._occupiedBlock = this.currentTile;
      // Set the current tile to one above for correct path calculation
      this.currentTile = this.currentTile - 32;
    }

    _makeClimb(time) {
      console.log('Enemy climbing out');
      this._updateState(this.states.extricating);
    }

    _makeFree(time) {
      console.log('Enemy free');
      this._updateState(this.states.free);
      this._occupiedBlock = null;
    }

    _convertPathToDirection(currentTile, nextTile) {
      const dir = currentTile - nextTile;

      switch (dir) {
        case 32:
          this.updateMovement(directions.up.code);
          break;
        case -32:
          this.updateMovement(directions.down.code);
          break;
        case 1:
          this.updateMovement(directions.left.code);
          break;
        case -1:
          this.updateMovement(directions.right.code);
          break;
        default:
          this.updateMovement(directions.still);
      }
    }
  }

  return Enemey;
}());

export default Enemey;
