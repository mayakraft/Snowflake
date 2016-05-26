function drawSnowflakeOutline(tree, location){
	drawCenterHexagon(tree, location);
	// for(var angle = 0; angle < 6; angle++)
	// 	drawHexagonTreeWithReflections(tree, location, angle);
	var length = tree.length.get();
	for(var angle = 0; angle < 6; angle++){
		var end = {
			x:(location.x + length * DIRECTION[mod6(angle)].x),
			y:(location.y + length * DIRECTION[mod6(angle)].y) };
		if(tree.left != undefined ){
			drawHexagonTreeWithReflections(tree.left, end, angle);
		}
		if(tree.right != undefined){
			drawHexagonTreeWithReflections(tree.right, end, mod6(angle+1));
			drawHexagonTreeWithReflections(tree.right, end, mod6(angle-1));
		}
	}
	function drawCenterHexagon(tree, start){
		var length = tree.length.get();
		var thickness = tree.thickness.get();
		for(var angle = 0; angle < 6; angle++){
			var point1 = {
					x:(start.x + (length+thickness) * DIRECTION[mod6(angle)].x),
					y:(start.y + (length+thickness) * DIRECTION[mod6(angle)].y) };
			var point2 = {
					x:(start.x + (length+thickness) * DIRECTION[mod6(angle+1)].x),
					y:(start.y + (length+thickness) * DIRECTION[mod6(angle+1)].y) };
			line(point1.x, point1.y, point2.x, point2.y);
		}
	}
	function drawHexagonTreeWithReflections(tree, start, angle){
		if(tree != undefined){
			// LENGTH and THICKNESS
			var length = tree.length.get();
			var thickness = tree.thickness.get();
			var pThickness;
			if(tree.parent) pThickness = tree.parent.thickness.get();
			else 			pThickness = 0;
			// thickness grows HEXAGONALLY, not scaling proportionally
			thickness = tree.thickness.get();
			if(thickness > tree.thickness.value)			
				thickness = tree.thickness.value;
			// START AND END
			var end = {
				x:(start.x + length * DIRECTION[angle].x), 
				y:(start.y + length * DIRECTION[angle].y)
			};
			var endThick = {
				x:(start.x + (length+thickness) * DIRECTION[angle].x), 
				y:(start.y + (length+thickness) * DIRECTION[angle].y)
			};
			var startThick = {
				x:(start.x + pThickness * DIRECTION[angle].x), 
				y:(start.y + pThickness * DIRECTION[angle].y)
			};
			var thckAng = 2;
			if(thickness > pThickness){
				startThick = start;
				thckAng = 1;
			}
			//first go to the bottom of tree, following the main stem
			if(tree.left != undefined)
				drawHexagonTreeWithReflections(tree.left, end, angle);
			
			var point1a = {
				x:(startThick.x + thickness * DIRECTION[mod6(angle-thckAng)].x),
				y:(startThick.y + thickness * DIRECTION[mod6(angle-thckAng)].y) };
			var point1b = {
				x:(startThick.x + thickness * DIRECTION[mod6(angle+thckAng)].x),
				y:(startThick.y + thickness * DIRECTION[mod6(angle+thckAng)].y) };
			var point2a = {
				x:(end.x - thickness * DIRECTION[mod6(angle+2)].x),
				y:(end.y - thickness * DIRECTION[mod6(angle+2)].y) };
			var point2b = {
				x:(end.x - thickness * DIRECTION[mod6(angle-2)].x),
				y:(end.y - thickness * DIRECTION[mod6(angle-2)].y) };

			// stroke(255,0,0);
			// line(start.x, start.y, end.x, end.y);       // the major artery

			stroke(0);

			line(startThick.x, startThick.y, point1a.x, point1a.y);
			line(startThick.x, startThick.y, point1b.x, point1b.y);
			// connect outer border points
			line(point1a.x, point1a.y, point2a.x, point2a.y);
			line(point1b.x, point1b.y, point2b.x, point2b.y);
			// join outer border ot the end point
			line(point2a.x, point2a.y, endThick.x, endThick.y);
			line(point2b.x, point2b.y, endThick.x, endThick.y);

			if(tree.right != undefined){
				drawHexagonTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawHexagonTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
		}
	}
}
		// beginShape(TRIANGLE_STRIP);
		// vertex(start.x, start.y);
		// vertex(point1a.x, point1a.y);
		// vertex(point1b.x, point1b.y);
		// vertex(point2a.x, point2a.y);
		// vertex(point2b.x, point2b.y);
		// vertex(endVec2.x, endVec2.y);
		// endShape();

		// fill(255, 80);
		// noStroke();
		// beginShape();
		// vertex(start.x, start.y);
		// vertex(point1a.x, point1a.y);
		// vertex(point1b.x, point1b.y);
		// vertex(point2a.x, point2a.y);
		// vertex(point2b.x, point2b.y);
		// vertex(endVec2.x, endVec2.y);
		// endShape(CLOSE);

function drawSnowflakeTree(tree, location){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, location, i);
	function drawTreeWithReflections(tree, location, angle){
		if(tree != undefined){
			var length = tree.length.get();
			var start = location;
			var end = {
				x:(location.x + length * DIRECTION[angle].x), 
				y:(location.y + length * DIRECTION[angle].y)
			};
			// stroke(0 + (200/tree.maxGeneration)*tree.generation);
			line(start.x, start.y, end.x, end.y);
			// ellipse(end.x, end.y, 5, 5);
			if(tree.left != undefined)
				drawTreeWithReflections(tree.left, end, angle);
			if(tree.right != undefined){
				drawTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
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

function logTree(node){
	if(node != undefined){
		var hasChildren = false;
		if(node.left != undefined || node.right != undefined)
			hasChildren = true;
		var thisChildType;
		if(node.childType == LEFT) thisChildType = "left";
		if(node.childType == RIGHT) thisChildType = "right";
		console.log("Node (" + 
			node.generation + "/" + 
			node.maxGeneration + ") LENGTH:(" + 
			node.length.value + ") PARENT:(" + 
			hasChildren + ") TYPE:(" + 
			node.childType + ") RIGHT BRANCHES:(" + 
			node.branchesR + ") (" + 
			node.location.x + "," +
			node.location.y + ")");
		logTree(node.left);
		logTree(node.right);
	}
}