/* TODO:
- Prevent directly adding new levels to World
- Make generic 'SPRITE' manager for Battery/Door collections
- Add in level progressions
- - This requires a couple new methods:
- - - Notify the game that the level has been complete
- - - Destroy the current level
- - - Load the new level
- Add in multiple player lives
- Add bottom bar to disply level/lives/battery pickup/etc...
 */

import ga from './ga';
import World from 'Classes/World';
import Player from 'Classes/Player';
import Enemy from 'Classes/Enemy';
import MoveManager from 'Classes/MoveManager';
import BlockManager from 'Classes/BlockManager';
import GraphManager from 'Classes/GraphManager';
import SceneManager from 'Classes/SceneManager';
// import Sounds from 'Classes/Sound';
import {configDifficulties, configValues} from 'Classes/Settings';
// import Level from 'Classes/Level';

// Initialize GA instance
const g = ga(
  1024, 768, setup,
  [
    'tileset.png',
  ],
);

g.custom = {
  changeDifficulty,
  getDifficulty,
};

let world;
let player;
let enemies = [];
let difficulty = configDifficulties.easy;
let settings = configValues[difficulty];

const enemyOccupations = {};
const levelNumber = 1; // 4 total
const mm = MoveManager.getInstance(g);
const bm = BlockManager.getInstance(g, settings.respawnTimer);
const gm = GraphManager.getInstance(g);
const sm = new SceneManager(g);

console.log('Settings', configDifficulties, configValues);

// Simple refresh-reset
document.getElementById('restart').addEventListener('click', () => {
  location.reload();
});

function changeDifficulty() {
  console.log('Changing Difficulty!');
  // difficulty = diff;
  // settings = configValues[diff];
  switch (difficulty) {
    default:
    case configDifficulties.playground:
      difficulty = configDifficulties.easy;
      break;
    case configDifficulties.easy:
      difficulty = configDifficulties.normal;
      break;
    case configDifficulties.normal:
      difficulty = configDifficulties.hard;
      break;
    case configDifficulties.hard:
      difficulty = configDifficulties.playground;
      break;
  }

  settings = configValues[difficulty];

  initManagers(levelNumber);
  initEntities();
}

function getDifficulty() {
  return difficulty;
}

function startNewLevel(currentLevel) {
  world.renderLevel(currentLevel);

  initManagers(currentLevel);
  initEntities();

  console.log('The current level is', world.currentLevel);
  console.log('The difficulty is:', difficulty, settings);
}

function initEntities() {
  player = new Player(world.currentLevel.sprites.player[0], settings.playerMoveSpeed, g);

  console.log('PLAYER CREATED:', player.currentTile);

  enemies = [];

  if (difficulty !== configDifficulties.playground) {
    world.currentLevel.sprites.enemy.forEach((enemy, idx) => {
      enemies.push(new Enemy(world.currentLevel.sprites.enemy[idx], settings.enemyMoveSpeed, settings.pathUpdateFrequency, settings.enemyUnstuckSpeed, g));
    });

    for (let i = world.levelGroup.children.length - 1; i >= 0; i--) {
      const t = world.levelGroup.children[i];

      if (t.name === 'enemy') {
        world.levelGroup.children[i].visible = true;
      }
    }
  } else {
    for (let i = world.levelGroup.children.length - 1; i >= 0; i--) {
      const t = world.levelGroup.children[i];

      if (t.name === 'enemy') {
        world.levelGroup.children[i].visible = false;
      }
    }
  }
}

function initManagers(currentLevel) {
  mm.updateSettings(settings);

  bm.updateSettings(settings);

  console.log('Sprites for current level', world.level(currentLevel).sprites);

  bm.setBlocks(world.level(currentLevel).sprites);

  console.log('Blocks are set', bm.blocksObject);

  gm.createLevelGraph(mm.canMoveFromTo.bind(mm), bm.blocksObject);
}

function initWorld(currentLevel) {
  world = new World(g);

  sm.setGameScene(world.levelGroup);
  sm.setGameLoop(gameLoop);

  startNewLevel(currentLevel);
}

function setup() {
  console.log('We are running the setup. We have g:', g);

  // Entity creation depends on manager instantiation
  initWorld(levelNumber);

  // Initializes state on the gameLoop
  // console.log('World level', world.levelGroup.visible = false);
  // g.state = sm.title;

  g.state = sm.title;
  // g.state = sm.intro;
  // g.state = sm.game;
  // g.state = sm.gameOverWon;
  // g.state = sm.gameOverLost;

  // g.state = gameLoop;

  // Easy tile debugging
  const pointer = g.pointer;

  pointer.press = function () {
    const index = g.getIndex(pointer.centerX, pointer.centerY, 32, 32, 32);
    // const currentCoords = g.getTile(index, g.world.objects[0].data, g.world);

    console.log(`${index}`);
    console.log('Tile:', BlockManager.getBlock(index));
  };
}

function checkForPlayerKill(enemy) {
  if (enemy.currentTile === player.currentTile &&
    (settings.allowFallingKills || (!settings.allowFallingKills && !player.movement.falling))) {
    console.log('DEV ONLY: You Died!');
    gameOver();
  }
}

function gameLoop() {
  // console.log('GL running', g.state);

  // Based on prior version, 4 things need to happen here:
  // 1. Check if players/enemies are in closing blocks
  // 2. Move the player
  // 3. Move all the enemies
  // 4. Respawn blocks
  // ?. Check if enemies have captured player...
  if (sm.gameScene.visible && player.hasStarted) {
    bm.updateBlocks();

    if (!player.dead) {
      mm.move(player);
      checkClosingBlocks(player, player.makeDead.bind(player));
    } else {
      gameOver();
    }

    enemies.forEach(enemy => {
      enemy.update(player.currentTile);
      checkForPlayerKill(enemy);

      if (enemy.occupiedBlock) {
        bm.fillBlock(enemy);
        enemyOccupations[enemy.id] = enemy.occupiedBlock;
      } else if (enemyOccupations[enemy.id]) {
        bm.vacateBlock(enemy);
        delete enemyOccupations[enemy.id];
      }

      if (!enemy.state.stuck) {
        mm.move(enemy);
      }

      if (!enemy.dead) {
        checkClosingBlocks(enemy, enemy.makeDead.bind(enemy));
      }
    });

    world.currentLevel.batteries.allCollected ?
      world.checkForCompletedLevel(player.currentTile) ? goToNextLevel() : '' :
      world.currentLevel.checkForBatteryPickup(player.currentTile);
  }
}

function goToNextLevel() {
  if (world.currentLevel.number === world.totalLevels) {
    g.state = sm.gameOverWon;
  } else {
    startNewLevel(world.currentLevel.number + 1);
  }
}

function checkClosingBlocks(entity, callback) {
  if (bm.closingBlocks.indexOf(entity.currentTile) !== -1) {
    callback();
  }
}

function gameOver() {
  g.state = sm.gameOverLost;
  // g.pause();
}

// Calls 'setup' function
g.start();
