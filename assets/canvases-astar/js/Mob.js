define(['Agent',
		'lib/astar'],
function(Agent,
		astar){
	
	return Agent.extend({
		constructor: function(options){
			options = options || {};
			this.targetAgent = options.targetAgent;

			Agent.prototype.constructor.call(this,options);

			this.walkableMap = _(this.collision.map).map(function(row){
				return _(row).map(function(tileId){
					return tileId === 0 ? 'w' : 'u'
				});
			});
		},
		getWalkableMap: function(){
			return _(this.walkableMap).map(function(row){
					return _(row).map(function(tile){
						return tile;
					});
				});
		},
		getAStarMovement: function(){
			var map = this.getWalkableMap(),
				path;

			map[~~(this.position.y)][~~(this.position.x)] = 's';
			map[~~(this.targetAgent.position.y)][~~(this.targetAgent.position.x)] = 'g';
			
			path = astar(map,'manhattan',true);

			if(path && path.length>1){
				return {
						x: path[1].col,
						y: path[1].row
					};
			}
			return this.position;
		},
		moveToTarget: function(){
			var nextMove = this.getAStarMovement(),
				dx = nextMove.x - this.position.x,
				dy = nextMove.y - this.position.y,
				moveX = dx*0.03,
				moveY = dy*0.03;

			if(moveX){
				moveX = Math.abs(moveX)/moveX * Math.max(moveX,0.05);
			}
			if(moveY){
				moveY = Math.abs(moveY)/moveY * Math.max(moveY,0.05);
			}

			this.doMove(moveX,moveY);
		},
		atTarget: function(){

		},
		chooseAction: function(){
			if(
				Math.abs(this.position.y - this.targetAgent.position.y) < 1
				&&
				Math.abs(this.position.x - this.targetAgent.position.x) < 1
			){
				this.atTarget();
			}else{
				this.moveToTarget();
			}
		}
	});

});