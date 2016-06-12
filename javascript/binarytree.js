
var LEFT = 0;
var RIGHT = 1;

var BinaryTree = function(parent, data){

	this.parent = parent;
	this.right = undefined;
	this.left = undefined;
	this.generation;  // (INT) number child away from top
	this.leaf = true;

	// these get set in the SETTER, not enough info to set now
	this.childType;  // (LEFT or RIGHT)
	this.rBranches;  // (INT) number of cumulative right branches before
	this.lBranches;  // (INT) number of cumulative left branches before

	// it's a stretch to include these... these can only be set by traversing the entire tree
	this.age = undefined;    // how many generations old this node is  (maxGenerations - this.generation)
	this.maxGeneration = undefined;

	// optional
	this.data = data;  // (whatever this tree is meant to represent, store properties here)

	// INITIALIZE
	if(parent){
		this.generation = parent.generation+1;
	}else{
		// this is the beginning node of the tree, set initial conditions
		this.generation = 0;
		this.rBranches = 0;
		this.lBranches = 0;
		this.age = 1;
	}
	// SETTERS  (it's important to use these instead of manually adding child nodes)
	this.addChildren = function(leftData, rightData){
		var l = this.addLeftChild(leftData);
		var r = this.addRightChild(rightData);
		return {'left':l, 'right':r};
	}
	this.addLeftChild = function(leftData){
		this.leaf = false;
		this.left = new BinaryTree(this, leftData);
		this.left.generation = this.generation + 1;
		this.left.childType = LEFT;
		this.left.lBranches = this.lBranches + 1;
		this.left.rBranches = this.rBranches;
		return this.left;
	}
	this.addRightChild = function(rightData){
		this.leaf = false;
		this.right = new BinaryTree(this, rightData);
		this.right.generation = this.generation + 1;
		this.right.childType = RIGHT;
		this.right.lBranches = this.lBranches;
		this.right.rBranches = this.rBranches + 1;
		return this.right;
	}
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
			node.length + ") PARENT:(" + 
			hasChildren + ") TYPE:(" + 
			node.childType + ") RIGHT BRANCHES:(" + 
			node.rBranches + ") (" + 
			// node.location.x + "," +
			// node.location.y + 
			")");
		logTree(node.left);
		logTree(node.right);
	}
}


function setGlobalTreeVariables(tree){
	// it's unclear how useful the second step is
	// there may not be any reason to store the same variable
	//   inside every node
	var searchedMaxGeneration = 0;
	findGlobals(tree);
	setGlobals(tree);

	function findGlobals(node){
		if(node.generation > searchedMaxGeneration)
			searchedMaxGeneration = node.generation;
		if(node.left)
			findGlobals(node.left);
		if(node.right)
			findGlobals(node.right);
	}
	function setGlobals(node){
		node.maxGeneration = searchedMaxGeneration;
		node.age = searchedMaxGeneration - node.generation + 1;
		if(node.left)
			setGlobals(node.left);
		if(node.right)
			setGlobals(node.right);
	}
}


function drawBinaryTree(tree, position){
	// if(tree.leaf)
	// 	fill(50, 255, 50);		
	// else
	// 	fill( 255 * (int(tree.generation)%2) );
	
	ellipse(position.x, position.y, 6, 6);

	if(tree.left != undefined){
		var newPosition = {'x':position.x-(windowWidth*.45)/Math.pow(2,tree.left.generation), 'y':position.y + 30};
		line(position.x, position.y, newPosition.x, newPosition.y);
		drawBinaryTree(tree.left, newPosition);
	}
	if(tree.right != undefined){
		var newPosition = {'x':position.x+(windowWidth*.45)/Math.pow(2,tree.right.generation), 'y':position.y + 30};
		line(position.x, position.y, newPosition.x, newPosition.y);
		drawBinaryTree(tree.right, newPosition);
	}
}

function drawRightBranchingBinaryTree(tree, position){
	var HEX_BRANCH = [ {x:1, y:0}, {x:.5,y:-0.866}, {x:-.5,y:-0.866}, {x:-1, y:0}, {x:-.5,y:0.866}, {x:.5,y:0.866} ];

	// if(tree.leaf)
	// 	fill(50, 255, 50);		
	// else
	// 	fill( 255 * (int(tree.generation)%2) );

	ellipse(position.x, position.y, 6, 6);

	var LENGTH = 100/Math.pow(tree.generation+1, .9);

	if(tree.left != undefined){
		var end = {x:(position.x + LENGTH * HEX_BRANCH[int(tree.left.rBranches)%6].x),
		           y:(position.y + LENGTH * HEX_BRANCH[int(tree.left.rBranches)%6].y)};
		line(position.x, position.y, end.x, end.y);
		drawRightBranchingBinaryTree(tree.left, end);
	}
	if(tree.right != undefined){
		var end = {x:(position.x + LENGTH * HEX_BRANCH[int(tree.right.rBranches)%6].x),
		           y:(position.y + LENGTH * HEX_BRANCH[int(tree.right.rBranches)%6].y)};
		line(position.x, position.y, end.x, end.y);
		drawRightBranchingBinaryTree(tree.right, end);
	}
}

