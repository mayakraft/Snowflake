
var tree;  // the snowflake

// P5.JS

function setup() {
	createCanvas(windowWidth, windowHeight);
	noLoop();

	tree = new btree();
	buildSnowflake(tree);
	logTree(tree);
}

function draw() {
	background(255);
	drawSnowflake(tree, {x:width*.5, y:height*.5});
}

function mousePressed() {
	tree = new btree(undefined, makeValue());
	buildSnowflake(tree);
	background(255);
	draw();
}

// DATA STRUCTURES

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

function makeValue(){
	return int(random(65))+5;
}

function fixMod6(input){
	// throw in any value, negatives included, returns 0-5
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
}

function btree(parent, value){
	// define each node's properties here
	this.value = value;
	this.sumValue = undefined;
	this.numChildren = undefined;
	this.childType = undefined;

	// manage properties related to the data structure
	this.parent = parent;
	if(parent)
		this.level = parent.level+1;
	else
		this.level = 0;
	this.right = undefined;
	this.left = undefined;

	this.addChildren = function(){
		this.left = new btree(this);
		this.right = new btree(this);
		this.right.parent = this;
		this.left.parent = this;
		this.right.childType = RIGHT;
		this.left.childType = LEFT;
	}
	this.addChildren = function(leftValue, rightValue){
		this.left = new btree(this, leftValue);
		this.right = new btree(this, rightValue);
		this.right.parent = this;
		this.left.parent = this;
		this.right.childType = RIGHT;
		this.left.childType = LEFT;
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
		if(int(random(9)) && node.level < 4){
			// we are not a leaf
			var l = -1;
			var r = 0;
			while(r > l){
				l = makeValue();
				r = makeValue();
			}
			node.addChildren(l, r);
			buildSnowflake(node.left);
			buildSnowflake(node.right);
		}
		else{
			// we are a leaf
			node.numChildren = 0;
		}

		if(node.value == undefined)
			node.value = makeValue();
		node.sumValue = node.value;
		node.numChildren = 0;

		if(node.left != undefined){
			node.numChildren += 1 + node.left.numChildren;
			node.sumValue += 1 + node.left.sumValue;
		}
		if(node.right != undefined){
			node.numChildren += 1 + node.right.numChildren;
			node.sumValue += 1 + node.right.sumValue;
		}
	}
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

		stroke(200);
		line(start.x, start.y, start.x + tree.value * DIRECTION[angleDepth].x, start.y + tree.value * DIRECTION[angleDepth].y);
		ellipse(start.x, start.y, 5, 5);
	}
}

function drawTreeWithReflections(tree, start, angle){
	if(tree != undefined){

		var endPoint = new Vec2(start.x + tree.value * DIRECTION[angle].x, start.y + tree.value * DIRECTION[angle].y);

		stroke(0 + 40*tree.level);
		line(start.x, start.y, endPoint.x, endPoint.y);
		ellipse(start.x, start.y, 5, 5);

		if(tree.left != undefined)
			drawTreeWithReflections(tree.left, endPoint, angle);
		if(tree.right != undefined){
			drawTreeWithReflections(tree.right, endPoint, fixMod6(angle+1) );
			drawTreeWithReflections(tree.right, endPoint, fixMod6(angle-1) );
		}
	}
}

function logTree(node){
	if(node != undefined){
		console.log("Node ("+node.level+"): " + node.value + "(" + node.sumValue + ")  CH:(" + node.left + " " + node.right + ")  NumChildren:" + node.numChildren);
		logTree(node.left);
		logTree(node.right);
	}
}
