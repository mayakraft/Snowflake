var RIGHT = 1;
var LEFT = 0;
var DIRECTION = [
//sine and cosine 60deg increments, clockwise starting from 3:00
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444}
];

var tree;  // the snowflake
var age;  // global to tree
var originSnowflake;
var originTree;

var DEPTH = 7;
var cnv;

var nodes = [];

// snowflake growth animations
var ANIMATIONS = 1;  // 0 or 1
var ANIMATION_STEP = 1;


function setup() {
	cnv = createCanvas(windowWidth, windowHeight);
	// noLoop();
	resizeOrigins();
	tree = new btree();
}

function mousePressed() {
	makeSnowflake();
	// draw();
}

function draw() {
	background(255);
	stroke(0);
	var animationsDidHappen = animateGrowth(tree);
	drawTree(tree, originTree, 0);
	drawSnowflake(tree, originSnowflake);
	// save(cnv, 'output.png');
	// if(DEPTH >= 0 && !animationsDidHappen){
		// console.log("activating animations");
		// makeSnowflake();
		// DEPTH--;
	// }
}

function makeSnowflake(){
	growTree(tree);
	// logTree(tree);
}

function animateGrowth(tree){
	var animationsDidHappen = false;

	findLeaves(tree);

	function findLeaves(tree){
		if(tree.left){
			findLeaves(tree.left);
		}
		if(tree.right){
			findLeaves(tree.right);
		}
		if(tree.valueToBeGrown != undefined){
			animationsDidHappen = true;
			tree.value += ANIMATION_STEP;
			tree.valueToBeGrown -= ANIMATION_STEP;
			if(tree.valueToBeGrown <= 0){
				tree.value += tree.valueToBeGrown;
				tree.valueToBeGrown = undefined;
			}
		}
	}
	return animationsDidHappen;
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
		if(!hasChild){
			// do the thing
			if(tree.value - 5 > 0)
				tree.addChildren(tree.value, tree.value - 5);
		}
	}
}

function setGlobalTreeVariables(tree){
	// it's unclear how useful the second step is
	// there may not be any reason to store the same variable
	//   inside every node
	var searchedMaxDepth = 0;
	findGlobals(tree);
	setGlobals(tree);

	function findGlobals(node){
		if(node.depth > searchedMaxDepth)
			searchedMaxDepth = node.depth;
		if(node.left)
			findGlobals(node.left);
		if(node.right)
			findGlobals(node.right);
	}
	function setGlobals(node){
		node.maxDepth = searchedMaxDepth;
		if(node.left)
			setGlobals(node.left);
		if(node.right)
			setGlobals(node.right);
	}
}


// function makeValue(){
// 	if( int( random(8)) )
// 		return int( (random(32)) )+3;
// 	return int( (random(32)) )+60;
// }

function mod6(input){
	// throw in any value, negatives included, returns 0-5
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
}

function btree(parent, value){
	if(value == 0 || value == undefined)
		value = 20;
	// if animations are enabled, temporarily
	// store value in valueToBeGrown 
	if(ANIMATIONS){
		this.valueToBeGrown = value;
		this.value = 0;
	}
	else{
		this.value = value;
		this.valueToBeGrown = undefined;
	}
	this.childType;
	this.location;
	this.dead; // set true, force node to be a leaf
	this.branches;
	this.maxDepth = 0;

	// manage properties related to the data structure
	this.parent = parent;
	if(parent)
		this.depth = parent.depth+1;
	else{
		this.depth = 0;
		this.location = {x:0,y:0};
		this.direction = 0;
		this.branches = 0;
	}
	this.right = undefined;
	this.left = undefined;

	this.addChildren = function(leftValue, rightValue){
		this.left = new btree(this, leftValue);
		this.right = new btree(this, rightValue);
		this.right.childType = RIGHT;
		this.left.childType = LEFT;
		this.right.parent = this;
		this.left.parent = this;
		this.left.direction = this.direction;
		this.right.direction = mod6(this.direction+1);
		// calculateNumChildren(this, 0);
		// distributeMaxDepth(this, this.depth + 1);
		this.left.location = {x:(this.location.x + this.value * DIRECTION[this.direction].x), y:(this.location.y + this.value * DIRECTION[this.direction].y)};		
		this.right.location = {x:(this.location.x + this.value * DIRECTION[this.direction].x), y:(this.location.y + this.value * DIRECTION[this.direction].y)};
		this.left.maxDepth = this.maxDepth;
		this.right.maxDepth = this.maxDepth;
		this.left.branches = this.branches;
		this.right.branches = this.branches + 1;
	}
	// this.addLeft = function(child){
	// 	if(child == undefined)
	// 		child = new btree(this);
	// 	else
	// 		child.parent = this;
	// 	this.left = child;
	// }
	// this.addRight = function(child){
	// 	if(child == undefined)
	// 		child = new btree(this);
	// 	else
	// 		child.parent = this;
	// 	this.right = child;
	// }
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
			drawTree(tree.left, {x:start.x + tree.value * DIRECTION[angleDepth].x, y:start.y + tree.value * DIRECTION[angleDepth].y}, angleDepth);
		}
		if(tree.right != undefined){
			drawTree(tree.right, {x:start.x + tree.value * DIRECTION[angleDepth].x, y:start.y + tree.value * DIRECTION[angleDepth].y}, mod6(angleDepth+1));
		}
		line(start.x, start.y, start.x + tree.value * DIRECTION[angleDepth].x, start.y + tree.value * DIRECTION[angleDepth].y);
		// ellipse(start.x, start.y, 5, 5);
	}
}

function drawSnowflake(tree, start){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, start, i);

	function drawTreeWithReflections(tree, start, angle){
		if(tree != undefined){

			var endVec = {x:(start.x + tree.value * DIRECTION[angle].x), y:(start.y + tree.value * DIRECTION[angle].y)};

			stroke(0 + (200/DEPTH)*tree.depth);
			line(start.x, start.y, endVec.x, endVec.y);
			// ellipse(start.x, start.y, 5, 5);

			if(tree.left != undefined)
				drawTreeWithReflections(tree.left, endVec, angle);
			if(tree.right != undefined){
				drawTreeWithReflections(tree.right, endVec, mod6(angle+1) );
				drawTreeWithReflections(tree.right, endVec, mod6(angle-1) );
			}
		}
	}
}


function resizeOrigins(){
	if(windowWidth > windowHeight){
		originSnowflake = {x:windowWidth*.70, y:windowHeight*.5};
		originTree = {x:windowWidth*.133, y:windowHeight*.66};
	}
	else{
		originSnowflake = {x:windowWidth*.5, y:windowHeight*.4};
		originTree = {x:windowWidth*.3, y:windowHeight*.933};
	}
}
// function resizeOrigins(){
// 	if(windowWidth > windowHeight){
// 		originSnowflake = {x:windowWidth*.60, y:windowHeight*.5};
// 		originTree = {x:windowWidth*.033, y:windowHeight*.66};
// 	}
// 	else{
// 		originSnowflake = {x:windowWidth*.5, y:windowHeight*.4};
// 		originTree = {x:windowWidth*.3, y:windowHeight*.933};
// 	}
// }

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
			node.depth + "/" + 
			node.maxDepth + ") VALUE:(" + 
			node.value + ") PARENT:(" + 
			hasChildren + ") TYPE:(" + 
			node.childType + ") BRANCHES:(" + 
			node.branches + ")");
		logTree(node.left);
		logTree(node.right);
	}
}