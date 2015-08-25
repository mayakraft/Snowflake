// TYPES
var RIGHT = 1;
var LEFT = 0;
var DIRECTION = [
//counter clockwise 60deg increments starting from 3:00
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444}
];
function Vec2(newX, newY){
	this.x = newX;
	this.y = newY;
};
var tree;  // the snowflake
var age;  // global to tree, 
var originSnowflake;
var originTree;
// P5.JS

function resizeOrigins(){
	if(windowWidth > windowHeight){
		originSnowflake = {x:windowWidth*.60, y:windowHeight*.5};
		originTree = {x:windowWidth*.1, y:windowHeight*.66};
	}
	else{
		originSnowflake = {x:windowWidth*.5, y:windowHeight*.4};
		originTree = {x:windowWidth*.3, y:windowHeight*.933};
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	noLoop();

	resizeOrigins();

	tree = new btree();
	buildSnowflake(tree);

	cropValues(tree);

	logTree(tree);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	resizeOrigins();
}

function cropValues(node){
	if(node != undefined){
		console.log(node.location.x + ", " + node.location.y + "  ");
		if(node.left != undefined)
			cropValues(node.left);
		if(node.right != undefined)
			cropValues(node.right);
	}
}

function draw() {
	background(255);
	drawSnowflake(tree, originSnowflake);
	stroke(0);
	drawTree(tree, originTree, 0);
}

function mousePressed() {
	tree = new btree();//undefined, makeValue());
	buildSnowflake(tree);
	cropValues(tree);
	background(255);
	draw();
}

function makeValue(){
	return int(random(65))+5;
}
function makeValue2(start){
	// if(start.y/start.x > 0.57735026918962)  // 30deg rise over run
	// 	return 0;
	// var value = int(random(65))+5;
	// var check;
	// do{
	// 	check = new Vec2(start.x + DIRECTION[direction]*value, start.y + DIRECTION[direction]*value);
	// while(check.y / check.x < 0.57735026918962);

	// if(check.y / check.x > 0.57735026918962)
	// 	return 0;
	// return value;
	var value = int(random(65))+5;

	var pEnd = {x:(start.location.x + value * DIRECTION[start.direction].x), y:(start.location.y + value * DIRECTION[start.direction].y)};
	var result;
	result = RayLineIntersect({x:0,y:0}, {x:(cos(30/180*Math.PI)), y:(sin(30/180*Math.PI))}, {x:start.location.x, y:abs(start.location.y)}, {x:pEnd.x,y:abs(pEnd.y)});
	// console.log("RAY LINE INTERSECT: " + result.x + ", " + result.y  + "       " + pEnd.x + ", " + pEnd.y);

	if(result != undefined){
		// console.log("RESET: " + start.location.y + " " + start.location.x + "  (" (start.location.y/start.location.x) + ")");
		var distance = Math.sqrt( (result.x-start.location.x)*(result.x-start.location.x) + (result.y-abs(start.location.y))*(result.y-abs(start.location.y)) );
		start.dead = true;
		console.log("INTERSECTION, TRIED: " + value + "    FIX: " + distance);
		return distance;
	}
	return value;
}

function fixMod6(input){
	// throw in any value, negatives included, returns 0-5
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
}

function calculateNumChildren(node, num){
	if(node){	
		node.numChildren = node.numChildren + num + 2;
		if(node.parent){
			calculateNumChildren(node.parent, num);
		}
	}
}


function distributeMaxDepth(node, max){
	if(node){	
		if(node.maxDepth < max)
			node.maxDepth = max;
		if(node.parent){
			distributeMaxDepth(node.parent, max);
		}
	}
}

// function fillXYLocations(node){
// 	if(node){
// 		if(node.parent == undefined){
// 			node.location = new Vec2(0, 0);
// 		}
// 		else{
// 			node.location = new Vec2(node.parent.location.x + DIRECTION[node.direction].x * node.value, 
// 									 node.parent.location.y + DIRECTION[node.direction].y * node.value);
// 		}
// 		if(node.left)
// 			fillXYLocations(node.left);
// 		if(node.right)
// 			fillXYLocations(node.right);
// 	}
// }

// GEOMETRY

function RayLineIntersect(origin, dV, pA, pB){
	var v1 = { x:(origin.x - pA.x), y:(origin.y - pA.y) };
	var v2 = { x:(pB.x - pA.x), y:(pB.y - pA.y) };
	var v3 = { x:(-dV.y), y:(dV.x) };
	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
	// console.log("0 < " + t2 + " < 1       0 < " + t1);
	var p = undefined;
	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
		var dAB = new Vec2();
		var lengthAB = Math.sqrt( (pB.x-pA.x)*(pB.x-pA.x) + (pB.y-pA.y)*(pB.y-pA.y) );
		dAB.x = (pB.x - pA.x) / lengthAB;
		dAB.y = (pB.y - pA.y) / lengthAB;
		p = {x:(pA.x + lengthAB * t2 * dAB.x), y:(pA.y + lengthAB * t2 * dAB.y)};
	}
	return p;
}

function btree(parent, value){
	// define each node's properties here
	this.value = value;
	if(this.value == undefined)
		this.value = makeValue();
	this.sumValue = undefined;
	this.numChildren = 0;
	this.maxDepth = 0;
	this.childType;
	this.location;
	this.dead; // set to true if there is no room for this node to grow

	// manage properties related to the data structure
	this.parent = parent;
	if(parent)
		this.depth = parent.depth+1;
	else{
		this.depth = 0;
		this.location = {x:0,y:0};
		this.direction = 0;
	}
	this.right = undefined;
	this.left = undefined;

	this.addChildren = function(){
		this.left = new btree(this);
		this.right = new btree(this);
		this.right.childType = RIGHT;
		this.left.childType = LEFT;
		this.right.parent = this;
		this.left.parent = this;
		this.left.direction = this.direction;
		this.right.direction = fixMod6(this.direction+1);
		this.numChildren = 0;
		calculateNumChildren(this, 0);
		distributeMaxDepth(this, this.depth + 1);
		this.left.location = {x:(this.location.x + this.value * DIRECTION[this.direction].x), y:(this.location.y + this.value * DIRECTION[this.direction].y)};		
		this.right.location = {x:(this.location.x + this.value * DIRECTION[this.direction].x), y:(this.location.y + this.value * DIRECTION[this.direction].y)};
		this.left.maxDepth = this.maxDepth;
		this.right.maxDepth = this.maxDepth;

		this.left.value = makeValue2(this.left);
		this.right.value = makeValue2(this.right);
	}
	this.addChildren = function(leftValue, rightValue){
		this.left = new btree(this, leftValue);
		this.right = new btree(this, rightValue);
		this.right.childType = RIGHT;
		this.left.childType = LEFT;
		this.right.parent = this;
		this.left.parent = this;
		this.left.direction = this.direction;
		this.right.direction = fixMod6(this.direction+1);
		this.numChildren = 0;
		calculateNumChildren(this, 0);
		distributeMaxDepth(this, this.depth + 1);
		this.left.location = {x:(this.location.x + this.value * DIRECTION[this.direction].x), y:(this.location.y + this.value * DIRECTION[this.direction].y)};		
		this.right.location = {x:(this.location.x + this.value * DIRECTION[this.direction].x), y:(this.location.y + this.value * DIRECTION[this.direction].y)};
		this.left.maxDepth = this.maxDepth;
		this.right.maxDepth = this.maxDepth;

		this.left.value = makeValue2(this.left);
		this.right.value = makeValue2(this.right);
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


// GENERATE

function buildSnowflake(node){
	if(node != undefined){
		if(int(random(9)) && node.depth < 5 && node.dead != true){
			// we are not a leaf
			// var l = -1;
			// var r = 0;
			// while(r > l){
			// 	l = makeValue2(node);
			// 	r = makeValue2(node);
			// }
			// node.addChildren(l, r);
			node.addChildren();

			buildSnowflake(node.left);
			buildSnowflake(node.right);
		}
		else{
			// we are a leaf
			node.numChildren = 0;
		}

		if(node.value == undefined)
			node.value = makeValue2(node);
		node.sumValue = node.value;
		// node.numChildren = 0;

		if(node.left != undefined){
			// node.numChildren += 1 + node.left.numChildren;
			node.sumValue += 1 + node.left.sumValue;
		}
		if(node.right != undefined){
			// node.numChildren += 1 + node.right.numChildren;
			node.sumValue += 1 + node.right.sumValue;
		}
	}
	// return maxDepth;
}


// DRAWING & RENDERING

function drawSnowflake(tree, start){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, start, i);
}

function drawTree(tree, start, angleDepth){
	if(tree != undefined){
		if(tree.left != undefined)
			drawTree(tree.left, {x:start.x + tree.value * DIRECTION[angleDepth].x, y:start.y + tree.value * DIRECTION[angleDepth].y}, angleDepth);
		if(tree.right != undefined)
			drawTree(tree.right, {x:start.x + tree.value * DIRECTION[angleDepth].x, y:start.y + tree.value * DIRECTION[angleDepth].y}, angleDepth+1);

		line(start.x, start.y, start.x + tree.value * DIRECTION[angleDepth].x, start.y + tree.value * DIRECTION[angleDepth].y);
		ellipse(start.x, start.y, 5, 5);
	}
}

function drawTreeWithReflections(tree, start, angle){
	if(tree != undefined){

		var endVec2 = new Vec2(start.x + tree.value * DIRECTION[angle].x, start.y + tree.value * DIRECTION[angle].y);

		stroke(0 + 40*tree.depth);
		line(start.x, start.y, endVec2.x, endVec2.y);
		ellipse(start.x, start.y, 5, 5);

		if(tree.left != undefined)
			drawTreeWithReflections(tree.left, endVec2, angle);
		if(tree.right != undefined){
			drawTreeWithReflections(tree.right, endVec2, fixMod6(angle+1) );
			drawTreeWithReflections(tree.right, endVec2, fixMod6(angle-1) );
		}
	}
}

function logTree(node){
	if(node != undefined){
		console.log("Node ("+node.depth+"/" + node.maxDepth + "): " + node.value + "(" + node.sumValue + ")  CH:(" + node.left + " " + node.right + ")  NumChildren:" + node.numChildren );
		logTree(node.left);
		logTree(node.right);
	}
}
