import Level from 'Classes/Level';

import json from '../world.json';
// import tileset from '../tileset.png';

const World = (function () {
  const _worldData = new WeakMap();
  const _levelData = new WeakMap();
  const _levels = new WeakMap();

  class World {
    constructor(g) {
      _worldData.set(this, g.makeTiledWorld(json, 'tileset.png'));

      if (this.data.children) {
        _levelData.set(this, this.data.children);

        _levels.set(this, this.data.children.length);
      } else {
        throw new Error('Unexpected world format. Levels not found.');
      }

      console.log('World created', this.data);

      const l1 = new Level(this.levelData[0], g.tileTypes, g);

      console.log(l1, l1.spritesByType);

      // l1.organizeSpritesByType(this.data.tileTypes);
    }

    get data() {
      return _worldData.get(this);
    }

    get levelData() {
      return _levelData.get(this);
    }

    get levels() {
      return _levels.get(this);
    }
  }

  return World;
}());

export default World;
