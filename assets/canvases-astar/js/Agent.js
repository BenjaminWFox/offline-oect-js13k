define(function(){
	
	return Toolbox.Base.extend({
		constructor: function(options){
			this.position = options.position || {x:0,y:0};
			this.collision = options.collision;
			this.tileset = options.tileset;
		},
		doMove: function(moveX,moveY){
			this.position.x = this.collision.getPosition(0, this.position.x, this.position.y, moveX);
			this.position.y = this.collision.getPosition(1, this.position.x, this.position.y, moveY);
		},
		setPosition: function(pos){
			pos = pos || {};
			this.position.x = pos.x || 0;
			this.position.y = pos.y || 0;
		},
		getSprite: function(){
			return this.tileset.sprite;
		},
		getTileId: function(){
			return (Math.floor(new Date().getTime()/500)%2) ? 'standing' : 'standing_alt';
		},
		getTileSpec: function(){
			return this.tileset.tileSpec;
		}
	});

});