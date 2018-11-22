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
      this._pathUpdateFreq = pathUpdateFreq;
      this._isStuck = false;
      this._pathData = undefined;
      this.moveVariance = [0, 10, 20];
      this.moveSpeed = this.moveSpeed + getVariantMoveSpeed.call(this);
      this.unstuckSpeed = unstuckSpeed;
      this.isStuck = false;
      this.stuckAt = Date.now();

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
    }

    update(tileIdx) {
      const now = Date.now();

      if (!this.isStuck && BlockManager.currentDestroyedBlocks()[this.currentTile]) {
        this._makeStuck(now);
      }

      if (this.isStuck && this.stuckAt + this.unstuckSpeed < now) {
        this._makeUnstuck();
      }

      if (!this._pathData || this._pathData.updated + this._pathUpdateFreq < now) {
        this._pathData = this.gm.graph.shortestPath(this.currentTile, tileIdx);
        this._pathData.updated = now;
        // console.log('Have path data!', this._pathData, this.movement.direction);
      }

      if (this._pathData && this.lastMove + this.moveSpeed < now) {
        // console.log('Moving by path data');
        this._convertPathToDirection(this._pathData.path[0], this._pathData.path[1]);
        this._pathData.path.shift();
      }
    }

    _makeStuck(time) {
      this.isStuck = true;
      this.stuckAt = time;
      this.currentTile = this.currentTile - 32;

      console.log(this.stuckAt);
    }

    _makeUnstuck() {
      this.isStuck = false;
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
