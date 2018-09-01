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
  introTextFadein: 2000,
  pathUpdateFrequency: 1000,
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
blockHash = {};
batteryHash = {};
exitHash = {};
totalBatteries = 0;
collectedBatteries = 0;
enemies = [];

function lose() {
  gameScene.visible = false;
  gameOverScene.visible = true;
  titleScreen.visible = false
  endMessage.content = "Oh no! You're part of the building, now.";
  endMessage.x = 180;
  endMessage.y = g.canvas.height / 2 - 35;
}

function win() {
  gameScene.visible = false;
  titleScreen.visible = false
  gameOverScene.visible = true;
  endMessage.content = "You made it! Nice work!";
  endMessage.x = 300;
  endMessage.y = g.canvas.height / 2 - 35;
}

function title() {
  titleScreen.visible = true;
  gameScene.visible = false;
  gameOverScene.visible = false;
  introScene.visible = false;
}

function intro() {
  gameScene.visible = false;
  titleScreen.visible = false;
  gameOverScene.visible = false;
  introScene.visible = true;
  g.wait(config.introTextFadein, () => { introMessage2.visible = true });
  g.wait(config.introTextFadein * 2, () => { introMessage3.visible = true });
  g.wait(config.introTextFadein * 3, () => { introMessage4.visible = true });
}

//The `setup` function will run only once.
//Use it for initialization tasks
function setup() {
  //Set the canvas border and background color
  g.canvas.style.border = "none";
  g.backgroundColor = "black";

  //Add some text for the game over message
  endMessage = g.text("Placeholder Text", "32px Consolas", "#15e815", 0, 0);
  //Create a `gameOverScene` group and add the message sprite to it
  gameOverScene = g.group(endMessage);
  //Make the `gameOverScene` invisible for now
  gameOverScene.visible = false;

  //Add some text for the game over message
  introMessage1 = g.text(
    "I'm glad you're coming on shift sir! That earthquake really messed up the building!", 
    "22px Consolas", "#15e815", 0, 0);
  introMessage1.x = 15;
  introMessage1.y = 150;
  introMessage2 = g.text(
    "Electronics are offline, batteries scattered, and the organic security is haywire!",
    "22px Consolas", "#15e815", 0, 0);
  introMessage2.x = 15;
  introMessage2.y = 185;
  introMessage2.visible = false;
  introMessage3 = g.text(
    "Barely enough juice to open the door. You'll need all the batteries to fix it up!",
    "22px Consolas", "#15e815", 0, 0);
  introMessage3.x = 15;
  introMessage3.y = 220;
  introMessage3.visible = false;
  introMessage4 = g.text(
    "You're the best Organic Electro-Chemical Technician we've got. You can do it! >>>",
    "22px Consolas", "#15e815", 0, 0);
  introMessage4.visible = false;
  introMessage4.x = 15;
  introMessage4.y = 255;
  //Create a `gameOverScene` group and add the message sprite to it
  introScene = g.group(introMessage1, introMessage2, introMessage3, introMessage4);
  //Make the `gameOverScene` invisible for now
  introScene.visible = false;

  //Add some text for the game over message
  titleMessageMain = g.text("---- OECT ----", "64px Consolas", "#15e815", 0, 0);
  titleMessageSub1 = g.text("By Ben Fox.", "32px Consolas", "#15e815", 0, 0);
  titleMessageSub2 = g.text("[ SPACE ] to page/pause.", "32px Consolas", "#15e815", 0, 0);
  titleMessageSub3 = g.text("[ A/D ] to blast the floor. [ ARROWS ] to move.", "32px Consolas", "#15e815", 0, 0);
  titleMessageMain.x = 250;
  titleMessageMain.y = 250;
  titleMessageSub1.x = 400;
  titleMessageSub1.y = 350;
  titleMessageSub2.x = 290;
  titleMessageSub2.y = 400;
  titleMessageSub3.x = 100;
  titleMessageSub3.y = 450;
  //Create a `gameOverScene` group and add the message sprite to it
  titleScreen = g.group(titleMessageMain, titleMessageSub1, titleMessageSub2, titleMessageSub3);
  //Make the `gameOverScene` invisible for now
  titleScreen.visible = false;

  world = g.makeTiledWorld('world.json', 'tileset.png');

  //Create the `gameScene` group
  gameScene = g.group();

  // Create reference to level tiles
  exits = world.getObjects(g.tileTypes.door);
  // airs = world.getObjects(g.tileTypes.air);
  floors = world.getObjects(g.tileTypes.floor);
  ladders = world.getObjects(g.tileTypes.ladder);
  batteries = world.getObjects(g.tileTypes.battery);

  // Render level tiles
  exits.forEach(exit => {
    gameScene.addChild(exit);
    exit.canUse = false;
    exit.alpha = .25;
    exitHash[exit.index] = exit;
  })
  floors.forEach(floor => {
    gameScene.addChild(floor);
  })
  batteries.forEach(battery => {
    gameScene.addChild(battery);
    batteryHash[battery.index] = battery;
  })
  totalBatteries = Object.keys(batteryHash).length;
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
    current: 'c',
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
  player.spawnX = 32;
  player.spawnY = 704;
  player.x = player.spawnX;
  player.y = player.spawnY;
  player.dead = false;
  player.movement = {
    falling: false,
    moving: false,
    direction: directions.still,
  }
  player.freshSpawn = true;
  player.currentTile = g.getSpriteIndex(player);
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
    enemy.allowMoveAgain = function() {
      enemy.movement.moving = false;
    }
    enemy.currentTile = g.getSpriteIndex(enemy);
    enemy.dead = false;
    enemy.freshSpawn = true;
    enemy.inHole = undefined;
    enemy.needsPath = true;
    enemy.pathData = {
      path: null,
      updated: null,
      distance: null,
    }
    return enemy;
  }

  enemies.push(makeEnemy(0, 0, 1));
  enemies.push(makeEnemy(576, 544, 2));
  // enemies.push(makeEnemy(224, 608));

  enemies.forEach(enemy => {
    gameScene.addChild(enemy);
  })

/******************* GRAPHING AND dijkstra ************************/
  levelGraph = makeLevelGraph();
  console.log('graph', levelGraph);
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
        updated: Date.now(),
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
      path: optimalPath,
      updated: Date.now(),
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
        ruleOut = {current: g.getAdjacentTile(co.index, 'c'), below: g.getAdjacentTile(co.index, 'd')}

        if(ruleOut.current.type !== g.tileTypes.ladder && !ruleOut.below.isStable) {
          // skip
        } else {
          graph[co.index] = {};
          // These should all be tiles which are walkable.
          adjTiles = g.getAdjacentTiles(co.index);
          if(canMoveFromTo(player, adjTiles.c, adjTiles.u)) {
            graph[co.index][adjTiles.u.index] = 1;
          }
          if(canMoveFromTo(player, adjTiles.c, adjTiles.d)) {
            graph[co.index][adjTiles.d.index] = 1;
          }
          if(canMoveFromTo(player, adjTiles.c, adjTiles.l)) {
            graph[co.index][adjTiles.l.index] = 1;
          }
          if(canMoveFromTo(player, adjTiles.c, adjTiles.r)) {
            graph[co.index][adjTiles.r.index] = 1;
          }
        }
      }
    }

    return graph;
  }
/******************* GRAPHING AND dijkstra ************************/

/******************* MESSAGING AND KEYS ************************/
  //You can also do it the long way, like this:
  g.key.space.press = function() {
    if (g.state === title) {
      console.log('switch from title');
      g.state = intro;
    } else if (g.state === intro) {
      console.log('switch from into');
      gameScene.visible = true;
      introScene.visible = false;
      g.state = play;
    } else if(g.state === play) {
      if(g.paused && !player.dead) {
        g.resume();
      } else {
        g.pause();
      }
    } else if (g.state === win || g.state === lose) {
      location.reload();
    }
  }
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
  // g.state = title;
  // for dev:
  g.state = play;
}

function doorsOpen() {
  exits.forEach(exit => {
    exit.alpha = 1;
    exit.canUse = true;
  })
}

