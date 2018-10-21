import json from '../world.json';
import tileset from '../tileset.png';

const World = (function () {
  // console.log('starting iife', g);
  // const _privateInstanceNumber = new WeakMap();
  const _worldData = new WeakMap();
  // const _privateNumberPrint = function (iM, sM) {
  //   console.log('Instance:', iM, 'Static:', sM);
  // };

  class World {
    constructor(g) {
      console.log('Constructing world w/ ga instance:', g);
      // console.log('Frame ID:', Frame.frames);
      const tiledWorld = g.makeTiledWorld(json, tileset);

      console.log('Have tiled world', tiledWorld);
      _worldData.set(this, tiledWorld);
      // console.log('Instance:', _privateInstanceNumber.get(this));
      // _privateStaticNumber.set(Frame, Math.random() * 4);
      // console.log('Static:', _privateStaticNumber.get(Frame));
    }

    // /* eslint-disable */
    // get privateInstanceNumber() {
    //   return _privateInstanceNumber.get(this);
    // }
    get data() {
      return _worldData.get(this);
    }
    // printPrivateNumbers() {
    //   _privateNumberPrint(this.privateInstanceNumber, Frame.privateStaticNumber);
    //   // _privateNumberPrint(_privateInstanceNumber.get(this), _privateStaticNumber.get(Frame));
    // }
    // /* eslint-enable */
  }

  // static property
  World.number = 0;

  return World;
}());

export default World;
