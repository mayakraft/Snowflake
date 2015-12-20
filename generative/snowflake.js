// Algorithmic Snowflake
//
// sorry bad at javascript
//
// vocabulary:
//  TREE: the snowflake is a binary tree, "var tree" is the head
//  CYCLE: one growth cycle
//  FRAME: a CYCLE contain many FRAMES


// PROGRAM PARAMETERS
const ANIMATIONS = 1;  // 0 or 1, turn animations OFF or ON

// enum sine and cosine 60deg increments for quick lookup 
// clockwise starting from 3:00
var DIRECTION = [
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444}
];
var RIGHT = 1;
var LEFT = 0;
// these refer to the animation cycle, the time between 2 frames of growth
var CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
var CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
var CYCLE_FRAME = 0;
var CYCLE_NUM = 0;
// canvas stuff
var canvas;  // HTML canvas, for saving image
var originSnowflake;  // screen coordinates
var originTree;       // screen coordinates

var tree;  // the snowflake data model
// GENERATOR PARAMETERS 
var rightShorten = .666;
var DEPTH = 7;
var LENGTH_TO_THICKNESS_RATIO = 0.8;

var noiseOff;

var atmosphere = [.8, .6, .3, .1, .05, .2, .6, .9];

// var atmosphere = [{ "length":30, "thickness":20},
//                   { "length":30, "thickness":20},
//                   { "length":30, "thickness":20},
//                   { "length":30, "thickness":20},
//                   { "length":30, "thickness":20},
//                   { "length":30, "thickness":20},
//                  ];

////////////////////////////////
//  P5.JS
//////////////////////////////
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	if(!ANIMATIONS)
		noLoop();
	// else{
	// 	setInterval(
	// 		function(){
	// 			DEPTH = 3;
	// 			CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
	// 			CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
	// 			CYCLE_FRAME = 0;
	// 			CYCLE_NUM = 0;
	// 			tree = new binaryTree(undefined, {"length":40});
	// 		}, 8000);
	// }
	resizeOrigins();
	tree = new binaryTree(undefined, {"length":50, "thickness":30});
	frameRate(60);
}
function mousePressed() {
	DEPTH++;
	if(!ANIMATIONS){
		growTree(tree);
		draw(tree);
	}
}
function draw() {
	background(0);
	// a 30 deg line showing the crop position on the wedge
	// stroke(200);
	// line(originTree.x, originTree.y, originTree.x + 200*cos(30/180*Math.PI), originTree.y - 200*sin(30/180*Math.PI));

	fill(40, 255);
	beginShape();
	var SLICE_LENGTH = 140;
	vertex(originTree.x, originTree.y);
	vertex(originTree.x + SLICE_LENGTH*cos(30/180*Math.PI), originTree.y - SLICE_LENGTH*sin(30/180*Math.PI));
	vertex(originTree.x + SLICE_LENGTH/(sqrt(3)*.5), originTree.y);
	endShape(CLOSE);

	stroke(255);
	noFill();
	drawTree(tree, originTree, 0);
	noStroke();
	fill(255, 80);
	drawSnowflake(tree, originSnowflake);
	// stroke(0);
	// drawSnowflakeTree(tree, originSnowflake);
	// save(canvas, 'output.png');
	if(ANIMATIONS){
		CYCLE_PROGRESS = CYCLE_FRAME / CYCLE_LENGTH;

		animateGrowth(tree, CYCLE_PROGRESS);
	
		if(CYCLE_FRAME >= CYCLE_LENGTH && DEPTH > 0){
			CYCLE_NUM++;
			CYCLE_FRAME = 0;
			DEPTH--;
			CYCLE_PROGRESS = CYCLE_FRAME / CYCLE_LENGTH;
			stopAllAnimations(tree);
			growTree(tree);
		}
		if(CYCLE_FRAME < CYCLE_LENGTH)
			CYCLE_FRAME++;
	}
}
///////////////////////////////
//  SNOWFLAKE GROWING
///////////////////////////////
// animateGrowth taps into the "valueToBeGrown" and "valueAnimated" inside of each
// node, and increments / decrements each according to CYCLE_PROGRESS, which
// goes from 0.0 to 1.0, signaling end of growth cycle
function animateGrowth(tree, progress){
	findLeaves(tree, progress);
	function findLeaves(tree, progress){  // progress is 0.0 to 1.0
		// ANIMATIONS
		tree.length.animate(progress);
		tree.thickness.animate(progress);
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

var lengthThisTime = 1.0;

function growTree(tree, params){
	// var density = params["density"];
	// var pressure = params["pressure"];
	// var time = params["time"];
	// var time = 5;

	// lengthThisTime = Math.pow(noise(noiseOff)*2.0,1.5);
	lengthThisTime = .8;
	// noiseOff += .1;

	findLeaves(tree);
	setGlobalTreeVariables(tree);
	operateOnEntireTree(tree);

	function operateOnEntireTree(tree){

		
		// run neighbor arm too near on all the leaves
		if(tree.left != undefined)
			operateOnEntireTree(tree.left);
		if(tree.right != undefined)
			operateOnEntireTree(tree.right);
		if(tree.left == undefined && tree.right == undefined)
			neighborArmTooNear(tree);

		function neighborArmTooNear(tree){
			var stepsUp = traverseUpUntilBranch(tree, 0);
			if(stepsUp != -1)
				console.log("Steps Back: " + stepsUp);
			function innerHuntForNextBranch(tree, howManyUp){

			}
			function traverseUpUntilBranch(tree, howManyUp){
				if(tree.parent == undefined){
					return -1;
				}
				if(tree.childType == LEFT){
					return traverseUpUntilBranch(tree.parent, howManyUp+1);
				}
				else{
					return howManyUp+1;
				}
			}
		}

	}

	function findLeaves(tree){
		function growThicker(tree){
			// tree.length.set(tree.length.value*1.1);
			if(tree.age < 3){
				if(tree.maxGeneration - tree.generation == 0)
					tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+2))) );
				else if(tree.maxGeneration - tree.generation == 1)
					tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+3))) );
				else if(tree.maxGeneration - tree.generation == 2)
					tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+4))) );
			}
			// tree.thickness.set(tree.thickness.value*1.1);
		}
		var hasChild = false;
		if(tree.left){
			// growThicker(tree);
			hasChild = true;
			findLeaves(tree.left);
		}
		if(tree.right){
			// growThicker(tree);
			hasChild = true;
			findLeaves(tree.right);
		}
	// GROW MORE CRYSTALS
		if(!hasChild && !tree.dead){
			// first branch only
			if(tree.parent == undefined){
				// tree.addLeftChild(tree.length.value * 3);//lengthThisTime)
				var newLength = tree.length.value * random(3);
				if(newLength < tree.length.value)
					newLength = tree.length.value + 10;
				var newThickness = newLength * random(LENGTH_TO_THICKNESS_RATIO);
				tree.addLeftChild({"length":newLength, "thickness": newThickness});//lengthThisTime)
			}
			// all other generations
			else if(tree.branchesR < 3){
				var shortenby = Math.pow(rightShorten, tree.branchesR);
				if(tree.length.value * lengthThisTime * shortenby > 1 && tree.length.value > 0){
					//make this relate to how many right turns, not right or left branch
					var newLength = tree.length.value * random(1.3);
					if(newLength < 30)
						newLength = 30;
					if(tree.thickness.value > newLength){
						console.log("adjusting value");
						newLength = tree.thickness.value + 3;
					}
					var newThickness = newLength * random(LENGTH_TO_THICKNESS_RATIO);
					if(random(10) < 8){
						// before adding right child, check with tree.parent.left
						// if it exists, make right shorter than tree.parent.left's length
						tree.addChildren({"length":newLength, "thickness":newThickness}, {"length":newLength * .7, "thickness":newThickness * .7});
						// tree.addChildren(
						// 	tree.length.value * lengthThisTime, 
						// 	tree.length.value * lengthThisTime * shortenby);
					}
					else{
						tree.addLeftChild({"length":newLength, "thickness":newThickness});
						// tree.addLeftChild(tree.length.value * lengthThisTime);
					}
				}
			}
		}
		growThicker(tree);
	}
}
/////////////////////////////
//  DATA STRUCTURES
////////////////////////////////
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
		node.age = searchedMaxGeneration - node.generation + 1; 
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

// zeroPoint is lower bounds of growth
function animatableValue(input, zeroPointIn){
	this.set = function(input, zeroPointIn){
		if(zeroPointIn == undefined){
			if(this.value != undefined){
				zeroPointIn = this.value;
			}
			else{
				zeroPointIn = 0;
			}
		}
		this.zeroPoint = zeroPointIn;
		this.value = input;
		if(ANIMATIONS){
			this.valueToBeGrown = input - this.zeroPoint;
			this.valueAnimated = this.zeroPoint;
		}
		else{
			this.valueToBeGrown = undefined;
			this.valueAnimated = undefined;
		}
	}
	this.animate = function(progress){
		if(progress == 1.0){
			// THIS NEVER HAPPENS
			this.valueAnimated = this.value;
			this.valueToBeGrown = undefined;
		}
		else if (this.valueToBeGrown != undefined && progress >= 0.0 && progress < 1.0){
			this.valueAnimated = this.value - (this.valueToBeGrown) * (1.0 - progress);
		}
	}
	this.stopAnimation = function(){
		this.valueToBeGrown = undefined;
		this.animatableValue = this.value;
	}
	this.get = function(){
		if(ANIMATIONS) 
			return this.valueAnimated;
		else
			return this.value;
	}

	this.value;
	this.valueAnimated;
	this.zeroPoint = zeroPointIn;
	this.valueToBeGrown;
	
	this.set(input, zeroPointIn);
}

// data is expecting to contain {"length": ... , "thickness:" ... , }
function binaryTree(parent, data){
// nodes contain:  value (magnitude)
				// childType (LEFT or RIGHT)
				// dead (T/F: force node into leaf)
				// generation (number child away from top)
				// branchesR (number of cumulative right branches)
				// location ({x,y} position in euclidean space)
	// fix inputs
	if(data.length == undefined)
		data.length = 0;

	this.parent = parent;
	this.right = undefined;
	this.left = undefined;
	this.childType;
	this.location;
	this.dead; // set true, force node to be a leaf
	this.branchesR;
	this.age;    // how many generations old this node is  (maxGenerations - this.generation)
	this.maxGeneration = 0;
	// each node has a persisting set of random values that can be assigned to anything
	this.randomValue = [ random(0,10), random(0,10), random(0,10), random(0,10), random(0,10), random(0,10) ];  

	// manage properties related to the data structure
	if(parent){
		this.generation = parent.generation+1;
		// IMPORTANT: this jumps the growth by "parent.thickness", gives it a head start
		this.length = new animatableValue(data.length, 0);//parent.thickness.value);
		this.thickness = new animatableValue(data.thickness, 0);
		// HERE: no head start
		// this.length = new animatableValue(length, 0);
	}else{
		// this is the beginning node of the tree, set initial conditions
		this.generation = 0;
		this.direction = 0;
		this.branchesR = 0;
		this.age = 1;
		this.length = new animatableValue(data.length, 0);
		this.thickness = new animatableValue(data.thickness, 0);
		this.location = {
			x:(0.0 + length * DIRECTION[this.direction].x), 
			y:(0.0 + length * DIRECTION[this.direction].y)
		};
	}

	this.addChildren = function(leftData, rightData){//leftLength, rightLength){
		this.addLeftChild(leftData);
		this.addRightChild(rightData);
	}
	this.addLeftChild = function(leftData){//leftLength){
		this.left = new binaryTree(this, leftData);
		this.left.childType = LEFT;
		this.left.direction = this.direction;
		this.left.branchesR = this.branchesR;
		this.left.location = {
			x:(this.location.x + this.left.length.value * DIRECTION[this.left.direction].x), 
			y:(this.location.y + this.left.length.value * DIRECTION[this.left.direction].y)
		};		
		var newLength = checkBoundaryCrossing(this, this.left);
		if(newLength != undefined){
			console.log("shortening left child");
			makeNodeDead(this.left, newLength, newLength * LENGTH_TO_THICKNESS_RATIO);
		}
	}
	this.addRightChild = function(rightData){//rightLength){
		this.right = new binaryTree(this, rightData);
		this.right.childType = RIGHT;
		this.right.direction = mod6(this.direction+1);
		this.right.branchesR = this.branchesR + 1;
		this.right.location = {
			x:(this.location.x + this.right.length.value * DIRECTION[this.right.direction].x), 
			y:(this.location.y + this.right.length.value * DIRECTION[this.right.direction].y)
		};
		var newLength = checkBoundaryCrossing(this, this.right);
		if(newLength != undefined){
			console.log("shortening right child");
			makeNodeDead(this.right, newLength, newLength * LENGTH_TO_THICKNESS_RATIO);
		}
	}
	function makeNodeDead(node, newLength, newThickness){
		node.dead = true;
		if(newThickness != undefined)
			node.thickness.set(newThickness, 0);
		if(newLength != undefined){
			node.length.set(newLength, 0);
			node.location = {
				x:(node.parent.x + newLength * DIRECTION[node.direction].x), 
				y:(node.parent.y + newLength * DIRECTION[node.direction].y)
			};
		}
	}
}
/////////////////////////////////
// GEOMETRY
/////////////////////////////////
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
	if(result != undefined){   // if yes, the boundary was crossed, result is new intersection
		// return distance from start to new intersection
		return Math.sqrt( (result.x-start.x)*(result.x-start.x) + (result.y-abs(start.y))*(result.y-abs(start.y)) );
	}
	return undefined;
}
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
////////////////////////////////
// DRAWING & RENDERING
////////////////////////////////
function drawTree(tree, start, angleDepth){
	if(tree != undefined){
		if(tree.left != undefined){
			drawTree(tree.left, {x:start.x + tree.length.value * DIRECTION[angleDepth].x, y:start.y + tree.length.value * DIRECTION[angleDepth].y}, angleDepth);
		}
		if(tree.right != undefined){
			drawTree(tree.right, {x:start.x + tree.length.value * DIRECTION[angleDepth].x, y:start.y + tree.length.value * DIRECTION[angleDepth].y}, mod6(angleDepth+1));
		}
		var length = tree.length.get();
		end = {x:(start.x + length * DIRECTION[angleDepth].x),
			   y:(start.y + length * DIRECTION[angleDepth].y)};
		line(start.x, start.y, end.x, end.y);
		ellipse(end.x, end.y, 5, 5);
	}
}
function drawSnowflake(tree, location){
	for(var angle = 0; angle < 6; angle+=2)
		drawHexagonTreeWithReflections(tree, location, angle);
	for(var angle = 1; angle < 6; angle+=2)
		drawHexagonTreeWithReflections(tree, location, angle);
	// fill(20*tree.age + 150, 255);
	// drawCenterHexagon(tree, location);
	function drawCenterHexagon(tree, start){
		var length = tree.length.get();
		var thickness = tree.thickness.get();
		beginShape();
		for(var angle = 0; angle < 6; angle++){
			var point = {
					x:(start.x + (length+thickness) * DIRECTION[mod6(angle)].x),
					y:(start.y + (length+thickness) * DIRECTION[mod6(angle)].y) };
			vertex(point.x, point.y);
		}
		endShape(CLOSE);
	}
	function drawHexagonTreeWithReflections(tree, start, angle){
		if(tree != undefined){
			// LENGTH and THICKNESS
			var length = tree.length.get();
			var thickness = tree.thickness.get();
			var pThickness;
			if(tree.parent) pThickness = tree.parent.thickness.get();
			else 			pThickness = 0;
			// thickness grows HEXAGONALLY, not scaling proportionally
			// thickness = tree.length.get();
			if(thickness > tree.thickness.value)			
				thickness = tree.thickness.value;
			// START AND END
			var end = {
				x:(start.x + length * DIRECTION[angle].x), 
				y:(start.y + length * DIRECTION[angle].y)
			};
			var endThick = {
				x:(start.x + (length+thickness) * DIRECTION[angle].x), 
				y:(start.y + (length+thickness) * DIRECTION[angle].y)
			};
			var startThick = {
				x:(start.x + pThickness * DIRECTION[angle].x), 
				y:(start.y + pThickness * DIRECTION[angle].y)
			};
			var thckAng = 2;
			if(thickness > pThickness){
				startThick = start;
				thckAng = 1;
			}
			if(tree.right != undefined){
				drawHexagonTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawHexagonTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
			//first go to the bottom of tree, following the main stem
			if(tree.left != undefined)
				drawHexagonTreeWithReflections(tree.left, end, angle);
			
			var point1a = {
				x:(startThick.x + thickness * DIRECTION[mod6(angle-thckAng)].x),
				y:(startThick.y + thickness * DIRECTION[mod6(angle-thckAng)].y) };
			var point1b = {
				x:(startThick.x + thickness * DIRECTION[mod6(angle+thckAng)].x),
				y:(startThick.y + thickness * DIRECTION[mod6(angle+thckAng)].y) };
			var point2a = {
				x:(end.x - thickness * DIRECTION[mod6(angle+2)].x),
				y:(end.y - thickness * DIRECTION[mod6(angle+2)].y) };
			var point2b = {
				x:(end.x - thickness * DIRECTION[mod6(angle-2)].x),
				y:(end.y - thickness * DIRECTION[mod6(angle-2)].y) };

			// fill(255, 128 * sqrt(1.0/tree.generation));
			fill(12*tree.age + 120 + (tree.randomValue[angle%6]-5)*2, 255);
			beginShape();
			vertex(startThick.x, startThick.y);
			vertex(point1a.x, point1a.y);
			vertex(point2a.x, point2a.y);
			vertex(endThick.x, endThick.y);
			vertex(point2b.x, point2b.y);
			vertex(point1b.x, point1b.y);
			endShape(CLOSE);

		}
	}
}

function drawSnowflakeTree(tree, location){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, location, i);
	function drawTreeWithReflections(tree, location, angle){
		if(tree != undefined){
			var length = tree.length.get();
			var start = location;
			var end = {
				x:(location.x + length * DIRECTION[angle].x), 
				y:(location.y + length * DIRECTION[angle].y)
			};
			// stroke(0 + (200/tree.maxGeneration)*tree.generation);
			line(start.x, start.y, end.x, end.y);
			if(tree.left != undefined)
				drawTreeWithReflections(tree.left, end, angle);
			if(tree.right != undefined){
				drawTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
			ellipse(end.x, end.y, 5, 5);
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