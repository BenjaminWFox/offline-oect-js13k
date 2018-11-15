import Sounds from 'Classes/Sound';

const sounds = new Sounds(Sounds.context);

const BatteryManager = (function () {
  // const _collection = new WeakMap();

  class BatteryManager {
    constructor(batteryCollection) {
      // _collection.set(this, batteryCollection);
      this._array = batteryCollection;
      this._total = this._array.length;
      this._collected = 0;
      this._hash = {};
      this._array.forEach((battery, idx) => {
        this._hash[battery.index] = idx;
      });
      this._allCollected = false;
    }

    checkForPickup(tileIdx) {
      const index = this._hash[tileIdx];

      // This is a funny example of truthy in javascript.
      // If you just check for `index` you will never be
      // able to collect `index` === 0, as it is falsy.
      if (!isNaN(index) && this.isBatteryVisible(index)) {
        console.log('Picked up a battery');
        sounds.battery();
        this.setInvisible(index);
        this.removeFromHash(tileIdx);
        this._collected++;

        if (this._collected === this._total) {
          console.log('All batteries collected!!');
          this._allCollected = true;
          sounds.doorOpen();
        }

        return true;
      }

      return false;
    }

    isBatteryVisible(idx) {
      // console.log('It was visible!');
      return this._array[idx].visible;
    }

    removeFromHash(tileIdx) {
      delete this._hash[tileIdx];
    }

    setInvisible(idx) {
      // console.log('Set invisible', idx);
      this._array[idx].visible = false;
    }

    get allCollected() {
      return this._allCollected;
    }
  }

  return BatteryManager;
}());

export default BatteryManager;
