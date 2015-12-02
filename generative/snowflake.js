var RIGHT = 1;
var LEFT = 0;
//sine and cosine 60deg increments, clockwise starting from 3:00
var DIRECTION = [
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444}
];

// snowflake growth animations
var ANIMATIONS = 1;  // 0 or 1, turn animations OFF or ON
var GROWTH_STEP = 1;

var ANIMATION_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
var ANIMATION_LENGTH = 30; // # of frames each growth cycle lasts
var ANIMATION_FRAME_NUM = 0;

var canvas;  // HTML canvas, for saving image
// drawing locations, based on screen resolution
var originSnowflake;
var originTree;

var tree;  // the snowflake

	var rightShorten = 10;
var DEPTH = 4;

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	if(!ANIMATIONS)
		noLoop();
	resizeOrigins();
	tree = new btree(undefined, 30);
}

// function mousePressed() {
// 	do{
// 		 = random(15);
// 		rightShorten = random(15);
// 	} while(rightShorten < );
// 	DEPTH = 8;
// 	tree = new btree(undefined, 30);
// 	console.log("New Snowflake L(" +  + ") R(" + rightShorten + ")");
// }

function mousePressed() {
	ANIMATION_FRAME_NUM = 0;
	makeSnowflake();
	draw();
}

function draw() {
	background(255);
	// a 30 deg line showing the crop position on the wedge
	// stroke(200);
	// line(originTree.x, originTree.y, originTree.x + 100*cos(30/180*Math.PI), originTree.y - 100*sin(30/180*Math.PI));

	animateGrowth(tree, ANIMATION_PROGRESS);
	stroke(0);
	drawTree(tree, originTree, 0);
	drawSnowflake(tree, originSnowflake);

	// save(canvas, 'output.png');
	if(ANIMATIONS){
		ANIMATION_FRAME_NUM = (ANIMATION_FRAME_NUM + 1) % ANIMATION_LENGTH;
		ANIMATION_PROGRESS = ANIMATION_FRAME_NUM / ANIMATION_LENGTH;
	
		if(ANIMATION_FRAME_NUM == 0){
			stopAllAnimations(tree);
			if(DEPTH > 0){
				makeSnowflake();
				DEPTH--;
			}
		}
	}
}

function makeSnowflake(){
	growTree(tree);
	// logTree(tree);
}

// animateGrowth taps into the "valueToBeGrown" and "valueAnimated" inside of each
// node, and increments / decrements each according to ANIMATION_PROGRESS, which
// goes from 0.0 to 1.0, signaling end of growth cycle
function animateGrowth(tree, progress){
	findLeaves(tree, progress);
	function findLeaves(tree, progress){  // progress is 0.0 to 1.0
		// ANIMATIONS
		// if(tree.length.valueToBeGrown != undefined){
		tree.length.animate(progress);
		tree.thickness.animate(progress);
		// }
		if(tree.left){
			findLeaves(tree.left, progress);
		}
		if(tree.right){
			findLeaves(tree.right, progress);
		}
	}
}

function stopAllAnimations(tree){
	findLeaves(tree);
	function findLeaves(tree){  // progress is 0.0 to 1.0
		// ANIMATIONS
		tree.length.stopAnimation();
		tree.thickness.stopAnimation();
		if(tree.left){
			findLeaves(tree.left);
		}
		if(tree.right){
			findLeaves(tree.right);
		}
	}
}


function growTree(tree, params){
	// var density = params["density"];
	// var pressure = params["pressure"];
	// var time = params["time"];
	// var time = 5;
	findLeaves(tree);
	setGlobalTreeVariables(tree);

	function findLeaves(tree){
		var hasChild = false;
		if(tree.left){
			hasChild = true;
			findLeaves(tree.left);
		}
		if(tree.right){
			hasChild = true;
			findLeaves(tree.right);
		}
		if(!hasChild && !tree.dead){
			// do the thing
			if(random(10) < 5){
				if(tree.length.value > 0){
					tree.addLeftChild(tree.length.value)
				}
			}
			else{
				if(tree.length.value - rightShorten > 0 && tree.length.value > 0){
					//make this relate to how many right turns, not right or left branch
					tree.addChildren(tree.length.value, tree.length.value - rightShorten);
				}
			}
		}
	}
}

// performs the necessary fixes to this specific problem
// and returns true if boundary was crossed and adjustments made
function checkBoundaryCrossing(startNode, endNode){
	// extract euclidean locations from parent and child
	var start = startNode.location;
	var end = endNode.location;
	// perform boundary check against 30 deg line
	var result = RayLineIntersect(
		{x:0, y:0}, 
		{x:(cos(30/180*Math.PI)), y:(sin(30/180*Math.PI))}, 
		{x:start.x, y:abs(start.y)}, 
		{x:end.x, y:abs(end.y)}
		);
	// if result, boundary was crossed
	if(result != undefined){
		// result is new intersection
		// infer new value: distance from start to new intersection
		var newLength = Math.sqrt( (result.x-start.x)*(result.x-start.x) + (result.y-abs(start.y))*(result.y-abs(start.y)) );
		endNode.length.set(newLength);
		endNode.location = {
			x:(start.x + newLength * DIRECTION[endNode.direction].x), 
			y:(start.y + newLength * DIRECTION[endNode.direction].y)
		};
		endNode.dead = true;
		return true;
	}
	return false;
}

function setGlobalTreeVariables(tree){
	// it's unclear how useful the second step is
	// there may not be any reason to store the same variable
	//   inside every node
	var searchedMaxGeneration = 0;
	findGlobals(tree);
	setGlobals(tree);

	function findGlobals(node){
		if(node.generation > searchedMaxGeneration)
			searchedMaxGeneration = node.generation;
		if(node.left)
			findGlobals(node.left);
		if(node.right)
			findGlobals(node.right);
	}
	function setGlobals(node){
		node.maxGeneration = searchedMaxGeneration;
		if(node.left)
			setGlobals(node.left);
		if(node.right)
			setGlobals(node.right);
	}
}

function mod6(input){
	// throw in any value, negatives included, returns 0-5
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
}

function animatableValue(input){
	this.set = function(input){
		if(ANIMATIONS){
			this.valueToBeGrown = input;
			this.valueAnimated = 0;
		}
		else{
			this.valueToBeGrown = undefined;
			this.valueAnimated = undefined;
		}
		this.value = input;
	}
	this.animate = function(progress){
		if(progress == 1.0){
			// THIS NEVER HAPPENS
			this.valueAnimated = this.value;
			this.valueToBeGrown = undefined;
		}
		else if (this.valueToBeGrown != undefined && progress >= 0.0 && progress < 1.0){
			this.valueAnimated = this.value - this.valueToBeGrown * (1.0 - progress);
		}
	}
	this.stopAnimation = function(){
		this.valueToBeGrown = undefined;
		this.animatableValue = this.value;
	}

	this.value;
	this.valueAnimated;
	this.valueToBeGrown;
	this.increment = 1;

	this.set(input);
}

var LENGTH_TO_THICKNESS_RATIO = 0.3;

function btree(parent, length){
// nodes contain:  value (magnitude)
				// childType (LEFT or RIGHT)
				// dead (T/F: force node into leaf)
				// generation (number child away from top)
				// branchesR (number of cumulative right branches)
				// location ({x,y} position in euclidean space)
	if(length == undefined)
		length = 0;

	this.length = new animatableValue(length);
	this.thickness = new animatableValue(length * LENGTH_TO_THICKNESS_RATIO);
	this.age = 0;

	this.childType;
	this.location;
	this.dead; // set true, force node to be a leaf
	this.branchesR;
	this.maxGeneration = 0;

	// manage properties related to the data structure
	this.parent = parent;
	if(parent)
		this.generation = parent.generation+1;
	else{
		// this is the beginning node of the tree, set initial conditions
		this.generation = 0;
		this.direction = 0;
		this.branchesR = 0;
		this.location = {
			x:(0.0 + this.length.value * DIRECTION[this.direction].x), 
			y:(0.0 + this.length.value * DIRECTION[this.direction].y)
		};
	}
	this.right = undefined;
	this.left = undefined;

	this.addChildren = function(leftLength, rightLength){
		this.addLeftChild(leftLength);
		this.addRightChild(rightLength);
	}
	this.addLeftChild = function(leftLength){
		this.left = new btree(this, leftLength);
		this.left.childType = LEFT;
		this.left.parent = this;
		this.left.direction = this.direction;
		this.left.branchesR = this.branchesR;
		this.left.location = {
			x:(this.location.x + this.left.length.value * DIRECTION[this.left.direction].x), 
			y:(this.location.y + this.left.length.value * DIRECTION[this.left.direction].y)
		};		
		var boundaryAdjust = false;
		boundaryAdjust |= checkBoundaryCrossing(this, this.left);
	}
	this.addRightChild = function(rightLength){
		this.right = new btree(this, rightLength);
		this.right.childType = RIGHT;
		this.right.parent = this;
		this.right.direction = mod6(this.direction+1);
		this.right.branchesR = this.branchesR + 1;
		this.right.location = {
			x:(this.location.x + this.right.length.value * DIRECTION[this.right.direction].x), 
			y:(this.location.y + this.right.length.value * DIRECTION[this.right.direction].y)
		};
		var boundaryAdjust = false;
		boundaryAdjust |= checkBoundaryCrossing(this, this.right);
	}
}

// GEOMETRY

function RayLineIntersect(origin, dV, pA, pB){
	// if intersection, returns point of intersection
	// if no intersection, returns undefined
	var v1 = { x:(origin.x - pA.x), y:(origin.y - pA.y) };
	var v2 = { x:(pB.x - pA.x), y:(pB.y - pA.y) };
	var v3 = { x:(-dV.y), y:(dV.x) };
	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
	var p = undefined;
	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
		var dAB = {x:undefined,y:undefined};
		var lengthAB = Math.sqrt( (pB.x-pA.x)*(pB.x-pA.x) + (pB.y-pA.y)*(pB.y-pA.y) );
		dAB.x = (pB.x - pA.x) / lengthAB;
		dAB.y = (pB.y - pA.y) / lengthAB;
		p = {x:(pA.x + lengthAB * t2 * dAB.x), y:(pA.y + lengthAB * t2 * dAB.y)};
	}
	return p;
}

// DRAWING & RENDERING

function drawTree(tree, start, angleDepth){
	if(tree != undefined){
		if(tree.left != undefined){
			drawTree(tree.left, {x:start.x + tree.length.value * DIRECTION[angleDepth].x, y:start.y + tree.length.value * DIRECTION[angleDepth].y}, angleDepth);
		}
		if(tree.right != undefined){
			drawTree(tree.right, {x:start.x + tree.length.value * DIRECTION[angleDepth].x, y:start.y + tree.length.value * DIRECTION[angleDepth].y}, mod6(angleDepth+1));
		}
		var length;
		if(ANIMATIONS)
			length = tree.length.valueAnimated;
		else
			length = tree.length.value;
		end = {x:(start.x + length * DIRECTION[angleDepth].x),
			   y:(start.y + length * DIRECTION[angleDepth].y)};
		line(start.x, start.y, end.x, end.y);
		ellipse(end.x, end.y, 5, 5);
	}
}


// function drawSnowflake(tree, location){
// 	for(var i = 0; i < 6; i++)
// 		drawTreeWithReflections(tree, location, i);

// 	function drawTreeWithReflections(tree, location, angle){
// 		if(tree != undefined){

// 			var length;
// 			if(ANIMATIONS)
// 				length = tree.valueAnimated;
// 			else
// 				length = tree.value;

// 			var start = location;
// 			var end = {
// 				x:(location.x + length * DIRECTION[angle].x), 
// 				y:(location.y + length * DIRECTION[angle].y)
// 			};

// 			// stroke(0 + (200/tree.maxGeneration)*tree.generation);
// 			line(start.x, start.y, end.x, end.y);
// 			// ellipse(end.x, end.y, 5, 5);

// 			if(tree.left != undefined)
// 				drawTreeWithReflections(tree.left, end, angle);
// 			if(tree.right != undefined){
// 				drawTreeWithReflections(tree.right, end, mod6(angle+1) );
// 				drawTreeWithReflections(tree.right, end, mod6(angle-1) );
// 			}
// 		}
// 	}
// }

function drawSnowflake(tree, location){

	drawCenterHexagon(tree, location);
	var length;
	if(ANIMATIONS){
		length = tree.length.valueAnimated;
	}
	else{
		length = tree.length.value;
	}
	for(var angle = 0; angle < 6; angle++){
		var end = {
			x:(location.x + length * DIRECTION[mod6(angle)].x),
			y:(location.y + length * DIRECTION[mod6(angle)].y) };
		if(tree.left != undefined ){
			drawHexagonTreeWithReflections(tree.left, end, angle);
		}
		if(tree.right != undefined){
			drawHexagonTreeWithReflections(tree.right, end, mod6(angle+1));
			drawHexagonTreeWithReflections(tree.right, end, mod6(angle-1));
		}
	}

	function drawCenterHexagon(tree, start){
		var length;
		if(ANIMATIONS){
			length = tree.length.valueAnimated;
		}
		else{
			length = tree.length.value;
		}
		for(var angle = 0; angle < 6; angle++){
			var point1 = {
					x:(start.x + length * DIRECTION[mod6(angle)].x),
					y:(start.y + length * DIRECTION[mod6(angle)].y) };
			var point2 = {
					x:(start.x + length * DIRECTION[mod6(angle+1)].x),
					y:(start.y + length * DIRECTION[mod6(angle+1)].y) };
			line(point1.x, point1.y, point2.x, point2.y);
		}
	}
	function drawHexagonTreeWithReflections(tree, start, angle){
		var VOLUME = 8;
		if(tree != undefined){
			var length;
			if(ANIMATIONS)
				length = tree.length.valueAnimated;
			else
				length = tree.length.value;
			var end = {
				x:(start.x + length * DIRECTION[angle].x), 
				y:(start.y + length * DIRECTION[angle].y)
			};
			// first go to the bottom of tree, following the main stem
			if(tree.left != undefined)
				drawHexagonTreeWithReflections(tree.left, end, angle);

			stroke(0);
			var aliveWhole = tree.maxGeneration - tree.generation;
			var alivePart = 0;
			if(ANIMATIONS){
				alivePart = 1.0 - ((tree.length.value - tree.length.valueAnimated)) / tree.length.value;
			}
			// VOLUME = (aliveWhole + alivePart) * 3;
			// stroke(0 + (200/DEPTH)*tree.generation);
			// VOLUME = 50 - 50 * (tree.generation / tree.maxGeneration) + 1 + random(2);
			var point1a, point1b, point2a, point2b;
			// var distance = sqrt(Math.pow(end.x - start.x,2) + Math.pow(end.y - start.y,2) );
			var flush = 1;  // 1 or 2
			if(tree.childType == LEFT)
				flush = 2;
			if( VOLUME > length ){ 
				point1a = {
					x:(start.x + length * DIRECTION[mod6(angle-flush)].x),
					y:(start.y + length * DIRECTION[mod6(angle-flush)].y) };
				point1b = {
					x:(start.x + length * DIRECTION[mod6(angle+flush)].x),
					y:(start.y + length * DIRECTION[mod6(angle+flush)].y) };
				point2a = {
					x:(end.x - length * DIRECTION[mod6(angle+1)].x),
					y:(end.y - length * DIRECTION[mod6(angle+1)].y) };
				point2b = {
					x:(end.x - length * DIRECTION[mod6(angle-1)].x),
					y:(end.y - length * DIRECTION[mod6(angle-1)].y) };
			}
			else{
				point1a = {
					x:(start.x + VOLUME * DIRECTION[mod6(angle-flush)].x),
					y:(start.y + VOLUME * DIRECTION[mod6(angle-flush)].y) };
				point1b = {
					x:(start.x + VOLUME * DIRECTION[mod6(angle+flush)].x),
					y:(start.y + VOLUME * DIRECTION[mod6(angle+flush)].y) };
				point2a = {
					x:(end.x - VOLUME * DIRECTION[mod6(angle+1)].x),
					y:(end.y - VOLUME * DIRECTION[mod6(angle+1)].y) };
				point2b = {
					x:(end.x - VOLUME * DIRECTION[mod6(angle-1)].x),
					y:(end.y - VOLUME * DIRECTION[mod6(angle-1)].y) };
			}

			// line(start.x, start.y, end.x, end.y);       // the major artery
			line(start.x, start.y, point1a.x, point1a.y);
			line(start.x, start.y, point1b.x, point1b.y);

			line(point1a.x, point1a.y, point2a.x, point2a.y);
			line(point1b.x, point1b.y, point2b.x, point2b.y);

			line(point2a.x, point2a.y, end.x, end.y);
			line(point2b.x, point2b.y, end.x, end.y);

			if(tree.right != undefined){
				drawHexagonTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawHexagonTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
		}
	}
}

function drawSnowflakeTree(tree, location){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, location, i);
	function drawTreeWithReflections(tree, location, angle){
		if(tree != undefined){
			var length;
			if(ANIMATIONS){
				length = tree.length.valueAnimated;
			}
			else{
				length = tree.length.value;
			}
			var start = location;
			var end = {
				x:(location.x + length * DIRECTION[angle].x), 
				y:(location.y + length * DIRECTION[angle].y)
			};
			// stroke(0 + (200/tree.maxGeneration)*tree.generation);
			line(start.x, start.y, end.x, end.y);
			// ellipse(end.x, end.y, 5, 5);
			if(tree.left != undefined)
				drawTreeWithReflections(tree.left, end, angle);
			if(tree.right != undefined){
				drawTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
		}
	}
}


function resizeOrigins(){
	if(windowWidth > windowHeight){
		originSnowflake = {x:windowWidth*.66, y:windowHeight*.5};
		originTree = {x:windowWidth*.066, y:windowHeight*.66};
	}
	else{
		originSnowflake = {x:windowWidth*.5, y:windowHeight*.4};
		originTree = {x:windowWidth*.3, y:windowHeight*.933};
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	resizeOrigins();
}

function logTree(node){
	if(node != undefined){
		var hasChildren = false;
		if(node.left != undefined || node.right != undefined)
			hasChildren = true;
		var thisChildType;
		if(node.childType == LEFT) thisChildType = "left";
		if(node.childType == RIGHT) thisChildType = "right";
		console.log("Node (" + 
			node.generation + "/" + 
			node.maxGeneration + ") LENGTH:(" + 
			node.length.value + ") PARENT:(" + 
			hasChildren + ") TYPE:(" + 
			node.childType + ") RIGHT BRANCHES:(" + 
			node.branchesR + ") (" + 
			node.location.x + "," +
			node.location.y + ")");
		logTree(node.left);
		logTree(node.right);
	}
}