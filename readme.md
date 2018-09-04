###About

This project is a game for the [JS13K](http://js13kgames.com/) 2018 competition. It's currently weighing in at 12,911 bytes.

It is built on top of the [Ga](https://github.com/kittykatattack/ga) game engine and uses most of the core engine as well as a few extra plugins, most notably the `makeTiledWorld` method to assemble the game level.

The game level was built in [Tiled](https://www.mapeditor.org/). Any new level could be swapped in using the files in the assets directory. One caveat to know is that *all* tiles in a level must be occupied, hence the presence of a completely transparent 'air' tile in the tileset.

The enemy AI uses Dijkstra's algorithm, a slightly modified version of the one found [here](https://github.com/mburst/dijkstras-algorithm/blob/master/dijkstras.js).

###Run & Build

Run with `npm start` from the `game/` directory.

Build with `npm run build` to minify and copy files to `dist`.

The source files are in `game/src`. All Ga code is in `ga.js`, all other code is in `main.js`, including a condensed copy of `world.json`.

###The Good


###The Bad


###The Ugly
