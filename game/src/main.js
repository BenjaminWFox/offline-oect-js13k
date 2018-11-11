import ga from './ga';
import World from 'Classes/World';
// import Level from 'Classes/Level';

// Initialize GA instance
const g = ga(
  1024, 768, setup,
  [
    'tileset.png',
  ],
);

// Simple refresh-reset
document.getElementById('restart').addEventListener('click', () => {
  location.reload();
});

// // Game configuration object
// const config = {
//   playerMoveSpeed: 150,
//   enemyMoveSpeed: 250,
//   blockRespawnSpeed: 3300,
//   pathUpdateFrequency: 500,
//   enemyUnstuckSpeed: undefined,
//   allowFallingKills: false,
//   difficulties: {
//     playground: 'playground',
//     easy: 'easy',
//     normal: 'normal',
//     hard: 'hard',
//   },
//   difficulty: undefined,
// };
// //  Left arrow key `press` method
// const directions = {
//   up: 'u',
//   down: 'd',
//   left: 'l',
//   right: 'r',
//   current: 'c',
//   still: 'still',
// };
// // Reference and track batteries
// const batteryHash = {};
// let totalBatteries = 0;
// let collectedBatteries = 0;
// // Reference and track blocks
// const destroyedBlocks = {
//   queue: [],
//   hash: {},
// };
// const closingBlocks = [];
// // Reference available exits
// const exitHash = {};

// THE GAME needs to know, on a per-level basis:
// Batteries
// Enemies
// Exits
// Player
// Floors

function setup() {
  console.log('We are running the setup. We have g:', g);

  const world = new World(g);

  world.buildLevels(g);

  world.renderLevel(1);

  console.log('World & Level', world, world.levels);
}

g.start();
