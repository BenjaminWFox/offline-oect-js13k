/* TODO:
- Prevent directly adding new levels to World
- Turn Player.js into generic parent class for both Enemy & Player [or just create PC.js & NPC.js]
- Refactor player code into child class of the new parent
- Load/separate enemy sprites from level
- Add enemy movement
- Add block pickup/collision mechanic
- Add block destruction/respawn mechanic
 */

import ga from './ga';
import World from 'Classes/World';
import Player from 'Classes/Player';
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

function setup() {
  console.log('We are running the setup. We have g:', g);

  world = new World(g);
  world.buildLevels(g);
  world.renderLevel(levelNumber);

  console.log('g.world created', g.world.objects);

  player = new Player(world.currentLevel.sprites.player[0], settings.playerMoveSpeed, g);

  console.log('PLAYER CREATED:', player.currentTile);

  // sounds = new Sounds(Sounds.context);

  mm.updateSettings(settings);
  bm.updateSettings(settings);
  bm.setBlocks(world.level(levelNumber).sprites);
  // gm.createLevelGraph(() => {}, bm.blocksObject);
  gm.createLevelGraph(mm.canMoveFromTo.bind(mm), bm.blocksObject);

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
  bm.updateBlocks();
  mm.move(player);
  checkClosingBlocks(player, bm.closingBlocks);
  world.currentLevel.checkForBatteryPickup(player.currentTile);
}

function checkClosingBlocks(player, closingBlocks) {
  if (closingBlocks.indexOf(player.currentTile) !== -1) {
    // This would be a game over
    g.pause();
  }
}

// Calls 'setup' function
g.start();
