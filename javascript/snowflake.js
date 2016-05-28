
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


var tree;  // the snowflake data model
// GENERATOR PARAMETERS 
var matter = 24;
var atmos;  // atmosphere conditions {pressure, moisture, density}

var ITERATIONS;

var mainArmRejoinPoints;  // when two arms grow wide enough that they touch

////////////////////////////////
//  P5.JS
//////////////////////////////


var SnowflakeData = function(location, length, direction, thickness, thinness, active){
	this.location = {'x':undefined, 'y':undefined};
	this.length = undefined;
	this.direction = 0;
	this.thickness = undefined;
	this.thinness = undefined;
	this.active = true;   // set to false to force node to be a leaf
	if(location != undefined)
		this.location = location;
	if(length != undefined)
		this.length = length;
	if(direction != undefined)
		this.direction = direction;
	if(thickness != undefined)
		this.thickness = thickness;
	if(thinness != undefined)
		this.thinness = thinness;
	if(active != undefined)
		this.active = active;
};

function initTree(){
	resetAnimation();
	mainArmRejoinPoints = [];

	// atmosphere initial conditions
	atmos = new Atmosphere(ITERATIONS);

	// snowflake initial conditions
	var length = 0;//new animatableValue(0, 0);
	var direction = 0;
	var location = { x:(0.0 + length * HEX_ANGLE[direction].x), 
	                 y:(0.0 + length * HEX_ANGLE[direction].y) };
	var thickness = matter;//new animatableValue(matter, 0);
	var data = new SnowflakeData(location, length, direction, thickness, 0, true);

	tree = new BinaryTree(undefined, data);
}


///////////////////////////////
//  SNOWFLAKE GROWING
///////////////////////////////


function growTree(tree, atmosphere){
	var nPressure = atmosphere["pressure"];
	var nDensity = atmosphere["density"];
	var nMoisture = atmosphere["moisture"];

	visitLeaves(tree);
	setGlobalTreeVariables(tree);

	logTree(tree);

	function visitLeaves(tree){
		if(tree.left)
			visitLeaves(tree.left);		
		if(tree.right)
			visitLeaves(tree.right);

	// GROW MORE CRYSTALS
		if(tree.left == undefined && tree.right == undefined && tree.data.active && tree.rBranches < 3){
			
			// var twoBranches = (random(10) < 8);
			var twoBranches = nDensity;
			if(tree.parent == undefined) twoBranches = false;  // force first seed to branch only left

			var shortenby = Math.pow(0.4, tree.rBranches);
			// var newLength = tree.length * nPressure[DEPTH];
			var newLength = matter * cos(PI * .5 * nPressure)  * shortenby;// * (3+tree.generation);
			var newThickness = matter * sin(PI * .5 * nPressure) * shortenby;// * (tree.generation);
			var newThinness = undefined;
			if(nMoisture < .5) 
				newThinness = random(.15)+.05;

			// if(newLength < tree.thickness){
			// 	console.log("adjusting value, length is smaller than thickness");
			// 	newLength = tree.thickness + 3;
			// }

			if(tree.rBranches < 1 && nPressure < 0){
				newLength = 0;
				newThickness = tree.parent.thickness * 1.1;
			}

			if(1){//newLength > 5){
				// if(newLength < 30)
				// 	newLength = 30;

				// ADD CHILDREN
				// left
				var leftDirection = tree.data.direction;
				var leftLocation = {
					x:(tree.data.location.x + newLength * HEX_ANGLE[leftDirection].x), 
					y:(tree.data.location.y + newLength * HEX_ANGLE[leftDirection].y)
				};		
				var leftData = new SnowflakeData(leftLocation, newLength, leftDirection, newThickness, newThinness, true);

				tree.addLeftChild( leftData );

				var leftIntersect = checkBoundaryCrossing(tree, tree.left);
				if(leftIntersect != undefined)
					makeNodeDead(tree.left, leftIntersect, newThickness );

				// right
				if(twoBranches){
					console.log("two branches");
					var rightDirection = mod6(tree.data.direction+1);
					var rightLocation = {
						x:(tree.data.location.x + newLength*.7 * HEX_ANGLE[rightDirection].x), 
						y:(tree.data.location.y + newLength*.7 * HEX_ANGLE[rightDirection].y)
					};
					var rightData = new SnowflakeData(rightLocation, newLength * .7, rightDirection, newThickness * .7, newThinness, true);

					tree.addRightChild( rightData );

					var rightIntersect = checkBoundaryCrossing(tree, tree.right);
					if(rightIntersect != undefined)
						makeNodeDead(tree.right, rightIntersect, newThickness );
				}
			}
		}
		// grow thicker
		if(tree.age < 3){
			if(tree.maxGeneration - tree.generation == 0)
				tree.data.thickness = (tree.data.thickness*(1+(1/(tree.maxGeneration+2))) );
			else if(tree.maxGeneration - tree.generation == 1)
				tree.data.thickness = (tree.data.thickness*(1+(1/(tree.maxGeneration+3))) );
			else if(tree.maxGeneration - tree.generation == 2)
				tree.data.thickness = (tree.data.thickness*(1+(1/(tree.maxGeneration+4))) );
		}

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
// 		if(tree.left == undefined && tree.right == undefined && !tree.dead && tree.rBranches < 3){
			
// 			// var twoBranches = (random(10) < 8);
// 			var twoBranches = nDensity;
// 			if(tree.parent == undefined) twoBranches = false;  // force first seed to branch only left

// 			var shortenby = Math.pow(0.4, tree.rBranches);
// 			// var newLength = tree.length * nPressure[DEPTH];
// 			var newLength = matter * cos(PI * .5 * nPressure)  * shortenby;// * (3+tree.generation);
// 			var newThickness = matter * sin(PI * .5 * nPressure) * shortenby;// * (tree.generation);
// 			var newThinness = undefined;
// 			if(nMoisture < .5) 
// 				newThinness = random(.15)+.05;

// 			if(newLength < tree.thickness){
// 				console.log("adjusting value, length is smaller than thickness");
// 				newLength = tree.thickness + 3;
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
// 				tree.thickness = (tree.thickness*(1+(1/(tree.maxGeneration+2))) );
// 			else if(tree.maxGeneration - tree.generation == 1)
// 				tree.thickness = (tree.thickness*(1+(1/(tree.maxGeneration+3))) );
// 			else if(tree.maxGeneration - tree.generation == 2)
// 				tree.thickness = (tree.thickness*(1+(1/(tree.maxGeneration+4))) );
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
//}

function intersectionWasHit(location, node){
	if(node.rBranches == 2){
		var distance = Math.sqrt( (location.x)*(location.x) + (location.y)*(location.y) );
		distance *= 1.15470053837925;
		mainArmRejoinPoints.push(distance);
	}
}

/////////////////////////////
//  DATA STRUCTURES
////////////////////////////////

function mod6(input){
	// returns 0-5.  accepts any int, negatives included
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
}


function makeNodeDead(node, newLength, newThickness){
	node.data.dead = true;
	if(newThickness != undefined)
		node.data.thickness = newThickness;//(newThickness, 0);
	if(newLength != undefined){
		node.data.length = newLength; // (newLength, 0);
// TODO: reintroduce below
		// node.data.location = {
		// 	x:(node.parent.data.location.x + newLength * HEX_ANGLE[node.direction].x), 
		// 	y:(node.parent.data.location.y + newLength * HEX_ANGLE[node.direction].y)
		// };
	}
}

/////////////////////////////////
// GEOMETRY
/////////////////////////////////
// performs the necessary fixes to this specific problem
// and returns true if boundary was crossed and adjustments made
function checkBoundaryCrossing(startNode, endNode){
	// extract euclidean locations from parent and child
	var start = startNode.data.location;
	var end = endNode.data.location;
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
			node.data.length + ") PARENT:(" + 
			hasChildren + ") TYPE:(" + 
			node.childType + ") RIGHT BRANCHES:(" + 
			node.rBranches + ") (" + 
			node.data.location.x + "," +
			node.data.location.y + ")");
		logTree(node.left);
		logTree(node.right);
	}
}