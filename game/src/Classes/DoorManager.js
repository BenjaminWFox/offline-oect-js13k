// import Sounds from 'Classes/Sound';

// const sounds = new Sounds(Sounds.context);

const DoorManager = (function () {
  // const _collection = new WeakMap();

  class DoorManager {
    constructor(doorCollection) {
      // _collection.set(this, batteryCollection);
      this._array = doorCollection;
      this._total = this._array.length;
      this._hash = {};
      this._array.forEach((door, idx) => {
        this._disable(door);
        this._hash[door.index] = idx;
      });
    }

    checkForEntry(tileIdx) {
      const index = this._hash[tileIdx];

      // This is a funny example of truthy in javascript.
      // If you just check for `index` you will never be
      // able to collect `index` === 0, as it is falsy.
      if (!isNaN(index) && this.isActive(index)) {
        console.log('Entered a door!');

        return true;
      }

      return false;
    }

    _disable(door) {
      door.alpha = .25;
    }

    _enable(door) {
      door.alpha = 1;
    }

    setAllActive() {
      this._array.forEach(door => {
        this._enable(door);
      });
    }

    isActive(idx) {
      return this._array[idx].alpha === 1;
    }
  }

  return DoorManager;
}());

export default DoorManager;
