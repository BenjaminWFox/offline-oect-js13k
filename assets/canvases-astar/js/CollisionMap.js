define(function(){
	
	function CollisionMap(options){
		this.map = options.map;
	}

	CollisionMap.prototype.getPosition = function(isY, x, y, intent){
		var newPosition = isY ? y : x,
			tryPosition = isY ? Math.floor(y+intent) : Math.floor(x+intent);

		if(isY && !this.map[tryPosition+1][Math.floor(x)+1]){
			newPosition = y+intent;
		}else if(!isY && !this.map[Math.floor(y)+1][tryPosition+1]){
			newPosition = x+intent;
		}
		return newPosition;
	};


	return CollisionMap;

});