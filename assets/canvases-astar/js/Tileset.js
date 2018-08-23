define(function(){
	
	function Tileset(options){
		this.onspriteload = options.onspriteload || function(){};
		this.onReadyCb = options.onReady || function(){};
		this.tileSpec = options.tileSpec || {};

		this.sprite = new Image();
		this.sprite.onload = this.onSpriteLoad.bind(this);
		this.spriteLoaded = false;
		this.sprite.src = options.spritePath;

		$.getJSON(options.specPath, this.onSpecLoad.bind(this));
	}

	Tileset.prototype.onSpriteLoad = function(e){
		this.spriteLoaded = true;
		this.onReady();
	};

	Tileset.prototype.onSpecLoad = function(data){
		this.specLoaded = true;
		this.tileSpec = data;
		this.onReady();
	};

	Tileset.prototype.onReady = function(){
		if(this.specLoaded && this.spriteLoaded && _.isFunction(this.onReadyCb)){
			this.onReadyCb();
		}
	};

	Tileset.prototype.getSprite = function(){
		return this.sprite;
	};

	Tileset.prototype.getTileSpec = function(){
		return this.tileSpec;
	};

	return Tileset;

});