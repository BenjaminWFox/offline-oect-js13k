// Create and render player

class Player {
  constructor(sX, sY, gaInstance) {
    this.sprite = gaInstance.sprite({image: 'tileset.png', x: 128, y: 0, width: 32, height: 32});

    this.sprite.spawnX = sX;
    this.sprite.spawnY = sY;
    this.sprite.x = this.sprite.spawnX;
    this.sprite.y = this.sprite.spawnY;
    this.sprite.dead = false;
    this.sprite.won = false;
    this.sprite.hasStarted = false;
    this.sprite.landingTile = undefined;
    this.sprite.lastMove = Date.now();
    this.sprite.movement = {
      falling: false,
      moving: false,
      direction: 'still',
    };
    this.sprite.freshSpawn = true;
    this.sprite.currentTile = gaInstance.getSpriteIndex(this.sprite);
  }
}

export default Player;
