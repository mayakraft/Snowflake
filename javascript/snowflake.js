// generative snowflake
// robby kraft
// 
// dependencies: math/binarytree.js
//               math/algorithms.js
//     optional:
//               render.js (with p5.js) for drawing

var DEBUG = 0;  // 0:off  1:on


var SnowflakeData = function(location, length, direction, thickness, thinness, active){
	if(DEBUG){ console.log('new SnowflakeData()'); }
	this.location = {'x':0, 'y':0};
	this.length = 0;
	this.direction = 0;
	this.thickness = 0;
	this.thinness = 0;
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

var Snowflake = function(){
	if(DEBUG){ console.log('Snowflake.init()'); }

	this.matter = 6;  // (size/scale)
	this.mainArmRejoinPoints = [];  // when two arms grow wide enough that they touch

	var data = new SnowflakeData({x:(0.0),y:(0.0)}, 0, 0, 0, 0, true);
	this.tree = new TreeNode(undefined, data);  // type:(TreeNode) - the parent node of the binary tree
};


Snowflake.prototype.grow = function(atmosphere, progress, addChildren){
	if(DEBUG){ console.log('Snowflake.grow()'); }
	var matter = this.matter;

	var HEX_ANGLE = [
		{x:0.8660254037844,  y:0.5},  {x:0, y:1},  {x:-0.8660254037844, y:0.5},
		{x:-0.8660254037844, y:-0.5}, {x:0, y:-1}, {x:0.8660254037844,  y:-0.5} ];
	var HEX_30_ANGLE = [
		{x:1,  y:0}, {x:.5, y:-0.8660254037844}, {x:-.5,y:-0.8660254037844},
		{x:-1, y:0}, {x:-.5,y:0.8660254037844},  {x:.5, y:0.8660254037844} ];

	// for(var i = 0; i < atmosphere.length; i++){
	// 	visitLeaves(this.tree, {"mass":atmosphere.mass[i], "branch":atmosphere.branch[i], "thin":atmosphere.thin[i]});
	// }

	var i = Math.floor(progress * atmosphere.length);
	console.log('growing: ' + i);
	if(i >= 0 && i < atmosphere.length){
		visitLeaves(this.tree, {"mass":atmosphere.mass[i], "branch":atmosphere.branch[i], "thin":atmosphere.thin[i]});
	}

	// grow existing arms thicker / sprout new branches
	function visitLeaves(tree, atmosphere){
		if(tree.left){
			visitLeaves(tree.left, atmosphere);
		}
		if(tree.right){
			visitLeaves(tree.right, atmosphere);
		}



		if(tree.data.active){

			var nMass = atmosphere['mass'];
			var twoBranches = atmosphere['branch'];
			var nThinHere = atmosphere['thin'];

			// OPTIONAL: add mass to branches that are not leaves
				var length = matter * nMass;
				var thickness = matter * nMass * Math.random();


				var endLocation = {'x':tree.data.location.x + tree.data.length * HEX_ANGLE[tree.data.direction].x,
				                   'y':tree.data.location.y + tree.data.length * HEX_ANGLE[tree.data.direction].y};
				// check intersections
				var leadingEdge = endLocation;
				if(tree.data.direction == 0){
					
				}
				var intersection = check30DegIntersection(tree.data.location, leadingEdge);
				if(intersection != undefined){
					tree.data.active = false;
					tree.data.length = intersection;
					return;
				}

			if(tree.leaf == false){
				// tree.data.length += length;
				tree.data.thickness += thickness;				
			}


			// SPROUT NEW LEAF / LEAVES
			if(tree.leaf == true){  // operations only on leaves
				// GROW THIS LEAF


				tree.data.length += length;
				tree.data.thickness += thickness;


				if(addChildren){
					// ADD CHILDREN
					var leftData = new SnowflakeData(endLocation, 0, tree.data.direction, 0, 0, true);
					tree.addLeftChild( leftData );
					
					if(twoBranches){  // right
						var rightData = new SnowflakeData(endLocation, 0, mod6(tree.data.direction+1), 0, 0, true);
						tree.addRightChild( rightData );
					}
				}

			}
		}
	}
}
