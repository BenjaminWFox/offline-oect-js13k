import directions from 'Classes/Directions';
import BlockManager from 'Classes/BlockManager';

const Entity = (function () {
  // const _direction = new WeakMap();

  class Entity {
    constructor(sprite, moveSpeed, g) {
      this.sprite = sprite;
      this.moveSpeed = moveSpeed;
      this.dead = false;
      this.lastMove = Date.now();
      this.currentTile = this.sprite ? g.getSpriteIndex(this.sprite) : null;
      this.movement = {
        falling: this.currentTile ? !BlockManager.getBlock(this.currentTile, directions.down).isStable : false,
        moving: false,
        direction: 'still',
      };
    }

    updateMovement(dir) {
      // console.log('UPDATE MOVEMENT', dir);
      if (dir === directions.still) {
        this.movement.direction = directions.still;
        this.movement.moving = false;
      } else {
        this.movement.direction = dir;
        this.movement.moving = true;
      }
    }
  }

  return Entity;
}());

export default Entity;
