import ga from './ga';
import World from 'Classes/World';
// import tileset from './tileset.png';

//  All of your game code will go here
const g = ga(
  1024, 768, setup,
  [
    'tileset.png',
  ],
);

function setup() {
  console.log('We are running the setup. We have g:', g);
  // console.log('We have the world:', worldJson);

  const world = new World(g); // g.makeTiledWorld(worldJson, 'tileset.png');

  console.log(world.data);
}

g.start();
