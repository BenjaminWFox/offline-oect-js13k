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

let world;
let player;
let enemies = [];
const enemyOccupations = {};
// let sounds;
const levelNumber = 1;
const difficulty = configDifficulties.normal;
const settings = configValues[difficulty];
const mm = MoveManager.getInstance(g);
const bm = BlockManager.getInstance(g, settings.respawnTimer);
const gm = GraphManager.getInstance(g);

console.log('Settings', configDifficulties, configValues);

// Simple refresh-reset
document.getElementById('restart').addEventListener('click', () => {
  location.reload();
});

function initWorld() {
  world = new World(g);
  world.buildLevels(g);
  world.renderLevel(levelNumber);

  console.log('g.world created', g.world.objects);
}

function initEntities() {
  player = new Player(world.currentLevel.sprites.player[0], settings.playerMoveSpeed, g);

  console.log('PLAYER CREATED:', player.currentTile);

  enemies = [];
  world.currentLevel.sprites.enemy.forEach((enemy, idx) => {
    enemies.push(new Enemy(world.currentLevel.sprites.enemy[idx], settings.enemyMoveSpeed, settings.pathUpdateFrequency, settings.enemyUnstuckSpeed, g));
  });

  console.log('ENEMIES CREATED!', enemies);
}

function initManagers() {
  mm.updateSettings(settings);
  bm.updateSettings(settings);
  bm.setBlocks(world.level(levelNumber).sprites);
  gm.createLevelGraph(mm.canMoveFromTo.bind(mm), bm.blocksObject);
}

function setup() {
  console.log('We are running the setup. We have g:', g);

  // Entity creation depends on manager instantiation
  initWorld();
  initManagers();
  initEntities();

  // Initializes state on the gameLoop
  g.state = gameLoop;

  // Easy tile debugging
  const pointer = g.pointer;

  pointer.press = function () {
    const index = g.getIndex(pointer.centerX, pointer.centerY, 32, 32, 32);
    // const currentCoords = g.getTile(index, g.world.objects[0].data, g.world);

    console.log(`${index}`);
    console.log('Tile:', BlockManager.getBlock(index));
  };
}

function gameLoop() {
  // Based on prior version, 4 things need to happen here:
  // 1. Check if players/enemies are in closing blocks
  // 2. Move the player
  // 3. Move all the enemies
  // 4. Respawn blocks
  // ?. Check if enemies have captured player...
  if (player.hasStarted) {
    bm.updateBlocks();

    if (!player.dead) {
      mm.move(player);
      checkClosingBlocks(player, player.makeDead.bind(player));
    } else {
      gameOver();
    }

    enemies.forEach(enemy => {
      enemy.update(player.currentTile);

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
      world.currentLevel.doors.checkForEntry(player.currentTile) :
      world.currentLevel.checkForBatteryPickup(player.currentTile);
  }
}

function checkClosingBlocks(entity, callback) {
  if (bm.closingBlocks.indexOf(entity.currentTile) !== -1) {
    callback();
  }
}

function gameOver() {
  g.pause();
  console.log('GAME OVER');
}

// Calls 'setup' function
g.start();
