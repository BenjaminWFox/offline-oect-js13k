import directions from 'Classes/Directions';
import BlockManager from 'Classes/BlockManager';
import Entity from 'Classes/Entity';

const Player = (function () {
  // const _direction = new WeakMap();

  class Player extends Entity {
    constructor(sprite, moveSpeed, g) {
      super(sprite, moveSpeed, g);

      // Player only
      this.landingTile = undefined;
      this.hasStarted = false;
      this.won = false;
      this.killIfStuck = true;

      // Assign all keypresses to player based off values in directions
      Object.entries(directions).forEach(pair => {
        // const key = pair[0];
        const value = pair[1];

        if (value.hasOwnProperty('code') && value['key']) {
          g.key[value.key].press = function () {
            // console.log('Player press...', value.key);
            if (!this.hasStarted) {
              this.hasStarted = true;
            }
            this.updateMovement(value.code);
          }.bind(this);
          g.key[value.key].release = function () {
            // console.log('Player UNpress...', value.key);
            if (this.movement.direction === value.code) {
              this.updateMovement(directions.still);
            }
          }.bind(this);
        }
      });

      const blastLine = (adjust) => {
        const line = g.line(
          'yellow',
          3,
          this.sprite.centerX + (10 * adjust),
          this.sprite.centerY,
          this.sprite.centerX + (27.5 * adjust),
          this.sprite.centerY + 15,
        );

        g.wait(35, () => {
          g.remove(line);
        });
      };

      g.key.a.press = function () {
        // console.log('CURRENT TILE!', this.currentTile);

        if (BlockManager.destroyBlock(this.currentTile, 'dl')) {
          blastLine(-1);
        }
      }.bind(this);

      g.key.d.press = function () {
        // console.log('CURRENT TILE!', this.currentTile);

        if (BlockManager.destroyBlock(this.currentTile, 'dr')) {
          blastLine(1);
        }
      }.bind(this);
    }

    _virtualRespawn() {
      // Do nothing here for player.
    }
  }

  return Player;
}());

export default Player;
