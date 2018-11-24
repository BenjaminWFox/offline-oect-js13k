import directions from 'Classes/Directions';
// import BlockManager from 'Classes/BlockManager';
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
      this._pathData = undefined;
      this.moveVariance = [0, 10, 20];
      this.moveSpeed = this.moveSpeed + getVariantMoveSpeed.call(this);
      this.unstuckSpeed = unstuckSpeed;

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

    _virtualRespawn() {
      super._virtualRespawn();
      console.log('The enemy: I am spawning!');
    }

    _updatePath(tileIdx) {
      const now = Date.now();

      if (!this._pathData || this._pathData.updated + this._pathUpdateFreq < now) {
        const refTile = this.state.stuck || this.state.extricating ? this.currentTile - 32 : this.currentTile;

        this._pathData = this.gm.graph.shortestPath(refTile, tileIdx);
        this._pathData.updated = now;
      }

      if (!this.dead && !this.state.stuck && this._pathData && this.lastMove + this.moveSpeed < now) {
        const indexes = this.state.extricating ?
          [this.currentTile, 1] :
          [this._pathData.path[0], 1];

        this._convertPathToDirection(indexes[0], this._pathData.path[indexes[1]]);
        this._pathData.path.shift();
      }
    }

    _convertPathToDirection(currentTile, nextTile) {
      const dir = currentTile - nextTile;

      if (this.state.extricating) {
        dir === 31 ? this.updateMovement(directions.upRight.code) : this.updateMovement(directions.upLeft.code);
      } else {
        // console.log('Other path dir', this.state);
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
  }

  return Enemey;
}());

export default Enemey;
