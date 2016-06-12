var snowflake;

var snowflakePosition;

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	resizeOrigins();
	frameRate(10);
	// make atmosphere
	var atmos = new Atmosphere(8);
	console.log(atmos);

	snowflake = new Snowflake();
	snowflake.grow(atmos);
	logTree(snowflake.tree);

	// noLoop();
}

function mousePressed() {

}

function draw() {
	background(128);
	stroke(0);
	fill(255, 80);
	var treePosition = {'x':windowWidth*.5, 'y':windowHeight*.5};
	drawRightBranchingBinaryTree(snowflake.tree, treePosition);
	noStroke();
	snowflake.draw(snowflakePosition);
}

function resizeOrigins(){
	if(windowWidth > windowHeight)
		snowflakePosition = {x:windowWidth*.5, y:windowHeight*.5};
	else
		snowflakePosition = {x:windowWidth*.5, y:windowHeight*.5};
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	resizeOrigins();
}