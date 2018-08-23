define(function(){

	return Toolbox.Base.extend({
		constructor: function(options){
			this.$el = options.$el;

			this.w = this.$el.width();
			this.h = this.$el.height();

			this.tileSize = options.tileSize || 24;
			this.context = this.$el.get(0).getContext('2d');

			this.draw();
		},
		drawTile: function(sprite, tileId, x, y){
			var tilePos = this.tileSpec[tileId];

			if(!tilePos){ return; }

			this.context.drawImage(
				sprite,
				tilePos.x, tilePos.y, this.tileSize, this.tileSize, // source coords
				Math.floor(x * this.tileSize), Math.floor(y * this.tileSize), this.tileSize, this.tileSize // canvas coords
			);
		}
	});

});