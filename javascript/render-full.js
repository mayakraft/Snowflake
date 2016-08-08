

// PROGRAM PARAMETERS
const ANIMATIONS = 0;  // 0 or 1, turn animations OFF or ON

// these refer to the animation cycle, the time between 2 frames of growth
var CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
var CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
var CYCLE_FRAME = 0;
var CYCLE_NUM = 0;
// canvas stuff
var canvas;  // HTML canvas, for saving image
var originSnowflake;  // screen coordinates
var originTree;       // screen coordinates

////////////////////////////////
//  P5.JS
//////////////////////////////

function resetAnimation(){
	CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
	CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
	CYCLE_FRAME = 0;
	CYCLE_NUM = 0;
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	resizeOrigins();
	frameRate(60);
 	ITERATIONS = random(8) + 14;
	initTree();
	if(ANIMATIONS)
		;
		// setInterval(function(){initTree();}, 12000);
	else{
		noLoop();
		// grow and draw a tree
		for(var i = 0; i < ITERATIONS; i++){
			growTree(tree, {"pressure":atmos.pressure[i], "density":atmos.density[i], "moisture":atmos.moisture[i]});
		}
		draw();
	}
}

function mousePressed() {
	// DEPTH++;
	// if(!ANIMATIONS){
	// 	growTree(tree);
	// 	draw(tree);
	// }
	initTree();
	for(var i = 0; i < ITERATIONS; i++){
		growTree(tree, {"pressure":atmos.pressure[i], "density":atmos.density[i], "moisture":atmos.moisture[i]});
	}
	draw();
}
function draw() {
	background(0);
	// a 30 deg line showing the crop position on the wedge
	// stroke(200);
	// line(originTree.x, originTree.y, originTree.x + 200*cos(30/180*Math.PI), originTree.y - 200*sin(30/180*Math.PI));

	var SLICE_LENGTH = 160;
	fill(40, 255);
	beginShape();
	vertex(originTree.x, originTree.y);
	vertex(originTree.x + SLICE_LENGTH*cos(30/180*Math.PI), originTree.y - SLICE_LENGTH*sin(30/180*Math.PI));
	vertex(originTree.x + SLICE_LENGTH/(sqrt(3)*.5), originTree.y);
	endShape(CLOSE);

	drawAtmosphere({x:originTree.x, y:originTree.y+80});

	stroke(255);
	noFill();
	drawTree(tree, originTree, 0);
	noStroke();
	fill(255, 80);
	drawSnowflake(tree, originSnowflake);
	// stroke(255);
	// noFill();
	// drawSnowflakeTree(tree, originSnowflake);
	// stroke(0);
	// drawSnowflakeTree(tree, originSnowflake);
	// save(canvas, 'output.png');
	if(ANIMATIONS){
		CYCLE_PROGRESS = CYCLE_FRAME / CYCLE_LENGTH;

		animateGrowth(tree, CYCLE_PROGRESS);
	
		if(CYCLE_FRAME >= CYCLE_LENGTH && CYCLE_NUM < ITERATIONS){
			stopAllAnimations(tree);
			growTree(tree, {"pressure":atmos.pressure[CYCLE_NUM], "density":atmos.density[CYCLE_NUM], "moisture":atmos.moisture[CYCLE_NUM]});
			CYCLE_NUM++;
			CYCLE_FRAME = 0;
			CYCLE_PROGRESS = CYCLE_FRAME / CYCLE_LENGTH;
			// stopAllAnimations(tree);
			// growTree(tree);
		}
		if(CYCLE_FRAME < CYCLE_LENGTH)
			CYCLE_FRAME++;
	}
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

////////////////////////////////
// DRAWING & RENDERING
////////////////////////////////
function drawAtmosphere(origin){
	var SCALE_Y = 20;
	var SCALE_X = matter * .5;
	noStroke();
	fill(40,255);
	beginShape();
	vertex(origin.x, origin.y - SCALE_Y);
	vertex(origin.x + (ITERATIONS-.5)*SCALE_X, origin.y - SCALE_Y);
	vertex(origin.x + (ITERATIONS-.5)*SCALE_X, origin.y);
	vertex(origin.x, origin.y);
	endShape(CLOSE);

	for(var i = 0; i < ITERATIONS - 1; i++){
		stroke(255,0,0);
		line(origin.x + (i)*SCALE_X, origin.y - atmos.pressure[i] * SCALE_Y, 
			origin.x + (i+1)*SCALE_X, origin.y - atmos.pressure[i+1] * SCALE_Y);
		stroke(0,255,0);
		line(origin.x + (i)*SCALE_X, origin.y - atmos.moisture[i] * SCALE_Y, 
			origin.x + (i+1)*SCALE_X, origin.y - atmos.moisture[i+1] * SCALE_Y);
		stroke(70,70,255);
		line(origin.x + (i)*SCALE_X, origin.y - atmos.density[i] * SCALE_Y, 
			origin.x + (i+1)*SCALE_X, origin.y - atmos.density[i+1] * SCALE_Y);
	}
}

function drawTree(node, start, angleDepth){
	if(node != undefined){
		if(node.left != undefined){
			drawTree(node.left, {x:start.x + node.length * HEX_30_ANGLE[angleDepth].x, y:start.y + node.length * HEX_30_ANGLE[angleDepth].y}, angleDepth);
		}
		if(node.right != undefined){
			drawTree(node.right, {x:start.x + node.length * HEX_30_ANGLE[angleDepth].x, y:start.y + node.length * HEX_30_ANGLE[angleDepth].y}, mod6(angleDepth+1));
		}
		var length = node.length;
		end = {x:(start.x + length * HEX_30_ANGLE[angleDepth].x),
			   y:(start.y + length * HEX_30_ANGLE[angleDepth].y)};
		line(start.x, start.y, end.x, end.y);
		ellipse(end.x, end.y, 5, 5);
	}
}
function drawSnowflake(node, location){
	// var largest = Math.max.apply(Math, mainArmRejoinPoints);
	// fill(255, 128);
	// drawCenterHexagon(location, largest);
	// fill(255, 128 / mainArmRejoinPoints.length);
	// for(var i = 0; i < mainArmRejoinPoints.length; i++)
	// 	drawCenterHexagon(location, mainArmRejoinPoints[i]);
	
	for(var angle = 0; angle < 6; angle+=2){
		// if(node.seedMoment != undefined && node.parent != undefined){
		// 	var distance = node.seedMoment * node.parent.thickness;
		// 	var adjustedLocation = {x:(location.x + length * HEX_ANGLE[node.angle].x),
		// 	                        y:(location.y + length * HEX_ANGLE[node.angle].y)};
		// 	drawHexagonTreeWithReflections(node, adjustedLocation, angle);
		// }
		// else{
			drawHexagonTreeWithReflections(node, location, angle);
		// }
	}
	for(var angle = 1; angle < 6; angle+=2){
		// if(node.seedMoment != undefined && node.parent != undefined){
		// 	var distance = node.seedMoment * node.parent.thickness;
		// 	var adjustedLocation = {x:(location.x + length * HEX_ANGLE[node.angle].x),
		// 	                        y:(location.y + length * HEX_ANGLE[node.angle].y)};
		// 	drawHexagonTreeWithReflections(node, adjustedLocation, angle);
		// }
		// else{
			drawHexagonTreeWithReflections(node, location, angle);
		// }
	}
	// fill(20*node.age + 150, 255);
	// drawCenterHexagon(node, location);
	function drawCenterHexagon(start, radius){
		beginShape();
		for(var angle = 0; angle < 6; angle++){
			var point = {
					x:(start.x + (radius) * HEX_ANGLE[mod6(angle)].x),
					y:(start.y + (radius) * HEX_ANGLE[mod6(angle)].y) };
			vertex(point.x, point.y);
		}
		endShape(CLOSE);
	}
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
			if(node.data.thinness != undefined){
				var thinness = (node.data.thinness) * thickness;
				var edges = [point1b, point2b, endThick, point2a, point1a];
				for(var i = 0; i < 4; i++){
					var fillChange = - (sin(-.05 + mod6(angle-(i - 1.5)))*2);  // dramatic lighting
					fill(fillValue + fillChange*10, 250);
					var edgeNear = {
						x:(edges[i].x + thinness * HEX_ANGLE[mod6(angle-i)].x),
						y:(edges[i].y + thinness * HEX_ANGLE[mod6(angle-i)].y) };
					var edgeFar = {
						x:(edges[i+1].x + thinness * HEX_ANGLE[mod6(angle-i + 3)].x),
						y:(edges[i+1].y + thinness * HEX_ANGLE[mod6(angle-i + 3)].y) };
					var innerNear = {
						x:(edgeNear.x + thinness * HEX_ANGLE[mod6(angle-i+2 + 3)].x),
						y:(edgeNear.y + thinness * HEX_ANGLE[mod6(angle-i+2 + 3)].y) };
					var innerFar = {
						x:(edgeFar.x + thinness * HEX_ANGLE[mod6(angle-i+4)].x),
						y:(edgeFar.y + thinness * HEX_ANGLE[mod6(angle-i+4)].y) };
					beginShape();
					vertex(edgeNear.x, edgeNear.y);
					vertex(edgeFar.x, edgeFar.y);
					vertex(innerFar.x, innerFar.y);
					vertex(innerNear.x, innerNear.y);
					endShape(CLOSE);
				}
			}

		}
	}
}

function drawSnowflakeTree(tree, location){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, location, i);
	function drawTreeWithReflections(tree, location, angle){
		if(tree != undefined){
			var length = tree.length;
			var start = location;
			var end = {
				x:(location.x + length * HEX_ANGLE[angle].x), 
				y:(location.y + length * HEX_ANGLE[angle].y)
			};
			// stroke(0 + (200/tree.maxGeneration)*tree.generation);
			line(start.x, start.y, end.x, end.y);
			if(tree.left != undefined)
				drawTreeWithReflections(tree.left, end, angle);
			if(tree.right != undefined){
				drawTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
			ellipse(end.x, end.y, 5, 5);
		}
	}
}
function resizeOrigins(){
	if(windowWidth > windowHeight){
		originSnowflake = {x:windowWidth*.66, y:windowHeight*.5};
		originTree = {x:windowWidth*.066, y:windowHeight*.66};
	}
	else{
		originSnowflake = {x:windowWidth*.5, y:windowHeight*.4};
		originTree = {x:windowWidth*.3, y:windowHeight*.933};
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	resizeOrigins();
}
