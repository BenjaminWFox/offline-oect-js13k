GA.custom = function(ga) {
  // CONFIG
  ga.tileTypes = {
    air: 'air',
    floor: 'floor',
    ladder: 'ladder',
    door: 'door',
    battery: 'battery',
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
      c: ga.getAdjacentTile(index, 'c'),
      u: ga.getAdjacentTile(index, 'u'),
      r: ga.getAdjacentTile(index, 'r'),
      d: ga.getAdjacentTile(index, 'd'),
      l: ga.getAdjacentTile(index, 'l'),
      dl: ga.getAdjacentTile(index, 'dl'),
      dr: ga.getAdjacentTile(index, 'dr'),
    }
  }

  ga.getAdjacentTile = function(index, dir) {
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
      case 'dl':
        leftTile = ga.getAdjacentTile(index, 'l'); 
        downTile = ga.getAdjacentTile(index, 'd');
        tileIndex = leftTile ? downTile.index - 1 : null;
        break;
      case 'dr':
        rightTile = ga.getAdjacentTile(index, 'r');
        downTile = ga.getAdjacentTile(index, 'd');
        tileIndex = rightTile ? downTile.index + 1 : null;
        break;
      default:
        tileIndex = index;
        break;
    }
    // console.log('index', index, dir, tileIndex);
    type = world.tileTypes[world.objects[0].data[tileIndex] - 1];

    return {
      index: tileIndex,
      type: type ? type.name : undefined,
      isStable: type ? type.isStable : undefined,
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

  //#### contain
  ga.contain = function(s, bounds, bounce, extra){

    var x = bounds.x,
        y = bounds.y,
        width = bounds.width,
        height = bounds.height;

    //Set `bounce` to `false` by default
    bounce = bounce || false;

    //The `collision` object is used to store which
    //side of the containing rectangle the sprite hits
    var collision;

    //Left
    if (s.x < x) {

      //Bounce the sprite if `bounce` is true
      if (bounce) s.vx *= -1;

      //If the sprite has `mass`, let the mass
      //affect the sprite's velocity
      if(s.mass) s.vx /= s.mass;
      s.x = x;
      collision = "left";
    }

    //Top
    if (s.y < y) {
      if (bounce) s.vy *= -1;
      if(s.mass) s.vy /= s.mass;
      s.y = y;
      collision = "top";
    }

    //Right
    if (s.x + s.width > width) {
      if (bounce) s.vx *= -1;
      if(s.mass) s.vx /= s.mass;
      s.x = width - s.width;
      collision = "right";
    }

    //Bottom
    if (s.y + s.height > height) {
      if (bounce) s.vy *= -1;
      if(s.mass) s.vy /= s.mass;
      s.y = height - s.height;
      collision = "bottom";
    }

    //The `extra` function runs if there was a collision
    //and `extra` has been defined
    if (collision && extra) extra(collision);

    //Return the `collision` object
    return collision;
  };

  /*
  #### getTile
  The `getTile` helper method
  converts a tile's index number into x/y screen
  coordinates, and capture's the tile's grid index (`gid`) number.
  It returns an object with `x`, `y`, `centerX`, `centerY`, `width`, `height`, `halfWidth`
  `halffHeight` and `gid` properties. (The `gid` number is the value that the tile has in the
  mapArray) This lets you use the returned object
  with the 2d geometric collision functions like `hitTestRectangle`
  or `rectangleCollision`

  The `world` object requires these properties:
  `x`, `y`, `tilewidth`, `tileheight` and `widthInTiles`
  */
  ga.getTile = function(index, mapArray, world) {
    var tile = {}
    tile.gid = mapArray[index];
    tile.width = world.tilewidth;
    tile.height = world.tileheight;
    tile.halfWidth = world.tilewidth / 2;
    tile.halfHeight = world.tileheight / 2;
    tile.x = ((index % world.widthInTiles) * world.tilewidth) + world.x;
    tile.y = ((Math.floor(index / world.widthInTiles)) * world.tileheight) + world.y;
    tile.gx = tile.x;
    tile.gy = tile.y;
    tile.centerX = tile.x + world.tilewidth / 2;
    tile.centery = tile.y + world.tileheight / 2;

    //Return the tile object
    return tile;
  };

  //### wait
  ga.wait = function(duration, callBack) {
    return setTimeout(callBack, duration);
  };


  //###`fadeOut`
  //Fade a sprite out, over a duration in frames.
  ga.fadeOut = function(sprite, frames) {
    if (frames === undefined) frames = 60;
    return ga.tweenProperty(
      sprite, "alpha", sprite.alpha, 0, frames, "sine"
    );
  }

  //###`fadeIn`
  //Fade a sprite in, over a duration in frames.
  ga.fadeIn = function(sprite, frames) {
    if (frames === undefined) frames = 60;
    return ga.tweenProperty(
      sprite, "alpha", sprite.alpha, 1, frames, "sine"
    );
  }

    //###`tweenProperty`
  //A low-level function that you can use to tween any sprite
  //property. It's used by all the higher-level tween functions,
  //but you can use it to create your own custom tween effects.

  ga.tweenProperty = function(
    sprite,                  //Sprite object
    property,                //String property
    startValue,              //Tween start value
    endValue,                //Tween end value
    totalFrames,             //Duration in frames
    type,                    //The easing type
    yoyo,                    //Yoyo?
    delayBeforeRepeat        //Delay in milliseconds before repeating
  ) {

    //Set defaults
    if (totalFrames === undefined) totalFrames = 60;
    if (type === undefined) type = "smoothstep";
    if (yoyo === undefined) yoyo = false;
    if (delayBeforeRepeat === undefined) delayBeforeRepeat = 0;

    //Create the tween object
    var o = {};

    //If the tween is a bounce type (a spline), set the
    //start and end magnitude values
    var typeArray = type.split(" ");
    if (typeArray[0] === "bounce") {
      o.startMagnitude = parseInt(typeArray[1]);
      o.endMagnitude = parseInt(typeArray[2]);
    }

    //Use `o.start` to make a new tween using the current
    //end point values
    o.start = function(startValue, endValue) {

      //Clone the start and end values so that any possible references to sprite
      //properties are converted to ordinary numbers 
      o.startValue = JSON.parse(JSON.stringify(startValue));
      o.endValue = JSON.parse(JSON.stringify(endValue));
      o.playing = true;
      o.totalFrames = totalFrames;
      o.frameCounter = 0;

      //Add the tween to the global `tweens` array. The `tweens` array is
      //updated on each frame
      ga.tweens.push(o);
    };

    //Call `o.start` to start the tween
    o.start(startValue, endValue);

    //The `update` method will be called on each frame by the game loop.
    //This is what makes the tween move
    o.update = function() {
      
      var time, curvedTime;

      if (o.playing) {

        //If the elapsed frames are less than the total frames,
        //use the tweening formulas to move the sprite
        if (o.frameCounter < o.totalFrames) {

          //Find the normalized value
          var normalizedTime = o.frameCounter / o.totalFrames;

          //Select the correct easing function from the 
          //`ease` object’s library of easing functions

          //If it's not a spline, use one of the ordinary easing functions
          if (typeArray[0] !== "bounce") {
            curvedTime = ease[type](normalizedTime);
          } 
          
          //If it's a spline, use the `spline` function and apply the
          //2 additional `type` array values as the spline's start and
          //end points
          else {
            curvedTime = ease.spline(normalizedTime, o.startMagnitude, 0, 1, o.endMagnitude);
          }

          //Interpolate the sprite's property based on the curve
          sprite[property] = (o.endValue * curvedTime) + (o.startValue * (1 - curvedTime));

          o.frameCounter += 1;
        }

        //When the tween has finished playing, run the end tasks
        else {
          o.end(); 
        }
      }
    };

    //The `end` method will be called when the tween is finished
    o.end = function() {

      //Set `playing` to `false`
      o.playing = false;

      //Call the tween's `onComplete` method, if it's been assigned
      if (o.onComplete) o.onComplete();

      //Remove the tween from the `tweens` array
      ga.tweens.splice(ga.tweens.indexOf(o), 1);

      //If the tween's `yoyo` property is `true`, create a new tween
      //using the same values, but use the current tween's `startValue`
      //as the next tween's `endValue` 
      if (yoyo) {
        ga.wait(delayBeforeRepeat, function() {
          o.start(o.endValue, o.startValue);
        });
      }
    };

    //Pause and play methods
    o.play = function() {o.playing = true;};
    o.pause = function() {o.playing = false;};
    
    //Return the tween object
    return o;
  }

  /*
  ###updateTweens
  `updateTweens` loops through all the sprites in `ga.particles`
  and runs their `updateParticles` functions.
  */

  ga.updateTweens = function() {
    
    //Update all the particles in the game.
    if (ga.tweens.length > 0) {
      for(var i = ga.tweens.length - 1; i >= 0; i--) {
        var tween = ga.tweens[i];
        if (tween) tween.update();
      }
    }
  }

  //Push `updateTweens` into the `ga.updateFunctions` array so that
  //it runs inside Ga's game loop. (See the `ga.update` method in the 
  //`ga.js` file to see how this works.
  ga.updateFunctions.push(ga.updateTweens);

  //###Easing functions
  //These are low-level functions that you won't use directly.
  //Instead, their used by the higher-level tweening functions.

  //Bezier curve
  ga.cubicBezier = function(t, a, b, c, d) {
    var t2 = t * t;
    var t3 = t2 * t;
    return a  
      + (-a * 3 + t * (3 * a - a * t)) * t
      + (3 * b + t * (-6 * b + b * 3 * t)) * t 
      + (c * 3 - c * 3 * t) * t2 + d * t3;
  }

  //The `ease` object. It stores all the easing functions
  var ease = {

    //Linear
    linear: function(x) {return x;},

    //Smoothstep
    smoothstep: function(x) {return x * x * (3 - 2 * x);},
    smoothstepSquared: function(x) {return Math.pow((x * x * (3 - 2 * x)), 2);},
    smoothstepCubed: function(x) {return Math.pow((x * x * (3 - 2 * x)), 3);},

    //Acceleration
    acceleration: function(x) {return x * x;},
    accelerationCubed: function(x) {return Math.pow(x * x, 3);},

    //Deceleration
    deceleration: function(x) {return 1 - Math.pow(1 - x, 2);},
    decelerationCubed: function(x) {return 1 - Math.pow(1 - x, 3);},

    //Sine
    sine: function(x) {return Math.sin(x * Math.PI / 2);},
    sineSquared: function(x) {return Math.pow(Math.sin(x * Math.PI / 2), 2);},
    sineCubed: function(x) {return Math.pow(Math.sin(x * Math.PI / 2), 2);},
    inverseSine: function(x) {return 1 - Math.sin((1 - x) * Math.PI / 2);},
    inverseSineSquared: function(x) {return 1 - Math.pow(Math.sin((1 - x) * Math.PI / 2), 2);},
    inverseSineCubed: function(x) {return 1 - Math.pow(Math.sin((1 - x) * Math.PI / 2), 3);},

    //Spline
    spline: function(t, p0, p1, p2, p3) {
      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
      );
    }
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
