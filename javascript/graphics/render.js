var HEX_BRANCH = [ {x:1, y:0}, {x:0.5,y:-0.866025403784439}, {x:-0.5,y:-0.866025403784439}, {x:-1, y:0}, {x:-0.5,y:0.866025403784439}, {x:0.5,y:0.866025403784439} ];

/////////////////////////////////////////////////////////////
//////////////////      SNOWFLAKE         ///////////////////
/////////////////////////////////////////////////////////////

var getLength = nodeLengthFromNode;
var getThickness = nodeThicknessFromNode;

//TODO 
//lines that go through the center
// lines that also go inside, but pointing toward the far edges
//    - both in 60 deg and also 30 deg angles
//    - do the latter if the length v thickness equivocates to about a regular hexagon
//

Snowflake.prototype.setUseLength = function(input){
	this.useLength = input;
	if(this.useLength){
		getLength = nodeLengthFromNode;
	} else{
		getLength = nodeLengthCascading;		
	}
	// 	getLength = nodeLengthLinear;
}

Snowflake.prototype.setUseThickness = function(input){
	this.useThickness = input;
	if(this.useThickness){
		getThickness = nodeThicknessFromNode;
	} else{
		getThickness = nodeThicknessCascading;		
	}
	// 	getThickness = nodeThicknessLinear;
}

Snowflake.prototype.setDrawStyle = function(input){
	if(input == 0){
		this.draw = this.drawBinaryTree;
	} else if(input == 1){
		this.draw = this.drawSnowflakeOneArm;
	} else if (input == 2){
		this.draw = this.drawSnowflake6Sides;
	}
}

Snowflake.prototype.setNodeStyle = function(input){
	this.drawBetweenNodes = drawBetweenNodesHex;
	
	if(input == 0){
		this.drawBetweenNodes = drawLineWithDots;
	} else if(input == 1){
		this.drawBetweenNodes = drawBetweenNodesHex;
	}

	// if(input == 0){
	// 	if(this.showWireframe){
	// 		this.drawBetweenNodes = function(){
	// 			drawBetweenNodesRect();
	// 			drawLineWithDots();
	// 		};
	// 	} else{
	// 		this.drawBetweenNodes = function(){
	// 			drawLineWithDots();
	// 		};
	// 	}
	// } else if (input == 1){
	// 	if(this.showWireframe){
	// 		this.drawBetweenNodes = function(){
	// 			drawBetweenNodesRect();
	// 			drawBetweenNodesHex();
	// 		};
	// 	} else{
	// 		this.drawBetweenNodes = function(){
	// 			drawBetweenNodesHex();
	// 		};
	// 	}
	// }
}

// call these to draw:
Snowflake.prototype.drawBinaryTree = function(position){      this.recurseSimple(this.tree, position);   }
Snowflake.prototype.drawSnowflakeOneArm = function(position){ this.recurseReflect(this.tree, position, 0); }
Snowflake.prototype.drawSnowflake6Sides = function(position){
	for(var angle = 0; angle < 6; angle += 2)
		this.recurseReflect(this.tree, position, angle);
	for(var angle = 1; angle < 6; angle += 2)
		this.recurseReflect(this.tree, position, angle);
}

/////////// DRAWING
///////////
// this actually does the drawing
// this function gets called at every iteration of the recusive crawl
function drawLineWithDots(start, end, angle, thickness){
	line(start.x, start.y, end.x, end.y);
	ellipse(end.x, end.y, 6, 6);
}

function drawBetweenNodesHex(start, end, angle, thickness){
	var length = Math.sqrt( Math.pow(end.y-start.y,2) + Math.pow(end.x-start.x,2) );
	if(thickness == undefined){
		thickness = 0.5*length;
	}
	var thick60deg = thickness * 1.154700538379252;
	line(start.x, start.y, 
		 start.x + thick60deg * HEX_BRANCH[mod6(angle+1)].x, 
		 start.y + thick60deg * HEX_BRANCH[mod6(angle+1)].y);
	line(start.x, start.y, 
		 start.x + thick60deg * HEX_BRANCH[mod6(angle-1)].x, 
		 start.y + thick60deg * HEX_BRANCH[mod6(angle-1)].y);
	line(end.x + thick60deg * HEX_BRANCH[angle].x, 
		 end.y + thick60deg * HEX_BRANCH[angle].y, 
		 end.x + thick60deg * HEX_BRANCH[mod6(angle+1)].x, 
		 end.y + thick60deg * HEX_BRANCH[mod6(angle+1)].y);
	line(end.x + thick60deg * HEX_BRANCH[angle].x,
	     end.y + thick60deg * HEX_BRANCH[angle].y, 
		 end.x + thick60deg * HEX_BRANCH[mod6(angle-1)].x, 
		 end.y + thick60deg * HEX_BRANCH[mod6(angle-1)].y);
	line(start.x + thick60deg * HEX_BRANCH[mod6(angle-1)].x, 
		 start.y + thick60deg * HEX_BRANCH[mod6(angle-1)].y,
		 end.x + thick60deg * HEX_BRANCH[mod6(angle-1)].x, 
		 end.y + thick60deg * HEX_BRANCH[mod6(angle-1)].y);
	line(start.x + thick60deg * HEX_BRANCH[mod6(angle+1)].x, 
		 start.y + thick60deg * HEX_BRANCH[mod6(angle+1)].y,
		 end.x + thick60deg * HEX_BRANCH[mod6(angle+1)].x, 
		 end.y + thick60deg * HEX_BRANCH[mod6(angle+1)].y);
	// line(start.x, start.y, end.x, end.y);
	// ellipse(end.x, end.y, 6, 6);
}

function drawBetweenNodesHexFilled(start, end, angle, thickness){

	// LENGTH and THICKNESS
	var length = Math.sqrt(Math.pow(end.x-start.x,2) + Math.pow(end.y-start.y,2));

	// PARENT NODE LENGTH and THICKNESS
	var pLength = 0;
	var pThickness = 0;
	// if(node.parent != undefined){
	// 	pLength = getLength(node.parent);
	// 	pThickness = getThickness(node.parent);
	// } else{
	// 	pLength = 0; pThickness = 0;
	// }

	// START AND END
	var startThick = {
		x:(start.x + pThickness * HEX_BRANCH[angle].x), 
		y:(start.y + pThickness * HEX_BRANCH[angle].y)
	};
	var endThick = {
		x:(start.x + (length+thickness) * HEX_BRANCH[angle].x), 
		y:(start.y + (length+thickness) * HEX_BRANCH[angle].y)
	};
	var thckAng = 2;
	if(thickness > pThickness){
		startThick = start;
		thckAng = 1;
	}

	var point1a = {
		x:(startThick.x + thickness * HEX_BRANCH[mod6(angle-thckAng)].x),
		y:(startThick.y + thickness * HEX_BRANCH[mod6(angle-thckAng)].y) };
	var point1b = {
		x:(startThick.x + thickness * HEX_BRANCH[mod6(angle+thckAng)].x),
		y:(startThick.y + thickness * HEX_BRANCH[mod6(angle+thckAng)].y) };
	var point2a = {
		x:(end.x - thickness * HEX_BRANCH[mod6(angle+2)].x),
		y:(end.y - thickness * HEX_BRANCH[mod6(angle+2)].y) };
	var point2b = {
		x:(end.x - thickness * HEX_BRANCH[mod6(angle-2)].x),
		y:(end.y - thickness * HEX_BRANCH[mod6(angle-2)].y) };

	// fill(255, 128 * sqrt(1.0/node.generation));
	// var fillValue = 5*node.age + 150;// + (node.randomValue[angle%6]-5)*2;
	// fill(fillValue, 250);

	fill(255, 120);
	noStroke();

	beginShape();
	// vertex(startThick.x, startThick.y);
	vertex(start.x, start.y);
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
	// 			x:(edges[i].x + thinness * HEX_BRANCH[mod6(angle-i)].x),
	// 			y:(edges[i].y + thinness * HEX_BRANCH[mod6(angle-i)].y) };
	// 		var edgeFar = {
	// 			x:(edges[i+1].x + thinness * HEX_BRANCH[mod6(angle-i + 3)].x),
	// 			y:(edges[i+1].y + thinness * HEX_BRANCH[mod6(angle-i + 3)].y) };
	// 		var innerNear = {
	// 			x:(edgeNear.x + thinness * HEX_BRANCH[mod6(angle-i+2 + 3)].x),
	// 			y:(edgeNear.y + thinness * HEX_BRANCH[mod6(angle-i+2 + 3)].y) };
	// 		var innerFar = {
	// 			x:(edgeFar.x + thinness * HEX_BRANCH[mod6(angle-i+4)].x),
	// 			y:(edgeFar.y + thinness * HEX_BRANCH[mod6(angle-i+4)].y) };
	// 		beginShape();
	// 		vertex(edgeNear.x, edgeNear.y);
	// 		vertex(edgeFar.x, edgeFar.y);
	// 		vertex(innerFar.x, innerFar.y);
	// 		vertex(innerNear.x, innerNear.y);
	// 		endShape(CLOSE);
	// 	}
	// }	
}

function drawBetweenNodesRect(start, end, angle, thickness){
	var a = Math.atan2(end.y - start.y, end.x - start.x);
	var length = Math.sqrt( Math.pow(end.y-start.y,2) + Math.pow(end.x-start.x,2) );
	if(thickness == undefined){
		thickness = length * 0.33;
	}
	thick60deg = thickness * 1.154700538379252;
	line(start.x - thickness*Math.cos(a+PI*0.5),
		 start.y - thickness*Math.sin(a+PI*0.5),
		 start.x + thickness*Math.cos(a+PI*0.5),
		 start.y + thickness*Math.sin(a+PI*0.5) );
	line(end.x + thick60deg * HEX_BRANCH[angle].x - thickness*Math.cos(a+PI*0.5),
		 end.y + thick60deg * HEX_BRANCH[angle].y - thickness*Math.sin(a+PI*0.5),
		 end.x + thick60deg * HEX_BRANCH[angle].x + thickness*Math.cos(a+PI*0.5),
		 end.y + thick60deg * HEX_BRANCH[angle].y + thickness*Math.sin(a+PI*0.5) );
	line(start.x - thickness*Math.cos(a+PI*0.5),
		 start.y - thickness*Math.sin(a+PI*0.5),
		 end.x + thick60deg * HEX_BRANCH[angle].x - thickness*Math.cos(a+PI*0.5),
		 end.y + thick60deg * HEX_BRANCH[angle].y - thickness*Math.sin(a+PI*0.5) );
	line(start.x + thickness*Math.cos(a+PI*0.5),
		 start.y + thickness*Math.sin(a+PI*0.5),
		 end.x + thick60deg * HEX_BRANCH[angle].x + thickness*Math.cos(a+PI*0.5),
		 end.y + thick60deg * HEX_BRANCH[angle].y + thickness*Math.sin(a+PI*0.5) );
	// line(start.x, start.y, end.x, end.y);
	// ellipse(end.x, end.y, 6, 6);
}

///////////  LENGTH
///////////

function nodeLengthCascading(node){
	// return 100/Math.pow(node.generation+1, .97);
	return 400/(node.generation+10);
}
function nodeLengthLinear(node){
	return 33;
}
function nodeLengthFromNode(node){
	if(node.data != undefined){
		return node.data.length;
	} else{
		console.log("ERROR [nodeLengthFromNode()]: attempting to get data from node with no data");
		return 1;
	}
}
function nodeThicknessLinear(node){
	return 33*0.866*0.5;
}
function nodeThicknessCascading(node){
	// var l = 100/Math.pow(node.generation+1, .97);
	// return l*0.866*0.5;
	var l = 400/(node.generation+10);
	return l*0.866*0.5;
}
function nodeThicknessFromNode(node){
	if(node.data != undefined){
		return node.data.thickness;
	} else{
		console.log("ERROR [nodeThicknessFromNode()]: attempting to get data from node with no data");
		return 1;
	}
}

function getWidth(node){
	return 20/Math.pow(node.generation+1, .9);
}

///////////  RECURSION
///////////
// these functions do the recursive crawling
// variations: with snowflake property of adding reflections on the right arm
Snowflake.prototype.recurseSimple = function(node, position){
	var length = getLength(node);
	var thickness = getThickness(node);
	if(node.right != undefined){
		var end = {x:(position.x + length * HEX_BRANCH[mod6(node.right.rBranches)].x),
		           y:(position.y + length * HEX_BRANCH[mod6(node.right.rBranches)].y)};
		this.recurseSimple(node.right, end);
		this.drawBetweenNodes(position, end, mod6(node.right.rBranches), thickness);
	}
	if(node.left != undefined){
		var end = {x:(position.x + length * HEX_BRANCH[mod6(node.left.rBranches)].x),
		           y:(position.y + length * HEX_BRANCH[mod6(node.left.rBranches)].y)};
		this.recurseSimple(node.left, end);
		this.drawBetweenNodes(position, end, mod6(node.left.rBranches), thickness);
	}
}

Snowflake.prototype.recurseReflect = function(node, position, angle){
	var length = getLength(node);
	var thickness = getThickness(node);
	if(node.right != undefined){
		var childPos1 = {x:(position.x + length * HEX_BRANCH[mod6(angle+1)].x),
		                 y:(position.y + length * HEX_BRANCH[mod6(angle+1)].y)};
		var childPos2 = {x:(position.x + length * HEX_BRANCH[mod6(angle-1)].x),
		                 y:(position.y + length * HEX_BRANCH[mod6(angle-1)].y)};
		this.recurseReflect(node.right, childPos1, mod6(angle+1) );
		this.recurseReflect(node.right, childPos2, mod6(angle-1) );
		this.drawBetweenNodes(position, childPos1, mod6(angle+1), thickness );
		this.drawBetweenNodes(position, childPos2, mod6(angle-1), thickness );
	}
	if(node.left != undefined){
		var childPos = {x:(position.x + length * HEX_BRANCH[mod6(angle)].x),
		                y:(position.y + length * HEX_BRANCH[mod6(angle)].y)};
		this.recurseReflect(node.left, childPos, angle);
		this.drawBetweenNodes(position, childPos, mod6(angle), thickness);
	}
}

/////////////////////////////////////////////////////////////
//////////////////      ATMOSPHERE         //////////////////
/////////////////////////////////////////////////////////////

Atmosphere.prototype.drawAtmosphereGraph = function(rect){
	// rect is expecting {'x':_, 'y':_, 'width':_, 'height':_, }
	var MARGIN = 10;

	// bounding box
	stroke(0);
	// fill(240);
	// noFill();
	// beginShape();
	// vertex(rect.x-MARGIN, rect.y-MARGIN);
	// vertex(rect.x-MARGIN, rect.y+MARGIN + rect.height);
	// vertex(rect.x+MARGIN + rect.width, rect.y+MARGIN + rect.height);
	// vertex(rect.x+MARGIN + rect.width, rect.y-MARGIN);
	// endShape(CLOSE);

	// x=0 origin line
	stroke(0);
	line(rect.x-MARGIN, rect.y + .5 * rect.height, rect.x+MARGIN + rect.width, rect.y + .5 * rect.height);

	// mass, branch, thin
	for(var i = 0; i < (this.length-1); i++){
		stroke(255, 255, 255);
		line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.mass[i] * rect.height, 
		     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.mass[i+1] * rect.height);
		stroke(170, 170, 170);
		line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.thin[i] * rect.height, 
		     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.thin[i+1] * rect.height);
		stroke(255, 255, 255);
		ellipse(rect.x + (i)/(this.length-1) * rect.width, rect.y + rect.height - this.branch[i] * rect.height, 5, 5);
	}
	var i = this.length-1;
	ellipse(rect.x + (i)/(this.length-1) * rect.width, rect.y + rect.height - this.branch[i] * rect.height, 5, 5);
}
