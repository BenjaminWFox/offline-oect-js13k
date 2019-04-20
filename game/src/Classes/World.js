import json from '../world.json';
import Level from 'Classes/Level';

const World = (function () {
  const _worldData = new WeakMap();
  const _levelData = new WeakMap();
  const _totalLevels = new WeakMap();
  const _renderedLevel = new WeakMap();

  class World {
    constructor(g) {
      console.log('World Constructor');
      this.levels = [];
      this.levelGroup = g.group();

      _worldData.set(this, g.makeTiledWorld(json, 'tileset.png'));

      if (this.data.children) {
        _levelData.set(this, this.data.children);

        _totalLevels.set(this, this.data.children.length);
      } else {
        throw new Error('Unexpected world format. Levels not found.');
      }

      this.buildLevels(g);
    }

    /**
     * Getter to read the raw worldData from makeTiledWorld
     * @return {Object} makeTiledWorld return object
     */
    get data() {
      return _worldData.get(this);
    }

    /**
     * Getter to read the raw levelData
     * @return {Object} levels object extracted from the worldData object
     */
    get levelData() {
      return _levelData.get(this);
    }

    /**
     * Returns the total number of levels
     * @return {Number} the number of levels
     */
    get totalLevels() {
      if (this.levels.length !== _totalLevels.get(this)) {
        return new Error(`Level data mismatch. Array length (${this.levels.length}) !== totalLevels (${_totalLevels.get(this)})`);
      }

      return this.levels.length;
    }

    get currentLevel() {
      return _renderedLevel.get(this);
    }

    level(levelNumber) {
      return this.levels[levelToIndex(levelNumber)];
    }

    buildLevels(g) {
      this.levelData.forEach(level => {
        const l = new Level(level, g);

        l.scene.visible = false;
        this.levels.push(l);
      });
    }

    renderLevel(levelNumber) {
      this.clearLevelGroup();

      const levelIdx = levelToIndex(levelNumber);

      this.levels[levelIdx].renderToGroup(this.levelGroup);

      _renderedLevel.set(this, this.levels[levelIdx]);
    }

    clearLevelGroup(levelNumber) {
      let spritesToRemove = this.levelGroup.children.length;

      while (spritesToRemove > 0) {
        const removeIndex = --spritesToRemove;

        this.levelGroup.removeChild(this.levelGroup.children[removeIndex]);
      }
    }

    checkForCompletedLevel(currentPlayerTile) {
      const levelComplete = this.currentLevel.doors.checkForEntry(currentPlayerTile);

      if (levelComplete) {
        return true;
      }
    }
  }

  /**
   * Converts a level number into the appropriate index to pull it from the levels array
   * @param  {Number} lvl A level number
   * @return {Number}     An index number
   */
  function levelToIndex(lvl) {
    return lvl - 1;
  }

  return World;
}());

export default World;
