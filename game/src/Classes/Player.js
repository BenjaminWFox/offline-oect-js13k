/* global g */
// Create and render player

class Player {
  constructor(sX, sY) {
    this.sprite = g.sprite({image: 'tileset.png', x: 128, y: 0, width: 32, height: 32});
    this.spawnX = sX;
    this.spawnY = sY;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.dead = false;
    this.won = false;
    this.hasStarted = false;
    this.landingTile = undefined;
    this.lastMove = Date.now();
    this.movement = {
      falling: false,
      moving: false,
      direction: undefined,
    };
    this.freshSpawn = true;
    this.currentTile = g.getSpriteIndex(this.sprite);
  }
}

export default Player;
