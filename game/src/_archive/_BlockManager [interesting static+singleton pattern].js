// With this singleton pattern, static methods have to be added in the return of the singleton, rather than in the
const BlockManager = (function (g) {
  class BlockManager {
    constructor(g) {
      this.g = g;
    }

    update() {
      // ...
    }

    static destroyBlock() {
      console.log('Trying to destroy');
    }

    // Set value within class closure (read-only)
    // static get value() {
    //   return 123;
    // }

    // static set value(val) {}
  }

  // Set value outside of class closure (read/write)
  // BlockManager.value = 123;

  return BlockManager;
}());

// Singleton code
const Singleton = (function (g) {
  let instance;

  function createInstance(g) {
    const object = new BlockManager(g);

    return object;
  }

  const staticMethods = {
    getInstance: (g) => {
      if (!instance) {
        instance = createInstance(g);
      }

      return instance;
    },
  };

  const statics = Object.getOwnPropertyNames(BlockManager)
    .filter(prop => typeof BlockManager[prop] === 'function');

  statics.forEach(methodName => {
    staticMethods[methodName] = BlockManager[methodName];
  });

  return staticMethods;
}());

export default Singleton;
