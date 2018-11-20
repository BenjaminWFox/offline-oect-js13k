import directions from 'Classes/Directions';
import BlockManager from 'Classes/BlockManager';

const Entity = (function () {
  // const _direction = new WeakMap();

  class Entity {
    constructor(moveSpeed, level, g) {
      this.sprite = level.sprites.player[0]; // TODO: Fix this. It won't work for enemies.
      this.moveSpeed = moveSpeed;
      this.dead = false;
      this.lastMove = Date.now();
      this.currentTile = g.getSpriteIndex(this.sprite);
      this.movement = {
        falling: BlockManager.getBlock(this.currentTile, directions.down).isStable,
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
