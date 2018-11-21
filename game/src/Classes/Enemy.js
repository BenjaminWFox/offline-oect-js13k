import directions from 'Classes/Directions';
// import BlockManager from 'Classes/BlockManager';
import Entity from 'Classes/Entity';
import GraphManager from 'Classes/GraphManager';

const Enemey = (function () {
  // const _direction = new WeakMap();

  class Enemey extends Entity {
    constructor(sprite, moveSpeed, pathUpdateFreq, g) {
      super(sprite, moveSpeed, g);

      this.gm = GraphManager.getInstance(g);
      this._pathUpdateFreq = pathUpdateFreq;
      this._isStuck = false;
      this._pathData = undefined;
    }

    update(tileIdx) {
      const now = Date.now();

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
