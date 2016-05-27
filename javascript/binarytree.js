var RIGHT = 1;
var LEFT = 0;

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

function mod6(input){
	// returns 0-5.  accepts any int, negatives included
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
}

// data is expecting to contain {"length": ... , "thickness:" ... , }
var BinaryTree = function(parent, data){
// nodes contain:  value (magnitude)
				// childType (LEFT or RIGHT)
				// dead (T/F: force node into leaf)
				// generation (number child away from top)
				// rBranches (number of cumulative right branches)
				// location ({x,y} position in euclidean space)
	// fix inputs
	// if(data.length == undefined)
	// 	data.length = 0;

	this.parent = parent;
	this.right = undefined;
	this.left = undefined;
	this.childType;  // gets set in the SETTER, not enough info to set now
	this.dead; // set true, force node to be a leaf
	this.rBranches;
	this.lBranches;
	this.age;    // how many generations old this node is  (maxGenerations - this.generation)
	this.maxGeneration = 0;

	this.location;
	// each node has a persisting set of random values that can be assigned to anything
	this.randomValue = [ random(0,10), random(0,10), random(0,10), random(0,10), random(0,10), random(0,10) ]; 
	this.details = undefined;
	// this.details = {"phalanges":undefined, "thinner":data.thinness};
	this.seedMoment = 1.0 // 0.0 to 1.0 sprout point, between 100% inside the parent crystal to the very tip.
	                     // nothing should ever be 1.0, technically or it would break off 

	// manage properties related to the data structure
	if(parent){
		this.generation = parent.generation+1;
		// IMPORTANT: this jumps the growth by "parent.thickness", gives it a head start
		this.length = data.length;//new animatableValue(data.length, 0);//parent.thickness.value);
		this.thickness = data.thickness;//new animatableValue(data.thickness, 0);
		// HERE: no head start
		// this.length = new animatableValue(length, 0);
	}else{
		// this is the beginning node of the tree, set initial conditions
		this.generation = 0;
		this.direction = 0;
		this.rBranches = 0;
		this.lBranches = 0;
		this.age = 1;
	}
	this.addChildren = function(leftData, rightData){
		this.addLeftChild(leftData);
		this.addRightChild(rightData);
	}
	this.addLeftChild = function(leftData){
		this.left = new BinaryTree(this, leftData);
		this.left.childType = LEFT;
		this.left.lBranches = this.lBranches + 1;
		this.left.rBranches = this.rBranches;
	}
	this.addRightChild = function(rightData){
		this.right = new BinaryTree(this, rightData);
		this.right.childType = RIGHT;
		this.right.lBranches = this.lBranches;
		this.right.rBranches = this.rBranches + 1;
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