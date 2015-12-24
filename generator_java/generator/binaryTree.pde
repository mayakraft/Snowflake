class binaryTree{

    binaryTree parent;
    binaryTree right;
    binaryTree left;
    int childType;
    Point location;
    boolean dead; // set true, force node to be a leaf
    int branchesR;
    int age;    // how many generations old this node is  (maxGenerations - this.generation)
    int maxGeneration = 0;
    // each node has a persisting set of random values that can be assigned to anything
    float[] randomValue = { random(0,10), random(0,10), random(0,10), random(0,10), random(0,10), random(0,10) };    
    int generation;
    float length; //new animatableValue(data.length, 0);//parent.thickness.value);
    float thickness;//new animatableValue(data.thickness, 0);

    int direction;

        
        
  binaryTree(binaryTree parent, Properties data){
// nodes contain:  value (magnitude)
        // childType (LEFT or RIGHT)
        // dead (T/F: force node into leaf)
        // generation (number child away from top)
        // branchesR (number of cumulative right branches)
        // location ({x,y} position in euclidean space)
    // fix inputs
    //if(data.length == undefined)
    //  data.length = 0;

    //this.randomValue = { random(0,10), random(0,10), random(0,10), random(0,10), random(0,10), random(0,10) };    

    float length = data.length; //new animatableValue(data.length, 0);//parent.thickness.value);
    float thickness = data.thickness;//new animatableValue(data.thickness, 0);

    // manage properties related to the data structure
    if(parent != null){
      this.generation = parent.generation+1;
      // IMPORTANT: this jumps the growth by "parent.thickness", gives it a head start
      this.length = data.length;//new animatableValue(data.length, 0);//parent.thickness.value);
      this.thickness = data.thickness;//new animatableValue(data.thickness, 0);
      this.generation = parent.generation+1;
      // HERE: no head start
      // this.length = new animatableValue(length, 0);
    }else{
      // this is the beginning node of the tree, set initial conditions
      this.generation = 0;
      this.direction = 0;
      this.branchesR = 0;
      this.age = 1;
      this.length = data.length;//new animatableValue(data.length, 0);
      this.thickness = data.thickness;//new animatableValue(data.thickness, 0);
      this.location = new Point(0.0 + this.length * DIRECTION[this.direction].x, 
                            0.0 + this.length * DIRECTION[this.direction].y);
    }
  }
  
  void addChildren(Properties leftData, Properties rightData){
    this.addLeftChild(leftData);
    this.addRightChild(rightData);
  }
  void addLeftChild(Properties leftData){
    this.left = new binaryTree(this, leftData);
    this.left.childType = LEFT;
    this.left.direction = this.direction;
    this.left.branchesR = this.branchesR;
    this.left.location = new Point(this.location.x + this.left.length * DIRECTION[this.left.direction].x, 
                               this.location.y + this.left.length * DIRECTION[this.left.direction].y);
  }
  void addRightChild(Properties rightData){
    this.right = new binaryTree(this, rightData);
    this.right.childType = RIGHT;
    this.right.direction = mod6(this.direction+1);
    this.right.branchesR = this.branchesR + 1;
    this.right.location = new Point(this.location.x + this.right.length * DIRECTION[this.right.direction].x, 
                                this.location.y + this.right.length * DIRECTION[this.right.direction].y);
  }
}