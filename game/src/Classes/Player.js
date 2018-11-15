import directions from 'Classes/Directions';

const Player = (function () {
  // const _direction = new WeakMap();

  class Player {
    constructor(moveSpeed, level, g) {
      this.sprite = level.sprites.player[0];
      this.moveSpeed = moveSpeed;
      this.dead = false;
      this.landingTile = undefined;
      this.lastMove = Date.now();
      this.currentTile = g.getSpriteIndex(this.sprite);
      this.movement = {
        falling: false,
        moving: false,
        direction: 'still',
      };

      // Player only
      this.hasStarted = false;
      this.won = false;

      // Assign all keypresses to player based off values in directions
      Object.entries(directions).forEach(pair => {
        // const key = pair[0];
        const value = pair[1];

        if (value.hasOwnProperty('code')) {
          g.key[value.key].press = () => {
            this.updateMovement(value.code);
          };
          g.key[value.key].release = () => {
            if (this.movement.direction === value.code) {
              this.updateMovement(directions.still);
            }
          };
        }
      });
    }

    updateMovement(dir) {
      // console.log('UPDATE MOVEMENT', dir);
      if (dir === directions.still) {
        this.movement.direction = directions.still;
        this.movement.moving = false;
      } else {
        this.movement.direction = dir;
        this.movement.moving = true;
      }
    }
  }

  return Player;
}());

export default Player;
