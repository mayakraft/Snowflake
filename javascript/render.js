// todo, replace windowWidth with a frame
function drawBinaryTree(node, position){
	// if(node.leaf)
	// 	fill(50, 255, 50);		
	// else
	// 	fill( 255 * (int(node.generation)%2) );

	ellipse(position.x, position.y, 6, 6);

	if(node.left != undefined){
		var newPosition = {'x':position.x-(windowWidth*.45)/Math.pow(2,node.left.generation), 'y':position.y + 30};
		line(position.x, position.y, newPosition.x, newPosition.y);
		drawBinaryTree(node.left, newPosition);
	}
	if(node.right != undefined){
		var newPosition = {'x':position.x+(windowWidth*.45)/Math.pow(2,node.right.generation), 'y':position.y + 30};
		line(position.x, position.y, newPosition.x, newPosition.y);
		drawBinaryTree(node.right, newPosition);
	}
}




function drawRightBranchingBinaryTree(node, position){
	var HEX_BRANCH = [ {x:1, y:0}, {x:.5,y:-0.866}, {x:-.5,y:-0.866}, {x:-1, y:0}, {x:-.5,y:0.866}, {x:.5,y:0.866} ];

	// if(node.leaf)
	// 	fill(50, 255, 50);		
	// else
	// 	fill( 255 * (int(node.generation)%2) );

	ellipse(position.x, position.y, 6, 6);

	var LENGTH = 100/Math.pow(node.generation+1, .9);

	if(node.left != undefined){
		var end = {x:(position.x + LENGTH * HEX_BRANCH[int(node.left.rBranches)%6].x),
		           y:(position.y + LENGTH * HEX_BRANCH[int(node.left.rBranches)%6].y)};
		line(position.x, position.y, end.x, end.y);
		drawRightBranchingBinaryTree(node.left, end);
	}
	if(node.right != undefined){
		var end = {x:(position.x + LENGTH * HEX_BRANCH[int(node.right.rBranches)%6].x),
		           y:(position.y + LENGTH * HEX_BRANCH[int(node.right.rBranches)%6].y)};
		line(position.x, position.y, end.x, end.y);
		drawRightBranchingBinaryTree(node.right, end);
	}
}



function drawAtmosphereGraph(rect){
	// rect is expecting {'x':_, 'y':_, 'width':_, 'height':_, }
	var MARGIN = 10;

	// bounding box
	stroke(220);
	fill(240);
	beginShape();
	vertex(rect.x-MARGIN, rect.y-MARGIN);
	vertex(rect.x-MARGIN, rect.y+MARGIN + rect.height);
	vertex(rect.x+MARGIN + rect.width, rect.y+MARGIN + rect.height);
	vertex(rect.x+MARGIN + rect.width, rect.y-MARGIN);
	endShape(CLOSE);

	// x=0 origin line
	stroke(220);
	line(rect.x-MARGIN, rect.y + .5 * rect.height, rect.x+MARGIN + rect.width, rect.y + .5 * rect.height);

	// mass, branch, thin
	for(var i = 0; i < (this.length-1); i++){
		stroke(255, 128, 128);
		line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.mass[i] * rect.height, 
		     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.mass[i+1] * rect.height);
		stroke(128, 255, 128);
		line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.thin[i] * rect.height, 
		     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.thin[i+1] * rect.height);
		stroke(128, 128, 255);
		line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.branch[i] * rect.height, 
		     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.branch[i+1] * rect.height);
	}
}



function drawSnowflakeSkeleton(position){
	var HEX_BRANCH = [ {x:1, y:0}, {x:.5,y:-0.866}, {x:-.5,y:-0.866}, {x:-1, y:0}, {x:-.5,y:0.866}, {x:.5,y:0.866} ];

	recursiveDrawLoop(this.tree, position);

	function recursiveDrawLoop(node, position){

		// if(node.leaf)
		// 	fill(50, 255, 50);		
		// else
		// 	fill( 255 * (int(node.generation)%2) );

		ellipse(position.x, position.y, 6, 6);

		var LENGTH = 100/Math.pow(node.generation+1, .9);

		if(node.left != undefined){
			var end = {x:(position.x + LENGTH * HEX_BRANCH[int(node.left.rBranches)%6].x),
			           y:(position.y + LENGTH * HEX_BRANCH[int(node.left.rBranches)%6].y)};
			line(position.x, position.y, end.x, end.y);
			recursiveDrawLoop(node.left, end);
		}
		if(node.right != undefined){
			var end = {x:(position.x + LENGTH * HEX_BRANCH[int(node.right.rBranches)%6].x),
			           y:(position.y + LENGTH * HEX_BRANCH[int(node.right.rBranches)%6].y)};
			line(position.x, position.y, end.x, end.y);
			recursiveDrawLoop(node.right, end);
		}		
	}
}




function drawStylizedSnowflake(position){
	if(DEBUG){ console.log('drawStylizedSnowflake()'); }

	var HEX_BRANCH = [ {x:1, y:0}, {x:.5,y:-0.866}, {x:-.5,y:-0.866}, {x:-1, y:0}, {x:-.5,y:0.866}, {x:.5,y:0.866} ];

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
			else            pThickness = 0;
			// thickness grows HEXAGONALLY, not scaling proportionally
			// thickness = node.length;
			if(thickness > node.thickness)			
				thickness = node.thickness;
			// START AND END
			var end = {
				x:(start.x + length * HEX_BRANCH[angle].x), 
				y:(start.y + length * HEX_BRANCH[angle].y)
			};
			var endThick = {
				x:(start.x + (length+thickness) * HEX_BRANCH[angle].x), 
				y:(start.y + (length+thickness) * HEX_BRANCH[angle].y)
			};
			var startThick = {
				x:(start.x + pThickness * HEX_BRANCH[angle].x), 
				y:(start.y + pThickness * HEX_BRANCH[angle].y)
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
	}
}
