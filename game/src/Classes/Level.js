const Level = (function () {
  // const _privateInstanceNumber = new WeakMap();
  const _levelScene = new WeakMap();
  const _levelNumber = new WeakMap();
  // const _privateNumberPrint = function (iM, sM) {
  //   console.log('Instance:', iM, 'Static:', sM);
  // };

  class Level {
    constructor(data, g) {
      this.spritesByType = {};

      const scene = g.group();

      console.log('Making a new level:', data);

      data.children.forEach(sprite => {
        // addChild removes the child from its parent.
        // undesireable in this case, as the level data shouldn't be modified.
        delete sprite.parent;
        scene.addChild(sprite);

        this.categorizeSprite(sprite, g.tileTypes);
      });

      _levelScene.set(this, scene);
      _levelNumber.set(this, parseInt(data.name, 10));
    }

    get scene() {
      return _levelScene.get(this);
    }

    get number() {
      return _levelNumber.get(this);
    }

    categorizeSprite(sprite, types) {
      if (sprite.name) {
        const type = sprite.name;

        if (!types.hasOwnProperty(type)) {
          throw new Error(`Sprite type mismatch. [${type}] not found in types array.`);
        }

        if (!this.spritesByType.hasOwnProperty(type)) {
          this.spritesByType[type] = [];
        }

        this.spritesByType[type].push(sprite);
      }
    }
  }

  return Level;
}());

export default Level;
