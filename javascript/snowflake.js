// Algorithmic Snowflake
//
// REQUIRES: binarytree.js
//           render.js (with p5.js) for drawing

// TODO: for deployment- fill all HEX_ANGLES with high-precision double values

var DEBUG = 0;

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
		{x:0.8660254037844, y:0.5},
		{x:0, y:1},
		{x:-0.8660254037844, y:0.5},
		{x:-0.8660254037844, y:-0.5},
		{x:0, y:-1},
		{x:0.8660254037844, y:-0.5} ];
	var HEX_30_ANGLE = [
		{x:1, y:0},
		{x:.5,y:-0.8660254037844},
		{x:-.5,y:-0.8660254037844},
		{x:-1, y:0},
		{x:-.5,y:0.8660254037844},
		{x:.5,y:0.8660254037844} ];


	this.init = function(){
		if(DEBUG){ console.log('Snowflake.init()'); }
		// var location = { x:(0.0 + length * HEX_ANGLE[direction].x), 
		//                  y:(0.0 + length * HEX_ANGLE[direction].y) };
		var thickness = 24;
		var data = new SnowflakeNode({x:(0.0),y:(0.0)}, 0, 0, thickness, 0, true);
		this.tree = new TreeNode(undefined, data);		

		this.mainArmRejoinPoints = [];  // when two arms grow wide enough that they touch
	}

	this.tree;  // the parent node of the binary tree
	this.mainArmRejoinPoints; 

	this.init();

	this.draw = drawSnowflake6Sides;

	this.setDrawStyle = function(input){
		if(input == 0){
			this.draw = drawBinaryTree;
		} else if(input == 1){
			this.draw = drawSnowflake6Sides;
		} else if (input == 2){
			this.draw = drawFilledSnowflake6Sides;
		}
	}

	this.setNodeStyle = function(input){
		if(input == 0){
			drawBetweenNodes = drawBetweenNodesLineWithDots;
		} else if(input == 1){
			drawBetweenNodes = drawBetweenNodesRect;
		} else if (input == 2){
			drawBetweenNodes = drawBetweenNodesHex;
		}
	}

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
			// setGlobalTreeVariables(tree);

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
					var newLength = matter * cos(PI * .5 * nMass) * shortenby;// * (3+tree.generation);
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
							// console.log("two branches");
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
