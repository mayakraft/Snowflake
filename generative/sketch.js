
var STICKY = .8;  // 0 means change every time, 1 means stay on course

//counter clockwise starting from 3:00
var DIRECTION = [
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444}
];

var tree;

var RIGHT = 1;
var LEFT = 0;

function makeValue(){
	return int(random(65))+5;
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	tree = new btree();
	buildSnowflake(tree);
	logTree(tree);
}

function draw() {
	background(255);
	drawSnowflake(tree, {x:width*.5, y:height*.5});
}

function mousePressed() {
	tree = new btree();
	buildSnowflake(tree);
	background(255);
}

function buildSnowflake(node){
	if(node != undefined){
		if(int(random(9)) && node.level < 4){
			// we are not a leaf
			node.addChildren();
			buildSnowflake(node.left);
			buildSnowflake(node.right);
		}
		else{
			// we are a leaf
			node.numChildren = 0;
		}

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

function fixMod6(input){
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
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

function btree(parent){
	// store fun stuff here
	this.value = undefined;
	this.sumValue = undefined;
	this.numChildren = undefined;
	this.childType = undefined;

	// data structure parts
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

function logTree(node){
	if(node != undefined){
		console.log("Node ("+node.level+"): " + node.value + "(" + node.sumValue + ")  CH:(" + node.left + " " + node.right + ")  NumChildren:" + node.numChildren);
		logTree(node.left);
		logTree(node.right);
	}
}

function Vec2(newX, newY){
	this.x = newX;
	this.y = newY;
};

function pointUnit(originVec2, directionVec2){
	this.origin = new Vec2(originVec2.x, originVec2.y);
	this.direction = new Vec2(directionVec2.x, directionVec2.y);

	this.grow = function(){

	}
};

function lineUnit(originVec2, direction, size){
	this.origin = new Vec2(originVec2.x, originVec2.y);
	this.direction = direction;
	this.size = size;
	this.grow = function(){
		this.size++;
	}
};

// adds 2 60deg sprouting lines from parent
function sprout(flake, index){
	var newOrigin = new Vec2(flake[index].origin.x + DIRECTION[flake[index].direction].x * flake[index].size, flake[index].origin.y + DIRECTION[flake[index].direction].y * flake[index].size);

	var d0 = flake[index].direction + 1;
	var d1 = flake[index].direction - 1;
	if(d0 >= DIRECTION.length)
		d0 -= DIRECTION.length;
	if(d1 < 0)
		d1 += DIRECTION.length;

	console.log(flake[index].origin.x + "  X:" + newOrigin.x + "  Y:" + newOrigin.y + "   " + d0 + "  " + d1);
	var sprout1 = new lineUnit(newOrigin, d0, 1);
	var sprout2 = new lineUnit(newOrigin, d1, 1);
	snowflake.push(sprout1);
	snowflake.push(sprout2);
}

// function drawSnowflake(origin, sf){
// 	var SCALE = 2.0;
// 	for(var i = 0; i < sf.length; i++){
// 		ellipse(origin.x + sf[i].origin.x * SCALE, origin.y + sf[i].origin.y * SCALE, SCALE, SCALE);
// 		// line(origin.x + sf[i].x, origin.y + sf[i].y);
// 	}
// }

// function drawSnowflakeLines(origin, flake){
// 	var SCALE = 2.0;
// 	for(var i = 0; i < flake.length; i++){
// 		var x1 = origin.x + flake[i].origin.x;
// 		var y1 = origin.y + flake[i].origin.y;
// 		var x2 = origin.x + flake[i].origin.x + (DIRECTION[flake[i].direction]).x * flake[i].size;
// 		var y2 = origin.y + flake[i].origin.y + (DIRECTION[flake[i].direction]).y * flake[i].size;
// 		line(x1, y1, x2, y2);
// 	}
// }

// function buildLineArrays(){
// 	var s = new Array();
// 	var start = new lineUnit({x:(0),y:(0)}, 0, 1);
// 	s.push(start);
// 	// for(var i = 1; i < 650; i++){
// 	// 	var rand = random(0,1);
// 	// }
// 	return s;
// }

// function buildPointArrays(){
// 	var s = new Array();
// 	var start = new pointUnit({x:(0),y:(0)}, {x:(1),y:(0)});
// 	s.push(start);
// 	for(var i = 1; i < 250; i++){  // do not start at 0 !
// 		var rand = random(0,1);
// 		var direction = s[i-1].direction;
// 		if(rand > STICKY){
// 			if(random(0,1) > .5){
// 				direction = D0
// 			}
// 			else{
// 				direction = D1
// 			}
// 		}
// 		var newX, newY;
// 		newX = s[i-1].origin.x + direction.x;
// 		newY = s[i-1].origin.y + direction.y;
// 		// console.log(direction);
// 		s.push(new pointUnit({x:newX, y:newY}, direction));
// 	}

// 	for(var i = 0; i < 100; i++){
// 		var r = int(random(10,250));
// 		var newIndex = int(s.length-1);
// 		var newDirection;
// 		if(s[r].direction.x == D0.x){
// 			newDirection = D1;
// 		}
// 		else if(s[r].direction.y == D1.y){
// 			newDirection = D0;
// 		}
// 		var newPosition = new Vec2(s[r].origin.x+newDirection.x, s[r].origin.y + newDirection.y);
// 		s.push(new pointUnit(newPosition, newDirection));
// 		// COPY CODE
// 		for(var j = 0; j < r; j++){
// 			var rand = random(0,1);
// 			var direction = s[newIndex-1].direction;
// 			if(rand > STICKY){
// 				if(random(0,1) > .5){
// 					direction = D0
// 				}
// 				else{
// 					direction = D1
// 				}
// 			}
// 			var newX, newY;
// 			// console.log("SIZE " + s.length + "(" + int(j+newIndex) + ")");
// 			// console.log("ORIGIN: " + s[j+newIndex].origin.x, s[j+newIndex].origin.y);
// 			newX = s[j+newIndex].origin.x + direction.x;
// 			newY = s[j+newIndex].origin.y + direction.y;
// 			// console.log(direction);
// 			var next = new pointUnit(new Vec2(newX, newY), direction);
// 			s.push(next);
// 		}
// 	}
// 	return s;
// }