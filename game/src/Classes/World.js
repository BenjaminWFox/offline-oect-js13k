import json from '../world.json';
import Level from 'Classes/Level';

const World = (function () {
  const _worldData = new WeakMap();
  const _levelData = new WeakMap();
  const _totalLevels = new WeakMap();

  class World {
    constructor(g) {
      console.log('World Constructor');
      this.levels = [];
      this.levelGroup = g.group();
      // this.g = g;

      _worldData.set(this, g.makeTiledWorld(json, 'tileset.png'));

      if (this.data.children) {
        _levelData.set(this, this.data.children);

        _totalLevels.set(this, this.data.children.length);
      } else {
        throw new Error('Unexpected world format. Levels not found.');
      }
    }

    get data() {
      return _worldData.get(this);
    }

    get levelData() {
      return _levelData.get(this);
    }

    get totalLevels() {
      return _totalLevels.get(this);
    }

    buildLevels(g) {
      console.log('buildLevels');
      this.levelData.forEach(level => {
        const l = new Level(level, g);

        l.scene.visible = false;
        this.levels.push(l);
      });
    }

    renderLevel(levelNumber) {
      const levelIdx = levelNumber - 1;

      console.log(this.levelData);

      this.levels[levelIdx].renderToGroup(this.levelGroup);
    }
  }

  return World;
}());

export default World;
