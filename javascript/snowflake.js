
//TODO 
//lines that go through the center
// lines that also go inside, but pointing toward the far edges
//    - both in 60 deg and also 30 deg angles
//    - do the latter if the length v thickness equivocates to about a regular hexagon
//



// Algorithmic Snowflake
//
//  TREE: the snowflake is a binary tree, "var tree" is the head
//  CYCLE: one growth cycle
//  FRAME: a CYCLE contain many FRAMES


// #DEFS
var RIGHT = 1;
var LEFT = 0;
// clockwise starting from 3:00
var HEX_ANGLE = [
	{x:0.866025403784439, y:0.5},
	{x:0, y:1},
	{x:-0.866025403784439, y:0.5},
	{x:-0.866025403784439, y:-0.5},
	{x:0, y:-1},
	{x:0.866025403784439, y:-0.5} ];
var HEX_30_ANGLE = [
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444} ];


// canvas stuff
var canvas;  // HTML canvas, for saving image
var originSnowflake;  // screen coordinates
var originTree;       // screen coordinates

// var tree;  // the snowflake data model
// GENERATOR PARAMETERS 
var matter = 24;
var atmos;  // atmosphere conditions {pressure, moisture, density}

var ITERATIONS;

var mainArmRejoinPoints;  // when two arms grow wide enough that they touch

////////////////////////////////
//  P5.JS
//////////////////////////////

function initTree(){
	resetAnimation();
	tree = new binaryTree(undefined, {"length":0, "thickness":matter});
	mainArmRejoinPoints = [];
	atmos = new Atmosphere(ITERATIONS);
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


function reviewTree(){

}


function growTree(tree, atmosphere){
	var nPressure = atmosphere["pressure"];
	var nDensity = atmosphere["density"];
	var nMoisture = atmosphere["moisture"];

	visitLeaves(tree);
	setGlobalTreeVariables(tree);

	function visitLeaves(tree){
		if(tree.left)
			visitLeaves(tree.left);		
		if(tree.right)
			visitLeaves(tree.right);

	// GROW MORE CRYSTALS
		if(tree.left == undefined && tree.right == undefined && !tree.dead && tree.branchesR < 3){
			
			// var twoBranches = (random(10) < 8);
			var twoBranches = nDensity;
			if(tree.parent == undefined) twoBranches = false;  // force first seed to branch only left

			var shortenby = Math.pow(0.4, tree.branchesR);
			// var newLength = tree.length.value * nPressure[DEPTH];
			var newLength = matter * cos(PI * .5 * nPressure)  * shortenby;// * (3+tree.generation);
			var newThickness = matter * sin(PI * .5 * nPressure) * shortenby;// * (tree.generation);
			var newThinness = undefined;
			if(nMoisture < .5) 
				newThinness = random(.15)+.05;

			// if(newLength < tree.thickness.value){
			// 	console.log("adjusting value, length is smaller than thickness");
			// 	newLength = tree.thickness.value + 3;
			// }

			if(tree.branchesR < 1 && nPressure < 0){
				newLength = 0;
				newThickness = tree.parent.thickness.value * 1.1;
			}

			if(1){//newLength > 5){
				// if(newLength < 30)
				// 	newLength = 30;

				// ADD CHILDREN
				// left
				tree.addLeftChild({"length":newLength, "thickness":newThickness, "thinness":newThinness});
				var leftIntersect = checkBoundaryCrossing(tree, tree.left);
				if(leftIntersect != undefined)
					makeNodeDead(tree.left, leftIntersect, newThickness );
				// right
				if(twoBranches){
					console.log("two branches");
					tree.addRightChild({"length":newLength * .7, "thickness":newThickness * .7, "thinness":newThinness});
					var rightIntersect = checkBoundaryCrossing(tree, tree.right);
					if(rightIntersect != undefined)
						makeNodeDead(tree.right, rightIntersect, newThickness );
				}
			}
		}
		// grow thicker
		if(tree.age < 3){
			if(tree.maxGeneration - tree.generation == 0)
				tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+2))) );
			else if(tree.maxGeneration - tree.generation == 1)
				tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+3))) );
			else if(tree.maxGeneration - tree.generation == 2)
				tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+4))) );
		}

	}

// function growTree(tree, atmosphere){
// 	var nPressure = atmosphere["pressure"];
// 	var nDensity = atmosphere["density"];
// 	var nMoisture = atmosphere["moisture"];

// 	findLeaves(tree);
// 	setGlobalTreeVariables(tree);

// 	function findLeaves(tree){
// 		if(tree.left)
// 			findLeaves(tree.left);		
// 		if(tree.right)
// 			findLeaves(tree.right);

// 	// GROW MORE CRYSTALS
// 		if(tree.left == undefined && tree.right == undefined && !tree.dead && tree.branchesR < 3){
			
// 			// var twoBranches = (random(10) < 8);
// 			var twoBranches = nDensity;
// 			if(tree.parent == undefined) twoBranches = false;  // force first seed to branch only left

// 			var shortenby = Math.pow(0.4, tree.branchesR);
// 			// var newLength = tree.length.value * nPressure[DEPTH];
// 			var newLength = matter * cos(PI * .5 * nPressure)  * shortenby;// * (3+tree.generation);
// 			var newThickness = matter * sin(PI * .5 * nPressure) * shortenby;// * (tree.generation);
// 			var newThinness = undefined;
// 			if(nMoisture < .5) 
// 				newThinness = random(.15)+.05;

// 			if(newLength < tree.thickness.value){
// 				console.log("adjusting value, length is smaller than thickness");
// 				newLength = tree.thickness.value + 3;
// 			}

// 			if(1){//newLength > 5){
// 				// if(newLength < 30)
// 				// 	newLength = 30;

// 				// ADD CHILDREN
// 				// left
// 				tree.addLeftChild({"length":newLength, "thickness":newThickness, "thinness":newThinness});
// 				var leftIntersect = checkBoundaryCrossing(tree, tree.left);
// 				if(leftIntersect != undefined)
// 					makeNodeDead(tree.left, leftIntersect, newThickness );
// 				// right
// 				if(twoBranches){
// 					tree.addRightChild({"length":newLength * .7, "thickness":newThickness * .7, "thinness":newThinness});
// 					var rightIntersect = checkBoundaryCrossing(tree, tree.right);
// 					if(rightIntersect != undefined)
// 						makeNodeDead(tree.right, rightIntersect, newThickness );
// 				}
// 			}
// 		}
// 		// grow thicker
// 		if(tree.age < 3){
// 			if(tree.maxGeneration - tree.generation == 0)
// 				tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+2))) );
// 			else if(tree.maxGeneration - tree.generation == 1)
// 				tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+3))) );
// 			else if(tree.maxGeneration - tree.generation == 2)
// 				tree.thickness.set(tree.thickness.value*(1+(1/(tree.maxGeneration+4))) );
// 		}

// 	}
	// function operateOnEntireTree(tree){
	// 	// run neighbor arm too near on all the leaves
	// 	if(tree.left != undefined)
	// 		operateOnEntireTree(tree.left);
	// 	if(tree.right != undefined)
	// 		operateOnEntireTree(tree.right);
	// 	if(tree.left == undefined && tree.right == undefined)
	// 		neighborArmTooNear(tree);

	// 	function neighborArmTooNear(tree){
	// 		var stepsUp = traverseUpUntilBranch(tree, 0);
	// 		// if(stepsUp != -1)
	// 		// 	console.log("Steps Back: " + stepsUp);
	// 		function traverseUpUntilBranch(tree, howManyUp){
	// 			if(tree.parent == undefined)
	// 				return -1;
	// 			if(tree.childType == LEFT)
	// 				return traverseUpUntilBranch(tree.parent, howManyUp+1);
	// 			return howManyUp+1;
	// 		}
	// 	}
	// }	
}

function intersectionWasHit(location, node){
	if(node.branchesR == 2){
		var distance = Math.sqrt( (location.x)*(location.x) + (location.y)*(location.y) );
		distance *= 1.15470053837925;
		mainArmRejoinPoints.push(distance);
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
			if(this.value != undefined)
				zeroPointIn = this.value;
			else
				zeroPointIn = 0;
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

function makeNodeDead(node, newLength, newThickness){
	node.dead = true;
	if(newThickness != undefined)
		node.thickness.set(newThickness, 0);
	if(newLength != undefined){
		node.length.set(newLength, 0);
		node.location = {
			x:(node.parent.x + newLength * HEX_ANGLE[node.direction].x), 
			y:(node.parent.y + newLength * HEX_ANGLE[node.direction].y)
		};
	}
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
	// this.details = undefined;
	this.details = {"phalanges":undefined, "thinner":data.thinness};
	this.seedMoment = 1.0 // 0.0 to 1.0 sprout point, between 100% inside the parent crystal to the very tip.
	                     // nothing should ever be 1.0, technically or it would break off 

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
			x:(0.0 + this.length.value * HEX_ANGLE[this.direction].x), 
			y:(0.0 + this.length.value * HEX_ANGLE[this.direction].y)
		};
	}
	this.addChildren = function(leftData, rightData){
		this.addLeftChild(leftData);
		this.addRightChild(rightData);
	}
	this.addLeftChild = function(leftData){
		this.left = new binaryTree(this, leftData);
		this.left.childType = LEFT;
		this.left.direction = this.direction;
		this.left.branchesR = this.branchesR;
		this.left.location = {
			x:(this.location.x + this.left.length.value * HEX_ANGLE[this.left.direction].x), 
			y:(this.location.y + this.left.length.value * HEX_ANGLE[this.left.direction].y)
		};		
	}
	this.addRightChild = function(rightData){
		this.right = new binaryTree(this, rightData);
		this.right.childType = RIGHT;
		this.right.direction = mod6(this.direction+1);
		this.right.branchesR = this.branchesR + 1;
		this.right.location = {
			x:(this.location.x + this.right.length.value * HEX_ANGLE[this.right.direction].x), 
			y:(this.location.y + this.right.length.value * HEX_ANGLE[this.right.direction].y)
		};
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
			{x:(cos(60/180*Math.PI)), y:(sin(60/180*Math.PI))}, 
			// {x:(cos(30/180*Math.PI)), y:(sin(30/180*Math.PI))}, 
			{x:start.x, y:abs(start.y)}, 
			{x:end.x, y:abs(end.y)}
		);
	if(result != undefined){   // if yes, the boundary was crossed, result is new intersection
		intersectionWasHit(result, endNode);
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