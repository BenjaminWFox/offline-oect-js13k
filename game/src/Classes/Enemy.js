import directions from 'Classes/Directions';
import BlockManager from 'Classes/BlockManager';
import Entity from 'Classes/Entity';

const Enemey = (function () {
  // const _direction = new WeakMap();

  class Enemey extends Entity {
    constructor(moveSpeed, level, g) {
      super(moveSpeed, level, g);
    }
  }

  return Enemey;
}());

export default Enemey;
