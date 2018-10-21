import json from '../world.json';
// import tileset from '../tileset.png';

const World = (function () {
  const _worldData = new WeakMap();
  const _levelData = new WeakMap();

  class World {
    constructor(g) {
      _worldData.set(this, g.makeTiledWorld(json, 'tileset.png'));

      if (this.data.objects[0].name !== 'levels') {
        throw new Error('Unexpected world format. Levels not found.');
      } else {
        _levelData.set(this, this.data.objects[0].layers);
      }
    }

    get data() {
      return _worldData.get(this);
    }

    get levels() {
      return _levelData.get(this);
    }
  }

  return World;
}());

export default World;
