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

var tree;  // the snowflake
var age;  // global to tree, 
var originSnowflake;
var originTree;

var DEPTH = 7;
// P5.JS

function resizeOrigins(){
	if(windowWidth > windowHeight){
		originSnowflake = {x:windowWidth*.60, y:windowHeight*.5};
		originTree = {x:windowWidth*.033, y:windowHeight*.66};
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

	// logTree(tree);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	resizeOrigins();
}

function draw() {
	background(255);
	drawFilledSnowflake(tree, originSnowflake, 0);
	// drawOutlineSnowflake(tree, originSnowflake);
	// drawArtifacts(originSnowflake, originTree);
	stroke(0);
	drawTree(tree, originTree, 0);
}

function mousePressed() {
	tree = new btree();//undefined, makeValue());
	buildSnowflake(tree);
	var i = 0;
	while(tree.maxDepth < 3 && i < 10){
		tree = new btree();
		buildSnowflake(tree);
		i++;
	}
	background(255);
	draw();
}

function makeValue(){
	if( int( random(8)) )
		return int( (random(32)) )+3;
	return int( (random(32)) )+60;
}
function makeValue2(start){
	var value = makeValue();

	var pEnd = {x:(start.location.x + value * DIRECTION[start.direction].x), y:(start.location.y + value * DIRECTION[start.direction].y)};
	var result;
	result = RayLineIntersect({x:0,y:0}, {x:(cos(30/180*Math.PI)), y:(sin(30/180*Math.PI))}, {x:start.location.x, y:abs(start.location.y)}, {x:pEnd.x,y:abs(pEnd.y)});
	// console.log("RAY LINE INTERSECT: " + result.x + ", " + result.y  + "       " + pEnd.x + ", " + pEnd.y);

	if(result != undefined){
		// console.log("RESET: " + start.location.y + " " + start.location.x + "  (" (start.location.y/start.location.x) + ")");
		var distance = Math.sqrt( (result.x-start.location.x)*(result.x-start.location.x) + (result.y-abs(start.location.y))*(result.y-abs(start.location.y)) );
		start.dead = true;
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
	this.dead; // set true, force node to be a leaf
	this.numForks;

	// manage properties related to the data structure
	this.parent = parent;
	if(parent)
		this.depth = parent.depth+1;
	else{
		this.depth = 0;
		this.location = {x:0,y:0};
		this.direction = 0;
		this.numForks = 0;
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
		this.left.numForks = this.numForks;
		this.right.numForks = this.numForks + 1;


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
		this.left.numForks = this.numForks;
		this.right.numForks = this.numForks + 1;

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
		if(int(random(9)) && node.depth < DEPTH && node.dead != true){
			// we are not a leaf
			// var l = -1;
			// var r = 0;
			// while(r > l){
			// 	l = makeValue2(node);
			// 	r = makeValue2(node);
			// }
			// node.addChildren(l, r);
			node.addChildren();

			var i = 0;
			while(i < 100 && node.right.value > node.left.value){
				node.right.value = makeValue2(node.right);
				node.left.value = makeValue2(node.left);
				i++;
				if(i == 100)
					console.log("Well this is awkward");
			}

			// if(node.numForks < 1){
				buildSnowflake(node.left);
				buildSnowflake(node.right);
			// }
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

}


// DRAWING & RENDERING

function drawSnowflake(tree, start){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, start, i);
}

function drawOutlineSnowflake(tree, start){
	for(var i = 0; i < 6; i++)
		drawHexagonTreeWithReflections(tree, start, i);
}

function drawFilledSnowflake(tree, start){
	// noStroke();
	// colorMode(HSB, 255);
	for(var i = 0; i < 6; i++)
		drawFilledHexagonTreeWithReflections(tree, start, i);
	drawFilledHexagonTreeWithReflections(tree, start, 0);
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

		var endVec = {x:(start.x + tree.value * DIRECTION[angle].x), y:(start.y + tree.value * DIRECTION[angle].y)};

		stroke(0 + (200/DEPTH)*tree.depth);
		line(start.x, start.y, endVec.x, endVec.y);
		ellipse(start.x, start.y, 5, 5);

		if(tree.left != undefined)
			drawTreeWithReflections(tree.left, endVec, angle);
		if(tree.right != undefined){
			drawTreeWithReflections(tree.right, endVec, fixMod6(angle+1) );
			drawTreeWithReflections(tree.right, endVec, fixMod6(angle-1) );
		}
	}
}


function drawHexagonTreeWithReflections(tree, start, angle){
	var VOLUME = 10;
	if(tree != undefined){

		var endVec = {x:(start.x + tree.value * DIRECTION[angle].x), y:(start.y + tree.value * DIRECTION[angle].y)};

		// first go to the bottom of tree, following the main stem
		if(tree.left != undefined)
			drawHexagonTreeWithReflections(tree.left, endVec, angle);



		stroke(0);
		// stroke(0 + (200/DEPTH)*tree.depth);
		VOLUME = 50 - 50 * (tree.depth / tree.maxDepth) + 1 + random(2);
		var point1a, point1b, point2a, point2b;
		// var distance = sqrt(Math.pow(endVec.x - start.x,2) + Math.pow(endVec.y - start.y,2) );
		if(VOLUME > tree.value ){ 
			point1a = {x:(start.x + tree.value * DIRECTION[fixMod6(angle-1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle-1)].y) };
			point1b = {x:(start.x + tree.value * DIRECTION[fixMod6(angle+1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle+1)].y) };
			point2a = {x:(endVec.x - tree.value * DIRECTION[fixMod6(angle+1)].x), y:(endVec.y - tree.value * DIRECTION[fixMod6(angle+1)].y) };
			point2b = {x:(endVec.x - tree.value * DIRECTION[fixMod6(angle-1)].x), y:(endVec.y - tree.value * DIRECTION[fixMod6(angle-1)].y) };
		}
		else{
			point1a = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle-1)].y) };
			point1b = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle+1)].y) };
			point2a = {x:(endVec.x - VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(endVec.y - VOLUME * DIRECTION[fixMod6(angle+1)].y) };
			point2b = {x:(endVec.x - VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(endVec.y - VOLUME * DIRECTION[fixMod6(angle-1)].y) };
		}

		// line(start.x, start.y, endVec.x, endVec.y);       // the major artery
		line(start.x, start.y, point1a.x, point1a.y);
		line(start.x, start.y, point1b.x, point1b.y);

		line(point1a.x, point1a.y, point2a.x, point2a.y);
		line(point1b.x, point1b.y, point2b.x, point2b.y);

		line(point2a.x, point2a.y, endVec.x, endVec.y);
		line(point2b.x, point2b.y, endVec.x, endVec.y);

// ellipse? do we want the ellipse?
		ellipse(start.x, start.y, 5, 5);

		if(tree.right != undefined){
			drawHexagonTreeWithReflections(tree.right, endVec, fixMod6(angle+1) );
			drawHexagonTreeWithReflections(tree.right, endVec, fixMod6(angle-1) );
		}
	}
}



function drawFilledHexagonTreeWithReflections(tree, start, angle){
	var VOLUME = 10;
	if(tree != undefined){

		var endVec = {x:(start.x + tree.value * DIRECTION[angle].x), y:(start.y + tree.value * DIRECTION[angle].y)};

		// first go to the bottom of tree, following the main stem
		if(tree.left != undefined)
			drawFilledHexagonTreeWithReflections(tree.left, endVec, angle);




		if(tree.right != undefined){
			drawFilledHexagonTreeWithReflections(tree.right, endVec, fixMod6(angle+1) );
			drawFilledHexagonTreeWithReflections(tree.right, endVec, fixMod6(angle-1) );
		}
		
		// stroke(0 + (200/DEPTH)*tree.depth);
		VOLUME = 50 - 50 * (tree.depth / tree.maxDepth) + 1 + random(2);
		var point1a, point1b, point2a, point2b;
		// var distance = sqrt(Math.pow(endVec.x - start.x,2) + Math.pow(endVec.y - start.y,2) );
		// if(VOLUME > tree.value ){ 
		// 	point1a = {x:(start.x + tree.value * DIRECTION[fixMod6(angle-1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle-1)].y) };
		// 	point1b = {x:(start.x + tree.value * DIRECTION[fixMod6(angle+1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle+1)].y) };
		// 	point2a = {x:(endVec.x - tree.value * DIRECTION[fixMod6(angle+1)].x), y:(endVec.y - tree.value * DIRECTION[fixMod6(angle+1)].y) };
		// 	point2b = {x:(endVec.x - tree.value * DIRECTION[fixMod6(angle-1)].x), y:(endVec.y - tree.value * DIRECTION[fixMod6(angle-1)].y) };
		// }
		// else{
		// 	point1a = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle-1)].y) };
		// 	point1b = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle+1)].y) };
		// 	point2a = {x:(endVec.x - VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(endVec.y - VOLUME * DIRECTION[fixMod6(angle+1)].y) };
		// 	point2b = {x:(endVec.x - VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(endVec.y - VOLUME * DIRECTION[fixMod6(angle-1)].y) };
		// }
		if(VOLUME > tree.value ){ 
			point1a = {x:(start.x - tree.value * DIRECTION[fixMod6(angle+1)].x), y:(start.y - tree.value * DIRECTION[fixMod6(angle+1)].y) };
			point1b = {x:(start.x - tree.value * DIRECTION[fixMod6(angle-1)].x), y:(start.y - tree.value * DIRECTION[fixMod6(angle-1)].y) };
			point2a = {x:(endVec.x - tree.value * DIRECTION[fixMod6(angle+1)].x), y:(endVec.y - tree.value * DIRECTION[fixMod6(angle+1)].y) };
			point2b = {x:(endVec.x - tree.value * DIRECTION[fixMod6(angle-1)].x), y:(endVec.y - tree.value * DIRECTION[fixMod6(angle-1)].y) };
		}
		else{
			point1a = {x:(start.x - VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(start.y - VOLUME * DIRECTION[fixMod6(angle+1)].y) };
			point1b = {x:(start.x - VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(start.y - VOLUME * DIRECTION[fixMod6(angle-1)].y) };
			point2a = {x:(endVec.x - VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(endVec.y - VOLUME * DIRECTION[fixMod6(angle+1)].y) };
			point2b = {x:(endVec.x - VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(endVec.y - VOLUME * DIRECTION[fixMod6(angle-1)].y) };
		}
		// if we're the top, do a single hexagon, not the modified kind
		if(tree.parent == undefined){
			if(VOLUME > tree.value ){ 
				point1a = {x:(start.x + tree.value * DIRECTION[fixMod6(angle-1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle-1)].y) };
				point1b = {x:(start.x + tree.value * DIRECTION[fixMod6(angle+1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle+1)].y) };
			}
			else{
				point1a = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle-1)].y) };
				point1b = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle+1)].y) };
			}
		}
		else{
			if(tree.childType == RIGHT){
				if(VOLUME > tree.value ){ 
					// point1a = {x:(start.x + tree.value * DIRECTION[fixMod6(angle-1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle-1)].y) };
					point1b = {x:(start.x + tree.value * DIRECTION[fixMod6(angle+1)].x), y:(start.y + tree.value * DIRECTION[fixMod6(angle+1)].y) };
				}
				else{
					// point1a = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle-1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle-1)].y) };
					point1b = {x:(start.x + VOLUME * DIRECTION[fixMod6(angle+1)].x), y:(start.y + VOLUME * DIRECTION[fixMod6(angle+1)].y) };

				}
			}
		}

		// var from = color(230, 230, 255, 100);
		// var to = color(0, 0, 255, 100);
		// var interp = lerpColor(from, to, tree.depth/tree.maxDepth);
		// fill(interp);

		// fill(color(255 * tree.depth/tree.maxDepth, 127, 255));
		noStroke();
		fill(255);//255*tree.depth/tree.maxDepth,100);

		beginShape(TRIANGLE_STRIP);
		vertex(start.x, start.y);
		vertex(point1a.x, point1a.y);
		vertex(point1b.x, point1b.y);
		vertex(point2a.x, point2a.y);
		vertex(point2b.x, point2b.y);
		vertex(endVec.x, endVec.y);
		endShape();

		stroke(1);

		line(start.x, start.y, point1a.x, point1a.y);
		line(start.x, start.y, point1b.x, point1b.y);

		line(point1a.x, point1a.y, point2a.x, point2a.y);
		line(point1b.x, point1b.y, point2b.x, point2b.y);

		line(point2a.x, point2a.y, endVec.x, endVec.y);
		line(point2b.x, point2b.y, endVec.x, endVec.y);

	}
}


function drawArtifacts(snowflakeCenter, treeCenter){
	stroke(240);
	var LENGTH = 250;
	strokeWeight(8);
	strokeCap(ROUND);
	line(treeCenter.x, treeCenter.y, treeCenter.x + LENGTH*cos(30/180*Math.PI), treeCenter.y - LENGTH*sin(30/180*Math.PI));
	line(treeCenter.x, treeCenter.y, treeCenter.x + LENGTH*cos(0/180*Math.PI), treeCenter.y + LENGTH*sin(0/180*Math.PI));
	// for(var i = 0; i < 20; i++){
	// 	var x = lerp(treeCenter.x - XOFFSET, treeCenter.x - XOFFSET + LENGTH*cos(30/180*Math.PI), i/20);
	// 	var y = lerp(treeCenter.y, treeCenter.y - LENGTH*sin(30/180*Math.PI), i/20);
	// 	console.log(x + " " + y);
	// 	ellipse(x,y,3,3);
	// }
	// line(treeCenter.x - 30, treeCenter.y, treeCenter.x - 30 + 50*cos(30/180*Math.PI), treeCenter.y + 50*sin(30/180*Math.PI));
	strokeCap(SQUARE);
	strokeWeight(1);
}

function logTree(node){
	if(node != undefined){
		console.log("Node ("+node.depth+"/" + node.maxDepth + "): " + node.value + "(" + node.sumValue + ")  CH:(" + node.left + " " + node.right + ")  NumChildren:" + node.numChildren );
		logTree(node.left);
		logTree(node.right);
	}
}
