var HEX_BRANCH = [ {x:1, y:0}, {x:0.5,y:-0.866025403784439}, {x:-0.5,y:-0.866025403784439}, {x:-1, y:0}, {x:-0.5,y:0.866025403784439}, {x:0.5,y:0.866025403784439} ];


/////////////////////////////////////////////////////////////
/////////////////      BINARY TREE         //////////////////
/////////////////////////////////////////////////////////////

// todo, replace windowWidth with a frame

TreeNode.prototype.drawTree = function(position){
	console.log("calling draw tree");

	drawAndIterate(this, position);

	function drawAndIterate(node, position){
		var r = 10;
		// leaf nodes are white with black border
		if(node.leaf){
			fill(255);
		} else{
			fill(0);		
		}
		// child nodes are arrows pointing LEFT or RIGHT, parent is a circle
		if(node.childType == undefined){
			ellipse(position.x, position.y, r, r);
		} else{
			var a = 0;
			if(node.childType == LEFT)  a = PI;
			triangle(position.x+r*0.5*Math.cos(a), position.y+r*0.5*Math.sin(a), 
			         position.x+r*0.5*Math.cos(a+PI*2/3), position.y+r*0.5*Math.sin(a+PI*2/3), 
			         position.x+r*0.5*Math.cos(a+PI*4/3), position.y+r*0.5*Math.sin(a+PI*4/3));
		}
		// recursion:
		if(node.left != undefined){
			var newPosition = {'x':position.x-(windowWidth*.45)/Math.pow(2,node.left.generation), 'y':position.y + 30};
			line(position.x, position.y, newPosition.x, newPosition.y);
			drawAndIterate(node.left, newPosition);
		}
		if(node.right != undefined){
			var newPosition = {'x':position.x+(windowWidth*.45)/Math.pow(2,node.right.generation), 'y':position.y + 30};
			line(position.x, position.y, newPosition.x, newPosition.y);
			drawAndIterate(node.right, newPosition);
		}
	}
}

function drawRightBranchingBinaryTree(node, position){
	var SHOW_TRIANGLES = false;

	var r = 10;
	// leaf nodes are white with black border
	var color = 0;
	if(node.leaf) color = 255;
	fill(color);

	// child nodes are arrows pointing LEFT or RIGHT, parent is a circle
	if(node.childType == undefined){
		ellipse(position.x, position.y, r, r);
	} else{
		if(SHOW_TRIANGLES){
			var a = 0;
			if(node.childType == LEFT)  a = PI;
			triangle(position.x+r*0.5*Math.cos(a), position.y+r*0.5*Math.sin(a), 
			         position.x+r*0.5*Math.cos(a+PI*2/3), position.y+r*0.5*Math.sin(a+PI*2/3), 
			         position.x+r*0.5*Math.cos(a+PI*4/3), position.y+r*0.5*Math.sin(a+PI*4/3));
		} else{
			ellipse(position.x, position.y, r, r);
		}
	}

	// logarithmically shrinking edge lengths
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

