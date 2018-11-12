/* TODO:
- Prevent directly adding new levels to World
- Load/separate player sprite from level
- Add player movement
- Load/separate enemy sprites from level
- Add enemy movement
 */

import ga from './ga';
import World from 'Classes/World';
import Player from 'Classes/Player';
import MoveManager from 'Classes/MoveManager';
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
const mm = MoveManager.getInstance(g);
const difficulty = configDifficulties.normal;
const settings = configValues[difficulty];

console.log('Settings', configDifficulties, configValues);

// Simple refresh-reset
document.getElementById('restart').addEventListener('click', () => {
  location.reload();
});

function setup() {
  console.log('We are running the setup. We have g:', g);

  world = new World(g);
  world.buildLevels(g);
  world.renderLevel(1);

  player = new Player(settings.playerMoveSpeed, world.level(1), g);

  mm.updateSettings(settings);

  // Initializes state on the gameLoop
  g.state = gameLoop;
}

function gameLoop() {
  // Based on prior version, 4 things need to happen here:
  // 1. Check if players/enemies are in closing blocks
  // 2. Move the player
  // 3. Move all the enemies
  // 4. Respawn blocks
  mm.move(player);
}

// Calls 'setup' function
g.start();
