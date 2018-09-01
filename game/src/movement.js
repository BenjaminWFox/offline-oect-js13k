
function destroyBlock(dir) {
  currentTile = g.getSpriteIndex(player);
  
  tileToDestroy = g.getAdjacentTile(currentTile, dir);
  // don't allow destroying the same block if it's already destroyed
  if(!destroyedBlocks.hash[tileToDestroy.index]) {
    spriteToDestroy = floors.find(el => {
      return el.index === tileToDestroy.index;
    })

    if(spriteToDestroy && spriteToDestroy.visible) {
      // Change the block type to air:
      world.children[0].data[tileToDestroy.index] = 1;
      // fade out the block:
      g.fadeOut(spriteToDestroy, 15);
      // store relevant data for the destroyed block:
      let blockData = {
        sprite: spriteToDestroy,
        tile: tileToDestroy,
        time: Date.now(),
        occupy: function() {
          world.children[0].data[this.tile.index] = 2;
        },
        vacate: function() {
          world.children[0].data[this.tile.index] = 1;
        },
      };
      addDestroyedBlock(blockData);
    }
  }
}

function respawnNextBlock() {
  let blockIndex = destroyedBlocks.queue[0];
  let blockData = destroyedBlocks.hash[blockIndex];
  if(blockIndex === player.currentTile) {
    player.dead = true;
    setTimeout(function() {
      g.resume();
      g.state = lose
    }, 1500);
    g.pause();
  }
  removeDestroyBlock(blockData);
  world.children[0].data[blockData.tile.index] = 2;
  let tween = g.fadeIn(blockData.sprite, 6)
}

function addDestroyedBlock(bData) {
  // add the block data to easily accessible hash
  destroyedBlocks.hash[bData.tile.index] = bData;
  // add the block index to a queue to track respawn
  destroyedBlocks.queue.push(bData.tile.index);
}

function removeDestroyBlock(bData) {
  // shift block index from the queue, delete it from the hash
  delete destroyedBlocks.hash[destroyedBlocks.queue.shift()];
}

function respawnEnemy(eSprite) {
  eSprite.needsPath = true;
  eSprite.x = eSprite.spawnX;
  eSprite.y = eSprite.spawnY;
  eSprite.currentTile = g.getSpriteIndex(eSprite);
  eSprite.inHoleRef = undefined;
  eSprite.freshSpawn = true;
  eSprite.movement = {
    falling: false,
    moving: false,
    stuck: false,
    stuckAt: undefined,
    direction: directions.still,
  }
  eSprite.pathData = {
    path: null,
    updated: null,
    distance: null,
  }
  setTimeout(function(){
    eSprite.visible = true;
  }, 250);
  setTimeout(function(){
    eSprite.dead = false;
  }, 1000);
}

function canMoveFromTo(sprite, currentTile, destTile) {
  let dir = currentTile.index - destTile.index;
  switch(dir) {
    case 32:
      if(destTile.type && 
        currentTile.type === g.tileTypes.ladder && 
        destTile.type !== g.tileTypes.floor) {
        return true;
      }
    break;
    case -32:
      if(destTile.type && currentTile.type === g.tileTypes.ladder && destTile.type !== g.tileTypes.floor || 
        destTile.type && destTile.type === g.tileTypes.ladder ||
        destTile.type && sprite.movement.falling) {
        return true;
      }
    break;
    case -1:
      if(destTile.type && destTile.type !== g.tileTypes.floor) {
        return true;
      }
    break;
    case 1:
      if(destTile.type && destTile.type !== g.tileTypes.floor) {
        return true;
      }
    break;
    default:
      return false;
    break;
  }
}

function moveOneTile(sprite, currentTileIndex, dir) {
  // let adjacentTiles = g.getAdjacentTiles(currentTileIndex);
  let currentTile = g.getAdjacentTile(sprite.currentTile, directions.current);
  let moveToTile = g.getAdjacentTile(sprite.currentTile, dir);

  canMove = canMoveFromTo(sprite, currentTile, moveToTile);

  if(canMove) {
    let nextTileIndex = moveToTile.index;
    let currentCoords = g.getTile(currentTileIndex, world.objects[0].data, world);
    let nextCoords = g.getTile(nextTileIndex, world.objects[0].data, world);
    nextX = nextCoords.x;
    nextY = nextCoords.y;
    sprite.x = nextX;
    sprite.y = nextY;
    sprite.currentTile = nextTileIndex;
    checkIfFalling(sprite);
    return true;
  }
  // Prevent bug at bottom of map w/ infinite loop
  sprite.movement.falling = false;
  return false;
}

function teleportTo(sprite, tile) {
    nextCoords = g.getTile(tile, world.objects[0].data, world);
    nextX = nextCoords.x;
    nextY = nextCoords.y;
    sprite.x = nextX;
    sprite.y = nextY;
    return true;
}

function checkIfFalling(sprite) {
  thisTile = g.getAdjacentTile(sprite.currentTile, directions.current);
  belowTile = g.getAdjacentTile(sprite.currentTile, directions.down);

  if(thisTile.type !== g.tileTypes.ladder && !belowTile.isStable) {//adjacentTiles.d.type === g.tileTypes.air) {
    sprite.movement.falling = true;
    return true;
  } else {
    sprite.movement.falling = false;
    return false;
  }
}

function allowPlayerMoveAgain() {
  player.movement.moving = false;
}

function checkForPlayerKill(enemy){
  if(enemy.currentTile === player.currentTile) {
  // console.log('DEV ONLY: You Died!');
  // player.dead = true;
  // setTimeout(function() {
  //   g.resume();
  //   g.state = lose
  // }, 1500);
  // g.pause();
  }
}

function checkForFallenIntoBlock(enemy) {
  let occupiedBlock = destroyedBlocks.hash[enemy.currentTile];
  if(occupiedBlock) {
    // console.log('Stuck and occupied');
    enemy.makeStuck(occupiedBlock);
    occupiedBlock.occupy();
  }
}

function getOutOfHole(enemy) {
  console.log(`Enemy ${enemy.id} trying to get out of hole.`);
  if(destroyedBlocks.hash[enemy.inHoleRef.tile.index]) {
    console.log(`Enemy ${enemy.id} out of hole.`);
    enemy.inHoleRef.vacate();
    enemy.unStick();
  } else {
    console.log(`Enemy ${enemy.id} has died.`);
    enemy.dead = true;
    enemy.visible = false;
    respawnEnemy(enemy);
  }
}

function moveEnemy(enemy) {
  if(enemy.freshSpawn) {
    checkIfFalling(enemy);
    enemy.freshSpawn = false;
  }
  // Enemy could be:
  // moving
  // stuck
  // falling
  // not moving
  // Everything happens in !moving, to save resources
  if(!enemy.movement.moving) {
    // Make sure we're not falling now...
    // Figure out if enemy needs path
    if(!enemy.movement.falling && enemy.needsPath) {
      if(enemy.movement.stuck) {
        enemy.currentTile -= 32;
      }
      enemy.pathData = dijkstra(enemy.currentTile, player.currentTile);
      enemy.needsPath = false;
    }
    if(!enemy.movement.falling && Date.now() - enemy.pathData.updated > config.pathUpdateFrequency) {
      enemy.needsPath = true;
    }

    if (enemy.movement.stuck) {
      if(Date.now() - enemy.movement.stuckAt > config.enemyUnstuckSpeed) {
        getOutOfHole(enemy);
      }
    }

    // if(!nextTile && eSprite.pathData.distance !== Infinity) {
    //   eSprite.needsPath = true;
    // }

    let enemyDidMove = false;
    let nextTile = enemy.pathData.path ? enemy.pathData.path[1] : undefined;

    if(!enemy.movement.stuck) {
      if(enemy.movement.falling) {
        enemyDidMove = moveOneTile(enemy, enemy.currentTile, directions.down);
      } else if (nextTile) {
        enemy.movement.direction = getEnemyMoveDir(enemy.currentTile, nextTile);
        enemyDidMove = moveOneTile(enemy, enemy.currentTile, enemy.movement.direction);
      }

      if(enemyDidMove) {
        !enemy.movement.falling && enemy.pathData.path ? enemy.pathData.path.shift() : '';
        
        enemy.movement.moving = true;
        g.wait(config.enemyMoveSpeed, enemy.allowMoveAgain);
      }
    }
    if(!enemy.movement.stuck) {
      checkIfFalling(enemy);
    }
  }

  function getEnemyMoveDir(cT, nT) {
    if(nT < cT) {
      // moving l/u
      if(nT + 1 === cT) {
        return directions.left;
      } else {
        return directions.up;
      }
    } else if (nT > cT) {
      // moving r/d
      if(nT - 1 === cT) {
        return directions.right;
      } else {
        return directions.down;      
      }
    }
  }

}

function movePlayer() {
  if(player.freshSpawn) {
    checkIfFalling(player);
    player.freshSpawn = false;
  }
  if(!player.movement.moving) {
    let playerDidMove;

    if(player.movement.falling) {
      playerDidMove = moveOneTile(player, player.currentTile, directions.down);
    } else if (player.movement.direction !== directions.still) {
      playerDidMove = moveOneTile(player, player.currentTile, player.movement.direction);
    }


    if(playerDidMove) {
      player.movement.moving = true;
      g.wait(config.playerMoveSpeed, allowPlayerMoveAgain);
    }
  }
}

//The `play` state
function play() {
  // player.currentTile will need setting.
  movePlayer();
  
  checkForBatteryPickup();
  checkForExitWin();


  enemies.forEach(enemy => {
    if(!enemy.dead) {
      // console.log(`Cycling for enemy ${enemy.id}`)
      moveEnemy(enemy);
      checkForPlayerKill(enemy);
      if(!enemy.movement.stuck) {
        checkForFallenIntoBlock(enemy);
      }
    }
  })

  checkForBlockRespawn();
}

function checkForBlockRespawn() {
  try {
    if (destroyedBlocks.queue.length && Date.now() - destroyedBlocks.hash[destroyedBlocks.queue[0]].time > config.blockRespawnSpeed) {
      respawnNextBlock();
    }
  } catch (err) {
    console.log('Block respawn error', err)
    console.log('Queue length', destroyedBlocks.queue.length);
    console.log('Queue', destroyedBlocks.queue);
    console.log('Hash', destroyedBlocks.hash);
  }
}

function checkForBatteryPickup() {
  if(batteryHash[player.currentTile] && batteryHash[player.currentTile].visible) {
    batteryHash[player.currentTile].visible = false;
    collectedBatteries++;
    console.log('COLLECTED A BATTERY');
    if(totalBatteries === collectedBatteries) {
      doorsOpen();
      console.log('ALL BATTERIES GOTTEN');
    }
  }
}

function checkForExitWin() {
  if(exitHash[player.currentTile] && exitHash[player.currentTile].canUse) {
    console.log('DEV ONLY: You Won!')
    // g.state = win;
  }
}