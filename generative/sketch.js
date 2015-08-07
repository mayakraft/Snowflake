	
function setup() {
	createCanvas(windowWidth, windowHeight);
}

function draw() {
	ellipse(width/2, height/2, 50, 50);
}

function stem(originVec2, directionVec2, mass){
	this.origin.x = originVec2.x;
	this.origin.y = originVec2.y;
	this.direction.x = directionVec2.x;
	this.direction.y = directionVec2.y;
	this.mass = mass;

	this.grow = function(){
	}
};

function buildSkeleton(){
	var start = new vec2(0,0);
	for(var i = 0; i < 50; i++){
		var s = new stem();
	}
}


function recursiveFunction(count){

}