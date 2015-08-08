var snowflake;

var STICKY = .8;  // 0 means change every time, 1 means stay on course
var D0 = {x:1, y:0};
var D1 = {x:.5,y:-0.86602540378444};

function Vec2(newX, newY){
	this.x = newX;
	this.y = newY;
};
	
function unit(originVec2, directionVec2){
	this.origin = new Vec2(originVec2.x, originVec2.y);
	this.direction = new Vec2(directionVec2.x, directionVec2.y);

	this.grow = function(){
	}
};

function setup() {
	createCanvas(windowWidth, windowHeight);
	snowflake = buildSkeleton();
}

function draw() {
	drawSnowflake({x:(width/4), y:(height/4*3)}, snowflake);
}

function drawSnowflake(origin, sf){
	var SCALAR = 4.0;
	for(var i = 0; i < sf.length; i++){
		ellipse(origin.x + sf[i].origin.x * SCALAR, origin.y + sf[i].origin.y * SCALAR, 4, 4);
		// line(origin.x + sf[i].x, origin.y + sf[i].y);
	}
}

function buildSkeleton(){
	var s = new Array();
	var start = new unit({x:(0),y:(0)}, {x:(1),y:(0)});
	s.push(start);
	for(var i = 1; i < 150; i++){  // do not start at 0 !
		var rand = random(0,1);
		var direction = s[i-1].direction;
		if(rand > STICKY){
			if(random(0,1) > .5){
				direction = D0
			}
			else{
				direction = D1
			}
		}
		var newX, newY;
		newX = s[i-1].origin.x + direction.x;
		newY = s[i-1].origin.y + direction.y;
		// console.log(direction);
		s.push(new unit({x:newX, y:newY}, direction));
	}

	for(var i = 0; i < 10; i++){
		var r = int(random(10,150));
		var newIndex = int(s.length-1);
		var newDirection;
		if(s[r].direction.x == D0.x){
			newDirection = D1;
		}
		else if(s[r].direction.y == D1.y){
			newDirection = D0;
		}
		var newPosition = new Vec2(s[r].origin.x+newDirection.x, s[r].origin.y + newDirection.y);
		s.push(new unit(newPosition, newDirection));
		// COPY CODE
		for(var j = 0; j < r; j++){
			var rand = random(0,1);
			var direction = s[newIndex-1].direction;
			if(rand > STICKY){
				if(random(0,1) > .5){
					direction = D0
				}
				else{
					direction = D1
				}
			}
			var newX, newY;
			console.log("SIZE " + s.length + "(" + int(j+newIndex) + ")");
			console.log("ORIGIN: " + s[j+newIndex].origin.x, s[j+newIndex].origin.y);
			newX = s[j+newIndex].origin.x + direction.x;
			newY = s[j+newIndex].origin.y + direction.y;
			// console.log(direction);
			var next = new unit(new Vec2(newX, newY), direction);
			s.push(next);
		}
	}
	return s;
}


function recursiveFunction(count){

}