//All of your game code will go here
 var g = ga(
  1024, 768, setup,
  [
    'world.json',
    'tileset.png',
  ]
);
/***********************************************************************************
General TODO List:

-- Implement level-end mechanic (direction UP @ door)

-- Add enemies

-- Add sounds

***********************************************************************************/

var config = {
  playerMoveSpeed: 150,
  enemyMoveSpeed: 250,
  blockRespawnSpeed: 2000,
  pathUpdateFrequency: 2000,
  enemyUnstuckSpeed: undefined, //see below
}
config.enemyUnstuckSpeed = config.blockRespawnSpeed / 2;

//Start the Ga engine
g.start();
//Declare your global variables (global to this game)
var dungeon, player, treasure, enemies, chimes, exit,
    healthBar, message, gameScene, gameOverScene;
destroyedBlockQueue = [];
holesWithEnemies = [];
blockHash = {}
enemies = [];

//The `setup` function will run only once.
//Use it for initialization tasks
function setup() {
  //Set the canvas border and background color
  g.canvas.style.border = "none";
  g.backgroundColor = "black";

  world = g.makeTiledWorld('world.json', 'tileset.png');

  //Create the `gameScene` group
  gameScene = g.group();

  // Create reference to level tiles
  exit = world.getObject(g.tileTypes.door);
  // airs = world.getObjects(g.tileTypes.air);
  floors = world.getObjects(g.tileTypes.floor);
  ladders = world.getObjects(g.tileTypes.ladder);
  batteries = world.getObjects(g.tileTypes.battery);

  // Render level tiles
  floors.forEach(floor => {
    gameScene.addChild(floor);
  })
  batteries.forEach(battery => {
    gameScene.addChild(battery);
  })
  // airs.forEach(air => {
  //   gameScene.addChild(air);
  // })
  ladders.forEach(ladder => {
    gameScene.addChild(ladder);
  })

  pointer = g.pointer;

  pointer.press = function() {
    const index = g.getIndex(pointer.centerX, pointer.centerY, 32, 32, 32);
    const currentCoords = g.getTile(index, world.objects[0].data, world);
    console.log(index, currentCoords.x, currentCoords.y);
  }

  //Left arrow key `press` method
  directions = {
    up: 'u',
    down: 'd',
    left: 'l',
    right: 'r',
    still: 'still',
  }

  // movement = {
  //   falling: false,
  //   moving: false,
  //   direction: directions.still,
  // }

  // Create and render player
  player = g.sprite({image: "tileset.png", x: 128, y: 0, width: 32, height: 32})
  // player.x = 320;
  // player.y = 608;
  player.spawnX = 576;
  player.spawnY = 704;
  player.x = player.spawnX;
  player.y = player.spawnY;
  player.movement = {
    falling: false,
    moving: false,
    direction: directions.still,
  }
  gameScene.addChild(player);

  function makeEnemy(sX, sY, id) {
    let enemy = g.sprite({image: "tileset.png", x: 160, y: 0, width: 32, height: 32})
    enemy.spawnX = sX;
    enemy.spawnY = sY;
    enemy.x = enemy.spawnX;
    enemy.y = enemy.spawnY;
    enemy.id = id;
    enemy.movement = {
      falling: false,
      moving: false,
      stuck: false,
      stuckAt: undefined,
      direction: directions.still,
    }
    currentTile = undefined;
    enemy.dead = false;
    enemy.inHole = undefined;
    enemy.needsPath = true;
    enemy.pathData = {
      path: null,
      updated: null,
    }
    return enemy;
  }

  enemies.push(makeEnemy(608, 704, 1));
  enemies.push(makeEnemy(576, 544, 2));
  // enemies.push(makeEnemy(224, 608));

  enemies.forEach(enemy => {
    gameScene.addChild(enemy);
  })

/******************* GRAPHING AND dijkstra ************************/
  levelGraph = makeLevelGraph();

  const lowestCostNode = (costs, processed) => {
    return Object.keys(costs).reduce((lowest, node) => {
      if (lowest === null || costs[node] < costs[lowest]) {
        if (!processed.includes(node)) {
          lowest = node;
        }
      }
      return lowest;
    }, null);
  };

  // function that returns the minimum cost and path to reach Finish
  dijkstra = (start, finish) => {
    if(start === finish) {
      return {
        distance: 0,
        path: [start, finish],
      };
    }
    graph = levelGraph;

    graph.start = graph[start];
    // track lowest cost to reach each node
    const costs = Object.assign({}, graph.start);
    costs[finish] = Infinity;

    if(graph.start[finish]) {
      costs[finish] = 1;
    }

    // track paths
    const parents = {finish: null};
    for (let child in graph.start) {
      parents[child] = 'start';
    } 

    // track nodes that have already been processed
    const processed = [];

    let node = lowestCostNode(costs, processed);

    while (node) {
      let cost = costs[node];
      let children = graph[node];
      for (let n in children) {
        let newCost = cost + children[n];
        if (!costs[n]) {
          costs[n] = newCost;
          parents[n] = node;
        }
        if (costs[n] > newCost) {
          costs[n] = newCost;
          parents[n] = node;
        }
      }
      processed.push(node);
      node = lowestCostNode(costs, processed);
    }

    /* Log here */

    let optimalPath = [finish];
    let parent = parents[finish];

    while (parent) {
      if(parent !== 'start')
        optimalPath.push(Number(parent));
      else
        optimalPath.push(parent);
      parent = parents[parent];
    }
    optimalPath.reverse();
    optimalPath[0] = start; // assign the numeric current tile
    const results = {
      distance: costs[finish],
      path: optimalPath
    };

    return results;
  };

  function makeLevelGraph() {
    const graph = {};

    // There should be 48 tiles in the graph
    // object[n].index is the unique ID for this tile.
    objects = world.objects;

    for(let i = 1, len = objects.length; i < objects.length; i++) {
      let co = objects[i]
      if(co.name !== g.tileTypes.floor) {
        // Can re-enable this to omit some tiles from the graph.
        // But currently causes some undefined issues.
        // ruleOut = {current: g.getAdjacentTile(co.index, 'c'), below: g.getAdjacentTile(co.index, 'd')}

        if(1 === 2) {// ruleOut.current.type !== g.tileTypes.ladder && !ruleOut.below.isStable) {
          // skip
        } else {
          graph[co.index] = {};
          // These should all be tiles which are walkable.
          adjTiles = g.getAdjacentTiles(co.index);
          if(canMoveInDirection(player, adjTiles, directions.up)) {
            graph[co.index][adjTiles.u.index] = 1;
          }
          if(canMoveInDirection(player, adjTiles, directions.down)) {
            graph[co.index][adjTiles.d.index] = 1;
          }
          if(canMoveInDirection(player, adjTiles, directions.left)) {
            graph[co.index][adjTiles.l.index] = 1;
          }
          if(canMoveInDirection(player, adjTiles, directions.right)) {
            graph[co.index][adjTiles.r.index] = 1;
          }
        }
      }
    }

    return graph;
  }
/******************* GRAPHING AND dijkstra ************************/

/******************* MESSAGING AND KEYS ************************/
  //Add some text for the game over message
  message = g.text("Game Over!", "64px Futura", "black", 20, 20);
  message.x = 120;
  message.y = g.canvas.height / 2 - 64;
  //Create a `gameOverScene` group and add the message sprite to it
  gameOverScene = g.group(message);
  //Make the `gameOverScene` invisible for now
  gameOverScene.visible = false;

  //You can also do it the long way, like this:
  g.key.rightArrow.press = function() {
    player.movement.direction = directions.right;
  };
  g.key.leftArrow.press = function() {
    player.movement.direction = directions.left;
  };
  g.key.upArrow.press = function() {
    player.movement.direction = directions.up;
  };
  g.key.downArrow.press = function() {
    player.movement.direction = directions.down;
  };
  g.key.a.press = function() {
    destroyBlock('dl');
  };
  g.key.d.press = function() {
    destroyBlock('dr');
  };

  g.key.rightArrow.release = function() {
    if(player.movement.direction === directions.right) {
      player.movement.direction = directions.still;
    }
  };
  g.key.leftArrow.release = function() {
    if(player.movement.direction === directions.left) {
      player.movement.direction = directions.still;
    }
  };
  g.key.upArrow.release = function() {
    if(player.movement.direction === directions.up) {
      player.movement.direction = directions.still;
    }
  };
  g.key.downArrow.release = function() {
    if(player.movement.direction === directions.down) {
      player.movement.direction = directions.still;
    }
  };
/******************* MESSAGING AND KEYS ************************/

  //set the game state to `play`
  g.state = play;
}

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

function canMoveInDirection(sprite, adjacentTiles, dir) {
  switch(dir) {
    case directions.up:
      if(adjacentTiles.u.type && 
        adjacentTiles.c.type === g.tileTypes.ladder && 
        adjacentTiles.u.type !== g.tileTypes.floor) {
        return true;
      }
    break;
    case directions.down:
      if(adjacentTiles.d.type && adjacentTiles.c.type === g.tileTypes.ladder && adjacentTiles.d.type !== g.tileTypes.floor || 
        adjacentTiles.d.type && adjacentTiles.d.type === g.tileTypes.ladder ||
        adjacentTiles.d.type && sprite.movement.falling) {
        return true;
      }
    break;
    case directions.right:
      if(adjacentTiles.r.type && adjacentTiles.r.type !== g.tileTypes.floor) {
        return true;
      }
    break;
    case directions.left:
      if(adjacentTiles.l.type && adjacentTiles.l.type !== g.tileTypes.floor) {
        return true;
      }
    break;
    default:
      return false;
    break;
  }
}

function moveOneTile(sprite, currentTile, dir) {
  // currentTile = g.getSpriteIndex(sprite);
  let adjacentTiles = g.getAdjacentTiles(currentTile);
  canMove = canMoveInDirection(sprite, adjacentTiles, dir);
  if(canMove) {
    currentCoords = g.getTile(currentTile, world.objects[0].data, world);
    nextCoords = g.getTile(adjacentTiles[dir].index, world.objects[0].data, world);
    nextX = nextCoords.x;
    nextY = nextCoords.y;
    sprite.x = nextX;
    sprite.y = nextY;
    checkIfFalling(sprite);
  } else {
    return false;
  }

  return true;
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
  currentTile = g.getSpriteIndex(sprite);
  adjacentTiles = g.getAdjacentTiles(currentTile);

  if(adjacentTiles.c.type !== g.tileTypes.ladder && !adjacentTiles.d.isStable) {//adjacentTiles.d.type === g.tileTypes.air) {
    sprite.movement.falling = true;
  } else {
    sprite.movement.falling = false;
  }
}

function moveAgain() {
  player.movement.moving = false;
}

function moveEnemy(eSprite) {
  enemyMoved = false;

  let currentTile = eSprite.pathData.path[0];
  let nextTile = eSprite.pathData.path[1];

  if(!eSprite.movement.stuck) {
    if(!nextTile) {
      eSprite.needsPath = true;
    }
    checkIfFalling(eSprite);
  }

  if(!eSprite.movement.falling && !eSprite.movement.stuck) {
    if(nextTile < currentTile) {
      // moving l/u
      if(nextTile + 1 === currentTile) {
        enemyMoved = moveOneTile(eSprite, currentTile, directions.left);
      } else {
        enemyMoved = moveOneTile(eSprite, currentTile, directions.up)
      }
    } else if (nextTile > currentTile) {
      // moving r/d
      if(nextTile - 1 === currentTile) {
        enemyMoved = moveOneTile(eSprite, currentTile, directions.right)
      } else {
        enemyMoved = moveOneTile(eSprite, currentTile, directions.down)      
      }
    }
  } else if(eSprite.movement.falling) {
    enemyMoved = moveOneTile(eSprite, currentTile, directions.down);
    if(enemyMoved) {
      eSprite.movement.falling = false;
      eSprite.movement.stuck = true;
      eSprite.movement.stuckAt = Date.now();
    }
  } else if(eSprite.movement.stuck) {
    if(config.enemyUnstuckSpeed < Date.now() - eSprite.movement.stuckAt) {
      eSprite.movement.stuck = false;
      eSprite.movement.stuckAt = undefined;
      
      if(!nextTile) {
        nextTile = Math.random() < 0.5 ? currentTile + 1 : currentTile - 1;
      }

      enemyMoved = teleportTo(eSprite, nextTile);
      unfillBlock(currentTile);
      eSprite.inHole = undefined;
      eSprite.needsPath = true;
    }
  }

  if(enemyMoved) {
    eSprite.pathData.path.shift();
  }
  return enemyMoved;
}



//The `play` state
function play() {
  //Move the player
  currentTile = g.getSpriteIndex(player);

  movePlayer(currentTile);

  enemies.forEach(enemy => {
    enemy.currentTile = g.getSpriteIndex(enemy);

    let holeNeedsFilling = destroyedBlockQueue.indexOf(enemy.currentTile);
    let holeNeedsEmptying = holesWithEnemies.indexOf(enemy.currentTile);

    if(holeNeedsFilling !== -1 && holeNeedsEmptying === -1) {
      enemy.inHole = enemy.currentTile;
      fillBlock(holeNeedsFilling);
    }

    // Enemy movement
    if(!enemy.dead) {
      if(enemy.needsPath && !enemy.movement.falling) {
        if(enemy.movement.stuck) {
          enemy.currentTile -= 32;
        }
       
        // console.log(`Enemy ${enemy.id} running dijkstra`);
        enemy.pathData.path = dijkstra(enemy.currentTile, currentTile).path;
        enemy.pathData.updated = Date.now();
        enemy.needsPath = false;
      } else if(Date.now() - enemy.pathData.updated > config.pathUpdateFrequency) {
        enemy.needsPath = true;
      }
      if(!enemy.movement.moving) {
          enemyMoved = moveEnemy(enemy);
          if(enemyMoved) {
            enemy.movement.moving = true;
            g.wait(config.enemyMoveSpeed, function() {
              enemy.movement.moving = false;
            })
          }
      }
    }
  })
  // playerData = g.getAdjacentTiles(currentTile);

  if (destroyedBlockQueue.length && Date.now() - blockHash[destroyedBlockQueue[0]].time > config.blockRespawnSpeed) {
    respawnNextBlock();
  }

  //Keep the player contained inside the stage's area
  g.contain(player, g.stage.localBounds);

  //Check for the end of the game
  //Does the player have enough health? If the width of the `innerBar`
  //is less than zero, end the game and display "You lost!"
  if (1 < 0) {
    g.state = end;
    message.content = "You lost!";
  }
  //If the player has brought the treasure to the exit,
  //end the game and display "You won!"
  // if (g.hitTestRectangle(player, exit)) {
  //   g.state = end;
  //   message.content = "You won!";
  // }
}

function movePlayer(cT) {
  let didMove;
    // Player movement
  checkIfFalling(player);

  if(player.movement.direction !== directions.still && !player.movement.moving || player.movement.falling && !player.movement.moving) {
    if(player.movement.falling) {
      didMove = moveOneTile(player, cT, directions.down);
    } else {
      didMove = moveOneTile(player, cT, player.movement.direction);
    }

    if(didMove) {
      player.movement.moving = true;
      g.wait(config.playerMoveSpeed, moveAgain);
    }
  }

}

function end() {
  //Hide the `gameScene` and display the `gameOverScene`
  gameScene.visible = false;
  gameOverScene.visible = true;
}