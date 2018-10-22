const Level = (function () {
  // const _privateInstanceNumber = new WeakMap();
  const _levelScene = new WeakMap();
  // const _privateNumberPrint = function (iM, sM) {
  //   console.log('Instance:', iM, 'Static:', sM);
  // };

  class Level {
    constructor(data, types, g) {
      this.spritesByType = {};

      const scene = g.group();

      console.log('Making a new level:', data);

      data.children.forEach(sprite => {
        console.log('ADDING SPRITE', sprite.name);
        delete sprite.parent;
        scene.addChild(sprite);

        this.categorizeSprite(sprite, types);
      });

      _levelScene.set(this, scene);
    }

    get scene() {
      return _levelScene.get(this);
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
