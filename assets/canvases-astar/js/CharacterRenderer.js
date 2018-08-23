define(['Renderer'],function(Renderer){

	return Renderer.extend({
		constructor: function(options){
			this.agents = options.agents;

			Renderer.prototype.constructor.call(this,options);
		},
		draw: function(){
			var self = this;

			this.context.clearRect(0, 0, this.w, this.h);

			_(this.agents).each(function(agent){
				self.tileSpec = agent.getTileSpec();
				self.drawTile(agent.getSprite(), agent.getTileId(), agent.position.x, agent.position.y);
			});
		}
	});

});