
function destroyBlock(dir) {
  currentTile = g.getSpriteIndex(player);
  
  tileToDestroy = g.getAdjacentTile(currentTile, dir);

  spriteToDestroy = floors.find(el => {
    return el.index === tileToDestroy.index;
  })

  if(spriteToDestroy && spriteToDestroy.visible) {
    // spriteToDestroy.visible = !spriteToDestroy.visible;
    world.children[0].data[tileToDestroy.index] = 1;
    g.fadeOut(spriteToDestroy, 15);

    let blockData = {'sprite': spriteToDestroy, 'tile': tileToDestroy, 'time': Date.now()};
    blockHash[tileToDestroy.index] = blockData;
    destroyedBlockQueue.push(tileToDestroy.index);
  }
}

function fillBlock(indexInQueue) {
  blockIndex = destroyedBlockQueue[indexInQueue];
  holesWithEnemies.push(blockIndex);
  world.children[0].data[blockIndex] = 2;
}

function unfillBlock(blockIndex) {
  holesWithEnemies.splice(holesWithEnemies.indexOf(blockIndex), 1);
  if(destroyedBlockQueue.indexOf(blockIndex) !== -1) {
    world.children[0].data[blockIndex] = 1;    
  }
}

function respawnNextBlock() {
  let blockIndex = destroyedBlockQueue[0];
  destroyedBlockQueue.shift();
  blockObj = blockHash[blockIndex];
  let tween = g.fadeIn(blockObj.sprite, 6)
  tween.onComplete = function() {
    if(holesWithEnemies.indexOf(blockIndex) !== -1) {
      enemies.forEach(enemy => {
        if(enemy.inHole === blockIndex) {
          enemy.dead = true;
          unfillBlock(blockIndex);
          respawnEnemy(enemy);
        }
      })
    }
  };
  // blockObj.sprite.visible = true;
  world.children[0].data[blockObj.tile.index] = 2;
}

function respawnEnemy(eSprite) {
  eSprite.needsPath = true;
  eSprite.x = eSprite.spawnX;
  eSprite.y = eSprite.spawnY;
  eSprite.inHole = undefined;
  eSprite.movement = {
    falling: false,
    moving: false,
    stuck: false,
    stuckAt: undefined,
    direction: directions.still,
  }
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
  } else {
    sprite.movement.falling = false;
  }
}

function allowPlayerMoveAgain() {
  player.movement.moving = false;
}

function moveEnemy(enemy) {
  if(enemy.freshSpawn) {
    checkIfFalling(enemy);
    enemy.freshSpawn = false;
  }
  if(!enemy.movement.moving) {

    // Figure out if enemy needs path
    if(!enemy.movement.falling && enemy.needsPath) {
      // if(enemy.movement.stuck) {
      //   enemy.currentTile -= 32;
      // }
      enemy.pathData = dijkstra(enemy.currentTile, player.currentTile);
      enemy.needsPath = false;
    }
    if(!enemy.movement.falling && Date.now() - enemy.pathData.updated > config.pathUpdateFrequency) {
      enemy.needsPath = true;
    }

    // if(!nextTile && eSprite.pathData.distance !== Infinity) {
    //   eSprite.needsPath = true;
    // }

    let enemyDidMove = false;
    let nextTile = enemy.pathData.path ? enemy.pathData.path[1] : undefined;

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

  // if(!eSprite.movement.stuck) {
  //   if(!nextTile && eSprite.pathData.distance !== Infinity) {
  //     eSprite.needsPath = true;
  //   }
  //   checkIfFalling(eSprite);
  // }

  // if(!eSprite.movement.falling && !eSprite.movement.stuck) {
  // } else if(eSprite.movement.falling) {
  //   enemyMovedResult = moveOneTile(eSprite, currentTile, directions.down);
  //   if(enemyMovedResult.didMove) {
  //     eSprite.movement.falling = false;
  //     eSprite.movement.stuck = true;
  //     eSprite.movement.stuckAt = Date.now();
  //   }
  // } else if(eSprite.movement.stuck) {
  //   if(config.enemyUnstuckSpeed < Date.now() - eSprite.movement.stuckAt) {
  //     eSprite.movement.stuck = false;
  //     eSprite.movement.stuckAt = undefined;
      
  //     if(!nextTile) {
  //       nextTile = Math.random() < 0.5 ? currentTile + 1 : currentTile - 1;
  //     }

  //     enemyMovedResult = teleportTo(eSprite, nextTile);
  //     unfillBlock(currentTile);
  //     eSprite.inHole = undefined;
  //     eSprite.needsPath = true;
  //   }
  // }

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
    moveEnemy(enemy);

    // enemy.currentTile = g.getSpriteIndex(enemy);

    if(enemy.currentTile === player.currentTile) {
      console.log('DEV ONLY: You Died!');
      // player.dead = true;
      // setTimeout(function() {
      //   g.resume();
      //   g.state = lose
      // }, 1500);
      // g.pause();
    }

    // let holeNeedsFilling = destroyedBlockQueue.indexOf(enemy.currentTile);
    // let holeNeedsEmptying = holesWithEnemies.indexOf(enemy.currentTile);

    // if(holeNeedsFilling !== -1 && holeNeedsEmptying === -1) {
    //   enemy.inHole = enemy.currentTile;
    //   fillBlock(holeNeedsFilling);
    // }

    // // Enemy movement
    // if(!enemy.dead) {
    //   if(enemy.needsPath && !enemy.movement.falling) {
    //     if(enemy.movement.stuck) {
    //       enemy.currentTile -= 32;
    //     }
       
    //     // console.log(`Enemy ${enemy.id} running dijkstra`);
    //     enemy.pathData = dijkstra(enemy.currentTile, player.currentTile);
    //     enemy.needsPath = false;
    //   } else if(Date.now() - enemy.pathData.updated > config.pathUpdateFrequency) {
    //     enemy.needsPath = true;
    //   }
    //   if(!enemy.movement.moving) {
    //       enemyMoved = moveEnemy(enemy);
    //       if(enemyMoved) {
    //         enemy.movement.moving = true;
    //         g.wait(config.enemyMoveSpeed, function() {
    //           enemy.movement.moving = false;
    //         })
    //       }
    //   }
    // }
  })

  if (destroyedBlockQueue.length && Date.now() - blockHash[destroyedBlockQueue[0]].time > config.blockRespawnSpeed) {
    respawnNextBlock();
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