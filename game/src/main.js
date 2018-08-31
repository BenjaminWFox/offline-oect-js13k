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

//Start the Ga engine
g.start();
//Declare your global variables (global to this game)
var dungeon, player, treasure, enemies, chimes, exit,
    healthBar, message, gameScene, gameOverScene;
destroyedBlockQueue = [];
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
  airs = world.getObjects(g.tileTypes.air);
  floors = world.getObjects(g.tileTypes.floor);
  ladders = world.getObjects(g.tileTypes.ladder);

  // Render level tiles
  floors.forEach(floor => {
    gameScene.addChild(floor);
  })
  airs.forEach(air => {
    gameScene.addChild(air);
  })
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
  player.x = 576;
  player.y = 704;
  player.movement = {
    falling: false,
    moving: false,
    direction: directions.still,
  }
  gameScene.addChild(player);

  enemy = g.sprite({image: "tileset.png", x: 160, y: 0, width: 32, height: 32})
  enemy.x = 608;
  enemy.y = 704;
  enemy.movement = {
    falling: false,
    moving: false,
    direction: directions.still,
  }
  enemy.needsPath = true;
  enemy.pathData = {
    path: null,
    updated: null,
  }

  gameScene.addChild(enemy);

  enemies.push(enemy);

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
    console.log(costs);
    console.log(parents);

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
  console.log(dijkstra(723, 722));

  function makeLevelGraph() {
    const graph = {};

    // There should be 48 tiles in the graph
    // object[n].index is the unique ID for this tile.
    objects = world.objects;

    for(let i = 1, len = objects.length; i < objects.length; i++) {
      let co = objects[i]
      if(co.name !== g.tileTypes.floor) {
        ruleOut = {current: g.getAdjacentTile(co.index, 'c'), below: g.getAdjacentTile(co.index, 'd')}

        if(ruleOut.current.type !== g.tileTypes.ladder && !ruleOut.below.isStable) {
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
  //Assign the player's keyboard controllers
  // g.fourKeyController(player, 2, 38, 39, 40, 37);
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
    // moveOneTile(directions.down);
    destroyBlock('dl');
  };
  g.key.d.press = function() {
    // moveOneTile(directions.down);
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
    destroyedBlockQueue.push({'sprite': spriteToDestroy, 'tile': tileToDestroy, 'time': Date.now()});
  }
}

function respawnBlock(blockObj) {
  let tween = g.fadeIn(blockObj.sprite, 15)
  world.children[0].data[blockObj.tile.index] = 2;
  // tween.onComplete = function(obj) {
  // };
  // blockObj.sprite.visible = true;
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

function moveOneTile(sprite, dir) {
  currentTile = g.getSpriteIndex(sprite);
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

  function checkIfFalling(sprite) {
    currentTile = g.getSpriteIndex(sprite);
    adjacentTiles = g.getAdjacentTiles(currentTile);

    if(adjacentTiles.c.type !== g.tileTypes.ladder && adjacentTiles.d.type === g.tileTypes.air) {
      sprite.movement.falling = true;
    } else {
      sprite.movement.falling = false;
    }
  }
}

function moveAgain() {
  player.movement.moving = false;
}

function moveEnemy(sprite) {
  enemyMoved = false;

  let currentTile = sprite.pathData.path[0];
  let nextTile = sprite.pathData.path[1];
  if(nextTile < currentTile) {
    // moving l/u
    if(nextTile + 1 === currentTile) {
      enemyMoved = moveOneTile(sprite, directions.left);
    } else {
      enemyMoved = moveOneTile(sprite, directions.up)
    }
  } else if (nextTile > currentTile) {
    // moving r/d
    if(nextTile - 1 === currentTile) {
      enemyMoved = moveOneTile(sprite, directions.right)
    } else {
      enemyMoved = moveOneTile(sprite, directions.down)      
    }
  }
  if(enemyMoved) {
    sprite.pathData.path.shift();
  }
  return enemyMoved;
}



//The `play` state
function play() {
  //Move the player
  currentTile = g.getSpriteIndex(player);
  enemyTile = g.getSpriteIndex(enemy);
  // playerData = g.getAdjacentTiles(currentTile);

  if (destroyedBlockQueue.length && Date.now() - destroyedBlockQueue[0].time > 500) {
    respawnBlock(destroyedBlockQueue.shift());
  }

  // Enemy movement
  if(enemy.needsPath) {
    enemy.pathData.path = dijkstra(enemyTile, currentTile).path;
    enemy.pathData.updated = Date.now();
    enemy.needsPath = false;
  } else if(Date.now() - enemy.pathData.updated > 250) {
    enemy.needsPath = true;
  }
  if(!enemy.movement.moving) {
      enemyMoved = moveEnemy(enemy);
      console.log(enemyMoved);
      if(enemyMoved) {
        enemy.movement.moving = true;
        g.wait(250, function() {
          enemy.movement.moving = false;
        })
      }
  }

  movePlayer(currentTile);

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
  if(player.movement.direction !== directions.still && !player.movement.moving || player.movement.falling && !player.movement.moving) {
    if(player.movement.falling) {
      didMove = moveOneTile(player, directions.down);
    } else {
      didMove = moveOneTile(player, player.movement.direction);
    }

    if(didMove) {
      player.movement.moving = true;
      g.wait(150, moveAgain);
    }
  }

}

function end() {
  //Hide the `gameScene` and display the `gameOverScene`
  gameScene.visible = false;
  gameOverScene.visible = true;
}