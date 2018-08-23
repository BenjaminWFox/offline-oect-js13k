define(['Renderer'],function(Renderer){

	return Renderer.extend({
		constructor: function(options){
			this.map = options.map;
			this.tileSet = options.tileSet;
			this.tileSpec = this.tileSet.getTileSpec();

			Renderer.prototype.constructor.call(this,options);
		},
		draw: function(){
			var self = this;

			this.context.clearRect(0, 0, this.w, this.h);

			_(this.map).each(function(row, i){
				_(row).each(function(tileId, j){
					if(tileId){
						self.drawTile(self.tileSet.sprite, tileId, j, i);
					}
				});
			});
		}
	});

});