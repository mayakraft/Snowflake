// Algorithmic Snowflake
//
// brief overview of vocabulary used here:
//  TREE: the snowflake is a binary tree, "var tree" is the head
//  CYCLE: one growth cycle, leaves can choose to or not to sprout new growths
//  FRAME: CYCLEs last certain number of FRAMES, (like 30), variable.

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
const ANIMATIONS = 0;  // 0 or 1, turn animations OFF or ON

var CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
var CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
var CYCLE_FRAME = 0;
var CYCLE_NUM = 0;

var canvas;  // HTML canvas, for saving image
// drawing locations, based on screen resolution
var originSnowflake;
var originTree;

var tree;  // the snowflake

var rightShorten = .666;
var DEPTH = 8;

var noiseOff;

var LENGTH_TO_THICKNESS_RATIO = 0.2;

////////////////////////////////
//  P5.JS
//////////////////////////////
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	if(!ANIMATIONS)
		noLoop();
	resizeOrigins();
	tree = new binaryTree(undefined, {"length":60});
	frameRate(60);
	// setInterval(
	// 	function(){
	// 		DEPTH = 8;
	// 		CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
	// 		CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
	// 		CYCLE_FRAME = 0;
	// 		CYCLE_NUM = 0;
	// 		tree = new binaryTree(undefined, {"length":20});
	// 	}, 8000);
}
function mousePressed() {
	DEPTH++;
	if(!ANIMATIONS){
		growTree(tree);
		draw(tree);
	}
}
function draw() {
	background(255);
	// a 30 deg line showing the crop position on the wedge
	// stroke(200);
	// line(originTree.x, originTree.y, originTree.x + 100*cos(30/180*Math.PI), originTree.y - 100*sin(30/180*Math.PI));
	stroke(0);
	drawTree(tree, originTree, 0);
	drawSnowflake(tree, originSnowflake);
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
		// if(tree.length.valueToBeGrown != undefined){
		tree.length.animate(progress);
		tree.thickness.animate(progress / LENGTH_TO_THICKNESS_RATIO);
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
	// GROW ANOTHER SNOWFLAKE
		if(!hasChild && !tree.dead){
			// first branch only
			if(tree.parent == undefined){
				// tree.addLeftChild(tree.length.value * 3);//lengthThisTime)
				tree.addLeftChild({"length":tree.length.value * random(3)});//lengthThisTime)
			}
			// all other generations
			else if(tree.branchesR < 3){
				var shortenby = Math.pow(rightShorten, tree.branchesR);
				if(tree.length.value * lengthThisTime * shortenby > 1 && tree.length.value > 0){
					//make this relate to how many right turns, not right or left branch
					if(random(10) < 5){
						var left = random(30) + 15;
						tree.addChildren({"length":left}, {"length":left * .7});
						// tree.addChildren(
						// 	tree.length.value * lengthThisTime, 
						// 	tree.length.value * lengthThisTime * shortenby);
					}
					else{
						tree.addLeftChild({"length":random(30) + 15});
						// tree.addLeftChild(tree.length.value * lengthThisTime);
					}
				}
			}
		}
		// tree.length.set(tree.length.value*1.1);
		// tree.thickness.set(tree.thickness.value*1.1, tree.thickness.value);
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
		this.value = input;
		if(this.zeroPoint == undefined){
			if(zeroPointIn == undefined)
				this.zeroPoint = 0;
			else
				this.zeroPoint = zeroPointIn;
		}
		else{
			// this.zeroPoint = zeroPointIn;
		}

		if(ANIMATIONS){
			// if(this.value == undefined)
			// 	this.value = 0;
			// this.valueToBeGrown = input - this.value;
			// this.valueAnimated = this.value;
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
		// console.log(this.valueAnimated + " = " + this.valueToBeGrown + " " + this.zeroPoint);
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
	this.maxGeneration = 0;
	// manage properties related to the data structure
	if(parent){
		this.generation = parent.generation+1;
		// IMPORTANT: this jumps the growth by "parent.thickness", gives it a head start
		this.length = new animatableValue(data.length, parent.thickness.value);
		// HERE: no head start
		// this.length = new animatableValue(length, 0);
	}else{
		// this is the beginning node of the tree, set initial conditions
		this.generation = 0;
		this.direction = 0;
		this.branchesR = 0;
		this.length = new animatableValue(data.length);
		this.location = {
			x:(0.0 + length * DIRECTION[this.direction].x), 
			y:(0.0 + length * DIRECTION[this.direction].y)
		};
	}
	this.thickness = new animatableValue(data.length);// * LENGTH_TO_THICKNESS_RATIO);

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
		var boundaryAdjust = false;
		boundaryAdjust |= checkBoundaryCrossing(this, this.left);
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
		var boundaryAdjust = false;
		boundaryAdjust |= checkBoundaryCrossing(this, this.right);
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
	drawCenterHexagon(tree, location);
	var length = tree.length.get();
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
		var length = tree.length.get();
		var thickness = tree.thickness.get();
		for(var angle = 0; angle < 6; angle++){
			var point1 = {
					x:(start.x + (length+thickness) * DIRECTION[mod6(angle)].x),
					y:(start.y + (length+thickness) * DIRECTION[mod6(angle)].y) };
			var point2 = {
					x:(start.x + (length+thickness) * DIRECTION[mod6(angle+1)].x),
					y:(start.y + (length+thickness) * DIRECTION[mod6(angle+1)].y) };
			line(point1.x, point1.y, point2.x, point2.y);
		}
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
			thickness = tree.thickness.get();
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
			// first go to the bottom of tree, following the main stem
			if(tree.left != undefined)
				drawHexagonTreeWithReflections(tree.left, end, angle);
			
			var point1a = {
				x:(startThick.x + thickness * DIRECTION[mod6(angle-2)].x),
				y:(startThick.y + thickness * DIRECTION[mod6(angle-2)].y) };
			var point1b = {
				x:(startThick.x + thickness * DIRECTION[mod6(angle+2)].x),
				y:(startThick.y + thickness * DIRECTION[mod6(angle+2)].y) };
			var point2a = {
				x:(end.x - thickness * DIRECTION[mod6(angle+2)].x),
				y:(end.y - thickness * DIRECTION[mod6(angle+2)].y) };
			var point2b = {
				x:(end.x - thickness * DIRECTION[mod6(angle-2)].x),
				y:(end.y - thickness * DIRECTION[mod6(angle-2)].y) };

			// stroke(255,0,0);
			// line(start.x, start.y, end.x, end.y);       // the major artery

			stroke(0);

			line(startThick.x, startThick.y, point1a.x, point1a.y);
			line(startThick.x, startThick.y, point1b.x, point1b.y);
			// connect outer border points
			line(point1a.x, point1a.y, point2a.x, point2a.y);
			line(point1b.x, point1b.y, point2b.x, point2b.y);
			// join outer border ot the end point
			line(point2a.x, point2a.y, endThick.x, endThick.y);
			line(point2b.x, point2b.y, endThick.x, endThick.y);

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
			var length = tree.length.get();
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