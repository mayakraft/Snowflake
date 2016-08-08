// Algorithmic Snowflake

var DEBUG = 1;


var matter = 24;

//TODO 
//lines that go through the center
// lines that also go inside, but pointing toward the far edges
//    - both in 60 deg and also 30 deg angles
//    - do the latter if the length v thickness equivocates to about a regular hexagon
//
var Snowflake = function(){
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


	this.init = function(){
		if(DEBUG){ console.log('Snowflake.init()'); }
		// var location = { x:(0.0 + length * HEX_ANGLE[direction].x), 
		//                  y:(0.0 + length * HEX_ANGLE[direction].y) };
		var thickness = 24;
		var data = new SnowflakeNode({x:(0.0),y:(0.0)}, 0, 0, thickness, 0, true);
		this.tree = new BinaryTree(undefined, data);		

		this.mainArmRejoinPoints = [];  // when two arms grow wide enough that they touch
	}

	this.tree;  // the parent node of the binary tree
	this.mainArmRejoinPoints; 

	this.init();

	this.grow = function(atmosphere){
		var intersectionWasHit = function(location, node){
			if(DEBUG){ console.log('Snowflake.intersectionWasHit()'); }
			if(node.rBranches == 2){
				var distance = Math.sqrt( (location.x)*(location.x) + (location.y)*(location.y) );
				distance *= 1.15470053837925;
				// if(this.mainArmRejoinPoints != undefined)
				// this.mainArmRejoinPoints.push(distance);
			}
		}
		var checkBoundaryCrossing = function(startNode, endNode){
			if(DEBUG){ console.log('Snowflake.checkBoundaryCrossing()'); }
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
		
		var growTree = function(tree, atmosphere){
			var nMass = atmosphere['mass'];
			var nBranchHere = atmosphere['branch'];
			var nThinHere = atmosphere['thin'];

			visitLeaves(tree);
			setGlobalTreeVariables(tree);

			function visitLeaves(tree){
				if(tree.left)
					visitLeaves(tree.left);		
				if(tree.right)
					visitLeaves(tree.right);

			// GROW MORE CRYSTALS
				// if(tree.left == undefined && tree.right == undefined && tree.data != undefined && tree.data.active && tree.rBranches < 3){
				if(tree.left == undefined && tree.right == undefined){
					
					// var twoBranches = (random(10) < 8);
					var twoBranches = nBranchHere;
					if(tree.parent == undefined) twoBranches = false;  // force first seed to branch only left

					var shortenby = Math.pow(0.4, tree.rBranches);
					// var newLength = tree.length * nMass[DEPTH];
					var newLength = matter * cos(PI * .5 * nMass)  * shortenby;// * (3+tree.generation);
					var newThickness = matter * sin(PI * .5 * nMass) * shortenby;// * (tree.generation);
					var newThinness = undefined;
					if(nThinHere < .5) 
						newThinness = random(.15)+.05;

					// if(newLength < tree.thickness){
					// 	console.log("adjusting value, length is smaller than thickness");
					// 	newLength = tree.thickness + 3;
					// }

					if(tree.rBranches < 1 && nMass < 0){
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
						var leftData = new SnowflakeNode(leftLocation, newLength, leftDirection, newThickness, newThinness, true);

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
							var rightData = new SnowflakeNode(rightLocation, newLength * .7, rightDirection, newThickness * .7, newThinness, true);

							tree.addRightChild( rightData );

							var rightIntersect = checkBoundaryCrossing(tree, tree.right);
							if(rightIntersect != undefined)
								makeNodeDead(tree.right, rightIntersect, newThickness );
						}
					}
				}
				// grow thicker
				// if(tree.age < 3){
				// 	if(tree.maxGeneration - tree.generation == 0)
				// 		tree.data.thickness = (tree.data.thickness*(1+(1/(tree.maxGeneration+2))) );
				// 	else if(tree.maxGeneration - tree.generation == 1)
				// 		tree.data.thickness = (tree.data.thickness*(1+(1/(tree.maxGeneration+3))) );
				// 	else if(tree.maxGeneration - tree.generation == 2)
				// 		tree.data.thickness = (tree.data.thickness*(1+(1/(tree.maxGeneration+4))) );
				// }

			}
		}		

		if(DEBUG){ console.log('Snowflake.grow()'); }

		for(var i = 0; i < atmosphere.length; i++)
			growTree(this.tree, {"mass":atmosphere.mass[i], "branch":atmosphere.branch[i], "thin":atmosphere.thin[i]});

	}

	this.draw = function(position){
		if(DEBUG){ console.log('Snowflake.draw()'); }

		for(var angle = 0; angle < 6; angle+=2)
			drawHexagonTreeWithReflections(this.tree, position, angle);
		
		for(var angle = 1; angle < 6; angle+=2)
			drawHexagonTreeWithReflections(this.tree, position, angle);

		function drawHexagonTreeWithReflections(node, start, angle){
			if(node != undefined){
				// LENGTH and THICKNESS
				var length = node.length;
				var thickness = node.thickness;
				var pThickness;
				if(node.parent) pThickness = node.parent.thickness;
				else 			pThickness = 0;
				// thickness grows HEXAGONALLY, not scaling proportionally
				// thickness = node.length;
				if(thickness > node.thickness)			
					thickness = node.thickness;
				// START AND END
				var end = {
					x:(start.x + length * HEX_ANGLE[angle].x), 
					y:(start.y + length * HEX_ANGLE[angle].y)
				};
				var endThick = {
					x:(start.x + (length+thickness) * HEX_ANGLE[angle].x), 
					y:(start.y + (length+thickness) * HEX_ANGLE[angle].y)
				};
				var startThick = {
					x:(start.x + pThickness * HEX_ANGLE[angle].x), 
					y:(start.y + pThickness * HEX_ANGLE[angle].y)
				};
				var thckAng = 2;
				if(thickness > pThickness){
					startThick = start;
					thckAng = 1;
				}
				if(node.right != undefined){
					drawHexagonTreeWithReflections(node.right, end, mod6(angle+1) );
					drawHexagonTreeWithReflections(node.right, end, mod6(angle-1) );
				}
				//first go to the bottom of tree, following the main stem
				if(node.left != undefined)
					drawHexagonTreeWithReflections(node.left, end, angle);
				
				var point1a = {
					x:(startThick.x + thickness * HEX_ANGLE[mod6(angle-thckAng)].x),
					y:(startThick.y + thickness * HEX_ANGLE[mod6(angle-thckAng)].y) };
				var point1b = {
					x:(startThick.x + thickness * HEX_ANGLE[mod6(angle+thckAng)].x),
					y:(startThick.y + thickness * HEX_ANGLE[mod6(angle+thckAng)].y) };
				var point2a = {
					x:(end.x - thickness * HEX_ANGLE[mod6(angle+2)].x),
					y:(end.y - thickness * HEX_ANGLE[mod6(angle+2)].y) };
				var point2b = {
					x:(end.x - thickness * HEX_ANGLE[mod6(angle-2)].x),
					y:(end.y - thickness * HEX_ANGLE[mod6(angle-2)].y) };

				// fill(255, 128 * sqrt(1.0/node.generation));
				var fillValue = 5*node.age + 150;// + (node.randomValue[angle%6]-5)*2;
				fill(fillValue, 250);
				beginShape();
				vertex(startThick.x, startThick.y);
				vertex(point1a.x, point1a.y);
				vertex(point2a.x, point2a.y);
				vertex(endThick.x, endThick.y);
				vertex(point2b.x, point2b.y);
				vertex(point1b.x, point1b.y);
				endShape(CLOSE);

				// HEXAGON ARTIFACTS
				// edge thinning
				// if(node.data.thinness != undefined){
				// 	var thinness = (node.data.thinness) * thickness;
				// 	var edges = [point1b, point2b, endThick, point2a, point1a];
				// 	for(var i = 0; i < 4; i++){
				// 		var fillChange = - (sin(-.05 + mod6(angle-(i - 1.5)))*2);  // dramatic lighting
				// 		fill(fillValue + fillChange*10, 250);
				// 		var edgeNear = {
				// 			x:(edges[i].x + thinness * HEX_ANGLE[mod6(angle-i)].x),
				// 			y:(edges[i].y + thinness * HEX_ANGLE[mod6(angle-i)].y) };
				// 		var edgeFar = {
				// 			x:(edges[i+1].x + thinness * HEX_ANGLE[mod6(angle-i + 3)].x),
				// 			y:(edges[i+1].y + thinness * HEX_ANGLE[mod6(angle-i + 3)].y) };
				// 		var innerNear = {
				// 			x:(edgeNear.x + thinness * HEX_ANGLE[mod6(angle-i+2 + 3)].x),
				// 			y:(edgeNear.y + thinness * HEX_ANGLE[mod6(angle-i+2 + 3)].y) };
				// 		var innerFar = {
				// 			x:(edgeFar.x + thinness * HEX_ANGLE[mod6(angle-i+4)].x),
				// 			y:(edgeFar.y + thinness * HEX_ANGLE[mod6(angle-i+4)].y) };
				// 		beginShape();
				// 		vertex(edgeNear.x, edgeNear.y);
				// 		vertex(edgeFar.x, edgeFar.y);
				// 		vertex(innerFar.x, innerFar.y);
				// 		vertex(innerNear.x, innerNear.y);
				// 		endShape(CLOSE);
				// 	}
				// }
			}
		}
	}

};

var SnowflakeNode = function(location, length, direction, thickness, thinness, active){
	if(DEBUG){ console.log('new SnowflakeNode()'); }
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


// function growTree(tree, atmosphere){
// 	var nMass = atmosphere["mass"];
// 	var nBranchHere = atmosphere["branch"];
// 	var nThinHere = atmosphere["thin"];

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
// 			var twoBranches = nBranchHere;
// 			if(tree.parent == undefined) twoBranches = false;  // force first seed to branch only left

// 			var shortenby = Math.pow(0.4, tree.rBranches);
// 			// var newLength = tree.length * nMass[DEPTH];
// 			var newLength = matter * cos(PI * .5 * nMass)  * shortenby;// * (3+tree.generation);
// 			var newThickness = matter * sin(PI * .5 * nMass) * shortenby;// * (tree.generation);
// 			var newThinness = undefined;
// 			if(nThinHere < .5) 
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
	if(DEBUG){ console.log('makeNodeDead()'); }
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
