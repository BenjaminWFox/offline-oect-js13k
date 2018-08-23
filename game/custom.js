GA.custom = function(ga) {
  // CONFIG
  ga.tileTypes = {
    air: 'air',
    floor: 'floor',
    ladder: 'ladder',
    door: 'door',
  }

  //#### getIndex
  //The `getIndex` helper method
  //converts a sprite's x and y position to an array index number.
  //It returns a single index value that tells you the map array
  //index number that the sprite is in
  ga.getSpriteIndex = function(sprite) {
    return ga.getIndex(sprite.x, sprite.y, 32, 32, 32);
  }

  ga.getAdjacentTiles = function(index) {
    return {
      c: getAdjacentTile(index, 'c'),
      u: getAdjacentTile(index, 'u'),
      r: getAdjacentTile(index, 'r'),
      d: getAdjacentTile(index, 'd'),
      l: getAdjacentTile(index, 'l'),
    }
  }

  function getAdjacentTile(index, dir) {
    tileIndex = undefined;
    switch(dir) {
      case 'u':
        if(index < world.widthInTiles) {
          tileIndex = null;
        } else {
          tileIndex = index - 32;
        }
        break;
      case 'r':
        if((index + 1) % 32 === 0) {
          tileIndex = null;
        } else {
          tileIndex = index + 1;
        }
        break;
      case 'd':
        if(index >= world.widthInTiles * world.heightInTiles - world.widthInTiles) {
          tileIndex = null;
        } else {
          tileIndex = index + 32;
        }
        break;
      case 'l':
        if(index % 32 === 0) {
          tileIndex = null;
        } else {
          tileIndex = index - 1;
        }
        break;
      default:
        tileIndex = index;
        break;
    }

    type = world.tileTypes[world.objects[0].data[tileIndex] - 1];

    return {
      index: tileIndex,
      type: type ? type.name : undefined,
    }
  }

  ga.getIndex = function(x, y, tilewidth, tileheight, mapWidthInTiles) {
    var index = {};

    //Convert pixel coordinates to map index coordinates
    index.x = Math.floor(x / tilewidth);
    index.y = Math.floor(y / tileheight);

    //Return the index number
    return index.x + (index.y * mapWidthInTiles);
  };

  //### move
  //Move a sprite or an array of sprites by adding its
  //velocity to its position
  ga.move = function(sprites) {
    if (sprites instanceof Array === false) {
      internal_move(sprites)
    } else {
      for (var i = 0; i < sprites.length; i++) {
        internal_move(sprites[i])
      }
    }
  };

  function internal_move(sprite) {
  }

  //### fourKeyController

  ga.fourKeyController = function(s, speed, up, right, down, left) {

    //Create a `direction` property on the sprite
    s.direction = "";

    //Create some keyboard objects
    leftArrow = ga.keyboard(left);
    upArrow = ga.keyboard(up);
    rightArrow = ga.keyboard(right);
    downArrow = ga.keyboard(down);

    //Assign key `press` and release methods
    leftArrow.press = function() {
      s.vx = -speed;
      s.vy = 0;
      s.direction = "left";
    };
    leftArrow.release = function() {
      if (!rightArrow.isDown && s.vy === 0) {
        s.vx = 0;
      }
    };
    upArrow.press = function() {
      s.vy = -speed;
      s.vx = 0;
      s.direction = "up";
    };
    upArrow.release = function() {
      if (!downArrow.isDown && s.vx === 0) {
        s.vy = 0;
      }
    };
    rightArrow.press = function() {
      s.vx = speed;
      s.vy = 0;
      s.direction = "right";
    };
    rightArrow.release = function() {
      if (!leftArrow.isDown && s.vy === 0) {
        s.vx = 0;
      }
    };
    downArrow.press = function() {
      s.vy = speed;
      s.vx = 0;
      s.direction = "down";
    };
    downArrow.release = function() {
      if (!upArrow.isDown && s.vx === 0) {
        s.vy = 0;
      }
    };
  };


  /*
  ### makeTiledWorld
  */

  /*
  Chapter 6: Tiled editor importers
  ---------------------------------
  Ga lets you import JSON files created by the popular Tiled Editor game map and level editor.

  www.mapeditor.org

  Two functions called `makeTiledWorld` and `makeIsoTiledWorld` (for isometric maps, coming soon!) use this data to
  automatically build your game world for you.

  To prepare your Tiled Editor game world for use in Ga, give any significant thing a
  `name` property. Anything with a `name` property in Tiled Editor can
  be accessed in your code by its string name. Tiled Editor layers have a
  `name` property by default, and you can assign custom `name`
  properties to tiles and objects. Not everything needs a `name` property, just
  things that you want to specifically access in the world after its created.
  */

  ga.makeTiledWorld = function(tiledMap, tileset) {

    //Create a group called `world` to contain all the layers, sprites
    //and objects from the `tiledMap`. The `world` object is going to be
    //returned to the main game program
    console.log(tiledMap);
    tiledMap = ga.json(tiledMap);
    console.log(tiledMap);
    var world = ga.group();
    world.tileheight = tiledMap.tileheight;
    world.tilewidth = tiledMap.tilewidth;

    //Calculate the `width` and `height` of the world, in pixels
    world.width = tiledMap.width * tiledMap.tilewidth;
    world.height = tiledMap.height * tiledMap.tileheight;

    //Get a reference to the world's height and width in
    //tiles, in case you need to know this later (you will!)
    world.widthInTiles = tiledMap.width;
    world.heightInTiles = tiledMap.height;

    // Store tile names for ref
    world.tileTypes = tiledMap.tilesets[0].tileproperties;
    console.log(world.tileTypes);

    //Create an `objects` array to store references to any
    //named objects in the map. Named objects all have
    //a `name` property that was assigned in Tiled Editor
    world.objects = [];

    //The optional spacing (padding) around each tile
    //This is to account for spacing around tiles
    //that's commonly used with texture atlas tilesets. Set the
    //`spacing` property when you create a new map in Tiled Editor
    var spacing = tiledMap.tilesets[0].spacing;

    //Figure out how many columns there are on the tileset.
    //This is the width of the image, divided by the width
    //of each tile, plus any optional spacing thats around each tile
    var numberOfTilesetColumns =
      Math.floor(
        tiledMap.tilesets[0].imagewidth / (tiledMap.tilewidth + spacing)
      );

    //Loop through all the map layers
    tiledMap.layers.forEach(function(tiledLayer){

      //Make a group for this layer and copy
      //all of the layer properties onto it.
      var layerGroup = ga.group();

      Object.keys(tiledLayer).forEach(function(key) {
        //Add all the layer's properties to the group, except the
        //width and height (because the group will work those our for
        //itself based on its content).
        if (key !== "width" && key !== "height") {
          layerGroup[key] = tiledLayer[key];
        }
      });

      //Set the width and height of the layer to
      //the `world`'s width and height
      //layerGroup.width = world.width;
      //layerGroup.height = world.height;

      //Translate `opacity` to `alpha`
      layerGroup.alpha = tiledLayer.opacity;

      //Add the group to the `world`
      world.addChild(layerGroup);

      //Push the group into the world's `objects` array
      //So you can access it later
      world.objects.push(layerGroup);

      //Is this current layer a `tilelayer`?
      if (tiledLayer.type === "tilelayer") {

        //Loop through the `data` array of this layer
        tiledLayer.data.forEach(function(gid, index) {
          var tileSprite, texture, mapX, mapY, tilesetX, tilesetY,
              mapColumn, mapRow, tilesetColumn, tilesetRow;
          //If the grid id number (`gid`) isn't zero, create a sprite
          if (gid !== 0) {
            //Figure out the map column and row number that we're on, and then
            //calculate the grid cell's x and y pixel position.
            mapColumn = index % world.widthInTiles;
            mapRow = Math.floor(index / world.widthInTiles);
            mapX = mapColumn * world.tilewidth;
            mapY = mapRow * world.tileheight;

            //Figure out the column and row number that the tileset
            //image is on, and then use those values to calculate
            //the x and y pixel position of the image on the tileset
            tilesetColumn = ((gid - 1) % numberOfTilesetColumns);
            tilesetRow = Math.floor((gid - 1) / numberOfTilesetColumns);
            tilesetX = tilesetColumn * world.tilewidth;
            tilesetY = tilesetRow * world.tileheight;

            //Compensate for any optional spacing (padding) around the tiles if
            //there is any. This bit of code accumlates the spacing offsets from the
            //left side of the tileset and adds them to the current tile's position
            if (spacing > 0) {
              tilesetX
                += spacing
                + (spacing * ((gid - 1) % numberOfTilesetColumns));
              tilesetY
                += spacing
                + (spacing * Math.floor((gid - 1) / numberOfTilesetColumns));
            }

            //Use the above values to create the sprite's image from
            //the tileset image
            texture = ga.frame(
              tileset, tilesetX, tilesetY,
              world.tilewidth, world.tileheight
            );

            //I've dedcided that any tiles that have a `name` property are important
            //and should be accessible in the `world.objects` array.

            var tileproperties = tiledMap.tilesets[0].tileproperties,
                key = String(gid - 1);

            //If the JSON `tileproperties` object has a sub-object that
            //matches the current tile, and that sub-object has a `name` property,
            //then create a sprite and assign the tile properties onto
            //the sprite
            if (tileproperties[key] && tileproperties[key].name) {

              //Make a sprite
              tileSprite = ga.sprite(texture);

              //Copy all of the tile's properties onto the sprite
              //(This includes the `name` property)
              Object.keys(tileproperties[key]).forEach(function(property) {

                //console.log(tileproperties[key][property])
                tileSprite[property] = tileproperties[key][property];
              });

              //Push the sprite into the world's `objects` array
              //so that you can access it by `name` later
              world.objects.push(tileSprite);
            }

            //If the tile doesn't have a `name` property, just use it to
            //create an ordinary sprite (it will only need one texture)
            else {
              tileSprite = ga.sprite(texture);
            }

            //Position the sprite on the map
            tileSprite.x = mapX;
            tileSprite.y = mapY;

            //Make a record of the sprite's index number in the array
            //(We'll use this for collision detection later)
            tileSprite.index = index;

            //Make a record of the sprite's `gid` on the tileset.
            //This will also be useful for collision detection later
            tileSprite.gid = gid;

            //Add the sprite to the current layer group
            layerGroup.addChild(tileSprite);
          }
        });
      }

      //Is this layer an `objectgroup`?
      if (tiledLayer.type === "objectgroup") {
        tiledLayer.objects.forEach(function(object) {
          //We're just going to capture the object's properties
          //so that we can decide what to do with it later

          //Get a reference to the layer group the object is in
          object.group = layerGroup;

          //Because this is an object layer, it doesn't contain any
          //sprites, just data object. That means it won't be able to
          //calucalte its own height and width. To help it out, give
          //the `layerGroup` the same `width` and `height` as the `world`
          layerGroup.width = world.width;
          layerGroup.height = world.height;

          //Push the object into the world's `objects` array
          world.objects.push(object);
        });
      }
    });

    //Search functions
    //`world.getObject` and `world.getObjects`  search for and return
    //any sprites or objects in the `world.objects` array.
    //Any object that has a `name` propery in
    //Tiled Editor will show up in a search.
    //`getObject` gives you a single object, `getObjects` gives you an array
    //of objects.
    //`getObject` returns the actual search function, so you
    //can use the following format to directly access a single object:
    //sprite.x = world.getObject("anySprite").x;
    //sprite.y = world.getObject("anySprite").y;

    world.getObject = function (objectName) {
      this.searchForObject = function() {
        var foundObject;
        world.objects.some(function(object) {
          if (object.name && object.name === objectName) {
            foundObject = object;
            return true;
          }
        });
        if (foundObject) {
          return foundObject;
        } else {
          console.log("There is no object with the property name: " + objectName);
        }
      };

      //Return the search function
      return this.searchForObject();
    };

    world.getObjects = function (namesOfObjects) {
      var objectNames = Array.prototype.slice.call(arguments);
      var foundObjects = [];
      world.objects.forEach(function(object) {
        if (object.name && objectNames.indexOf(object.name) !== -1) {
          foundObjects.push(object);
        }
      });
      if (foundObjects.length > 0) {
        return foundObjects;
      } else {
        console.log("I could not find those objects");
      }
      return foundObjects;
    };

    //That's it, we're done!
    //Finally, return the `world` object back to the game program
    return world;
  };
};
