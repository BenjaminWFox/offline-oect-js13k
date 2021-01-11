import directions from 'Classes/Directions';
import BlockManager from 'Classes/BlockManager';

const Entity = (function () {
  // const _direction = new WeakMap();

  class Entity {
    constructor(sprite, moveSpeed, g) {
      this.g = g;
      this.sprite = sprite;
      this.moveSpeed = moveSpeed;
      this.dead = false;
      this.lastMove = Date.now();
      this._occupiedBlock = null;
      this.unstuckSpeed = 1320;
      this.currentTile = this.sprite ? g.getSpriteIndex(this.sprite) : null;
      this.movement = {
        falling: this.currentTile ? !BlockManager.getBlock(this.currentTile, directions.down).isStable : false,
        moving: false,
        direction: 'still',
      };

      this.spawnX = this.sprite ? this.sprite.x : null;
      this.spawnY = this.sprite ? this.sprite.y : null;
      this.spawnTile = this.currentTile;

      this.state = {
        stuck: false,
        extricating: false,
        free: true,
      };
      this.states = {};
      Object.keys(this.state).forEach(key => {
        this.states[key] = key;
      });
      this.stateChangedAt = Date.now();
    }

    updateMovement(dir) {
      if (dir === directions.still) {
        this.movement.direction = directions.still;
        this.movement.moving = false;
      } else {
        if (this.sprite.name === 'player') {
          console.log('UPDATE MOVEMENT', dir);
        }

        this.movement.direction = dir;
        this.movement.moving = true;
      }
    }

    makeDead() {
      // console.log('Entity: Dead!');
      const tween = this.g.fadeOut(this.sprite, 30);

      this.dead = true;
      this._makeFree();

      tween.onComplete = this._virtualRespawn.bind(this);
    }

    // This can be overwritten by the inheriting class.
    _virtualRespawn() {
      this._respawn();
    }

    _respawn() {
      // console.log('Entity: respawn');
      const tween = this.g.fadeIn(this.sprite, 120);

      this.sprite.x = this.spawnX;
      this.sprite.y = this.spawnY;
      this.currentTile = this.spawnTile;

      tween.onComplete = this._enable.bind(this);
    }

    _enable() {
      // console.log('Entity: Enabled');
      this.dead = false;
    }

    _updateState(state) {
      Object.keys(this.state).forEach(key => {
        this.state[key] = false;
      });
      this.state[state] = true;
      this.stateChangedAt = Date.now();
    }

    _checkForStateChange() {
      const now = Date.now();

      if (!this.dead) {
        if (!this.state.stuck && !this.state.extricating && BlockManager.currentDestroyedBlocks()[this.currentTile]) {
          this._makeStuck();
        }
        if (this.state.stuck && this.stateChangedAt + this.unstuckSpeed < now) {
          this._makeClimb();
        }
        if (this.state.extricating && this.stateChangedAt + this.moveSpeed < now && !BlockManager.currentDestroyedBlocks()[this.currentTile]) {
          this._makeFree();
        }
      }
    }

    _makeStuck() {
      // console.log('Entity: Stuck');
      this._updateState(this.states.stuck);
      this._occupiedBlock = this.currentTile;
      // Set the current tile to one above for correct path calculation
      // this.currentTile = this.currentTile - 32;
    }

    _makeClimb() {
      // console.log('Entity: Extricating');
      this._updateState(this.states.extricating);
    }

    _makeFree() {
      // console.log('Entity: Free');
      this._updateState(this.states.free);
      this._occupiedBlock = null;
    }
  }

  return Entity;
}());

export default Entity;
