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

      g.key.a.press = function () {
        // console.log('CURRENT TILE!', this.currentTile);
        BlockManager.destroyBlock(this.currentTile, 'dl');
      }.bind(this);

      g.key.d.press = function () {
        // console.log('CURRENT TILE!', this.currentTile);
        BlockManager.destroyBlock(this.currentTile, 'dr');
      }.bind(this);
    }

    _virtualRespawn() {
      // Do nothing here for player.
    }

  }

  return Player;
}());

export default Player;
