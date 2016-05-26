class Point{
  float x;
  float y;
  Point(float ix, float iy){
    this.x = ix;
    this.y = iy;
  }
  Point(){
    this.x = 0;
    this.y = 0;
  }
};

class Properties{
  float length;
  float thickness;
  float thinness;
  Properties(float l, float t, float thn){
    this.length = l;
    this.thickness = t;
    this.thinness = thn;
  }
};

//void setup(){
//  size(640, 320);
//  background(50);
//    noStroke();
//  for(int i = 0; i < 5000; i++){
//    fill(random(255), 0, random(255), 5);
//    ellipse(random(width), random(height), 50, 50);
//  }
 //save("output.png");
 //exit();
//}

// Algorithmic Snowflake
//
//  TREE: the snowflake is a binary tree, "var tree" is the head
//  CYCLE: one growth cycle
//  FRAME: a CYCLE contain many FRAMES


// PROGRAM PARAMETERS
boolean ANIMATIONS = false;  // 0 or 1, turn animations OFF or ON

// enum sine and cosine 60deg increments for quick lookup 
// clockwise starting from 3:00
//float[] DIRECTION = {1, 0,
//  .5,  -0.86602540378444,
//  -.5, -0.86602540378444,
//  -1,  0,
//  -.5, 0.86602540378444,
//  .5,  0.86602540378444};
  
Point[] DIRECTION = {new Point(1, 0),
  new Point(.5,  -0.86602540378444),
  new Point(-.5, -0.86602540378444),
  new Point(-1,  0),
  new Point(-.5, 0.86602540378444),
  new Point(.5,  0.86602540378444) };
int RIGHT = 1;
int LEFT = 0;
// these refer to the animation cycle, the time between 2 frames of growth
float CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
int CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
int CYCLE_FRAME = 0;
int CYCLE_NUM = 0;
// canvas stuff
//var canvas;  // HTML canvas, for saving image
Point originSnowflake = new Point(400, 400);  // screen coordinates
Point originTree;       // screen coordinates

binaryTree tree;  // the snowflake data model
// GENERATOR PARAMETERS 
int DEPTH = 8;
float matter = 40;
// var pressure = [.8, .6, .3, .1, .05, .2, .6, .9];
float pressure[] = new float[9];// = [.2, .05, .1, .03, .1, .5, .05, .5, .8];
boolean density[] = new boolean[9];// = [false, true, false, false, true, true, false, true, true, true];
float moisture[] = new float[9];

int windowWidth, windowHeight;

int ITERATIONS;

////////////////////////////////
//  P5.JS
//////////////////////////////
void buildAtmosphere(){
  ITERATIONS = (int)random(6) + 6;
  pressure = new float[ITERATIONS];
  density = new boolean[ITERATIONS];
  moisture = new float[ITERATIONS];
  for(int i = 0; i < ITERATIONS; i++){
    pressure[i] = random(1);
    if(random(10) > 5)
      density[i] = true;
    else 
      density[i] = false;
    moisture[i] = random(1);
  }
  for(int i = 0; i < 3; i++){
    int index = int(random(ITERATIONS));
    pressure[index] = random(0.0, 0.1);
  }
  for(int i = 0; i < ITERATIONS; i++)
    println("ATMOSPHERE: pressure:" + pressure[i] + "  density:" + density[i] + "  moisture:" + moisture[i]);
}
void resetAnimations(){
  // these refer to the animation cycle, the time between 2 frames of growth
  CYCLE_PROGRESS = 0;  // updated mid loop (0.0 to 1.0) 1.0 means entering next step
  CYCLE_LENGTH = 30; // # of frames each growth cycle lasts
  CYCLE_FRAME = 0;
  CYCLE_NUM = 0;
}
void initTree(){
  resetAnimations();
  tree = new binaryTree(null, new Properties(0.0, matter, 0.0));
  buildAtmosphere();
}

void setup() {
  size(900,700);
  windowWidth = 900;
  windowHeight = 700;
  //canvas = createCanvas(windowWidth, windowHeight);
  resizeOrigins();
  frameRate(10);
  initTree();

  if(ANIMATIONS){
    //frameRate(
    //setInterval(function(){initTree();}, 12000);
  }
  else{
    //noLoop();
    // grow and draw a tree
    for(int i = 0; i < ITERATIONS; i++){
      growTree(tree, pressure[i], density[i], moisture[i]);
    }
    draw();
  }
  //save("output.png");
  //exit();
}
void mousePressed() {
  // DEPTH++;
  // if(!ANIMATIONS){
  //   growTree(tree);
  //   draw(tree);
  // }
  tree = null;
  initTree();
  for(int i = 0; i < ITERATIONS; i++){
    growTree(tree, pressure[i], density[i], moisture[i]);
  }
  draw();
}
void draw() {
  background(0);
  // a 30 deg line showing the crop position on the wedge
  // stroke(200);
  // line(originTree.x, originTree.y, originTree.x + 200*cos(30/180*Math.PI), originTree.y - 200*sin(30/180*Math.PI));

  // fill(40, 255);
  // beginShape();
  // var SLICE_LENGTH = 140;
  // vertex(originTree.x, originTree.y);
  // vertex(originTree.x + SLICE_LENGTH*cos(30/180*Math.PI), originTree.y - SLICE_LENGTH*sin(30/180*Math.PI));
  // vertex(originTree.x + SLICE_LENGTH/(sqrt(3)*.5), originTree.y);
  // endShape(CLOSE);

  //stroke(255);
  //noFill();
  //drawTree(tree, originTree, 0);
  noStroke();
  fill(255, 80);
  drawSnowflake(tree, originSnowflake);
  // stroke(0);
  // drawSnowflakeTree(tree, originSnowflake);


  //if(ANIMATIONS){
  //  CYCLE_PROGRESS = CYCLE_FRAME / CYCLE_LENGTH;

  //  animateGrowth(tree, CYCLE_PROGRESS);
  
  //  if(CYCLE_FRAME >= CYCLE_LENGTH && DEPTH > 0){
  //    CYCLE_NUM++;
  //    CYCLE_FRAME = 0;
  //    DEPTH--;
  //    CYCLE_PROGRESS = CYCLE_FRAME / CYCLE_LENGTH;
  //    stopAllAnimations(tree);
  //    growTree(tree);
  //  }
  //  if(CYCLE_FRAME < CYCLE_LENGTH)
  //    CYCLE_FRAME++;
  //}
}
///////////////////////////////
//  SNOWFLAKE GROWING
///////////////////////////////
// animateGrowth taps into the "valueToBeGrown" and "valueAnimated" inside of each
// node, and increments / decrements each according to CYCLE_PROGRESS, which
// goes from 0.0 to 1.0, signaling end of growth cycle

//void animateGrowth(binaryTree tree, float progress){
//  findLeaves_animatedGrowth(tree, progress);
//}
//  void findLeaves_animatedGrowth(binaryTree tree, float progress){  // progress is 0.0 to 1.0
//    // ANIMATIONS
//    tree.length.animate(progress);
//    tree.thickness.animate(progress);
//    if(tree.left){
//      findLeaves_animatedGrowth(tree.left, progress);
//    }
//    if(tree.right){
//      findLeaves_animatedGrowth(tree.right, progress);
//    }
//  }
//void stopAllAnimations(binaryTree tree){
//  findLeaves_stopAllAnim(tree);
//}
//  void findLeaves_stopAllAnim(binaryTree tree){  // progress is 0.0 to 1.0
//    // ANIMATIONS
//    tree.length.stopAnimation();
//    tree.thickness.stopAnimation();
//    if(tree.left){
//      findLeaves_stopAllAnim(tree.left);
//    }
//    if(tree.right){
//      findLeaves_stopAllAnim(tree.right);
//    }
//  }

void growTree(binaryTree node, float kPressure, boolean kDensity, float kMoisture){
  findLeaves_growTree(node, kPressure, kDensity, kMoisture);
  setGlobalTreeVariables(node);
}
  void findLeaves_growTree(binaryTree node, float kPressure, boolean kDensity, float kMoisture){
    if(node.left != null)
      findLeaves_growTree(node.left, kPressure, kDensity, kMoisture);    
    if(node.right != null)
      findLeaves_growTree(node.right, kPressure, kDensity, kMoisture);

  // GROW MORE CRYSTALS
    if(node.left == null && node.right == null && !node.dead && node.branchesR < 3){
      
      // var twoBranches = (random(10) < 8);
      boolean twoBranches = kDensity;
      //if(node.parent == null) twoBranches = false;  // force first seed to branch only left
      if(node.length == 0.0) twoBranches = false;  // force first seed to branch only left
      
      float shortenby = (float)Math.pow(0.4, node.branchesR);
      // var newLength = node.length.value * pressure[DEPTH];
      float newLength = matter * cos(PI * .5 * kPressure)  * shortenby;
      float newThickness = matter * sin(PI * .5 * kPressure) * shortenby;
      float newThinness = 0.0;
      if(kMoisture < .5)
        newThinness = random(.15) + .05;

      if(newLength < node.thickness){
        println("adjusting value");
        newLength = node.thickness + 3;
      }

      if(true){//newLength > 5){
        // if(newLength < 30)
        //   newLength = 30;

        // ADD CHILDREN
        // left
        node.addLeftChild(new Properties(newLength, newThickness, newThinness));
        float leftIntersect = checkBoundaryCrossing(node, node.left);
        if(leftIntersect != -9999)
          makeNodeDead(node.left, leftIntersect, newThickness );
        // right
        if(twoBranches){
          node.addRightChild(new Properties(newLength * .7, newThickness * .7, newThinness));
          float rightIntersect = checkBoundaryCrossing(node, node.right);
          if(rightIntersect != -9999)
            makeNodeDead(node.right, rightIntersect, newThickness );
        }
      }
    }
    // grow thicker
    if(node.age < 3){
      if(node.maxGeneration - node.generation == 0)
        node.thickness = node.thickness * (1+(1/(node.maxGeneration+2)));
        //node.thickness.set(node.thickness.value*(1+(1/(node.maxGeneration+2))) );
      else if(node.maxGeneration - node.generation == 1)
        node.thickness = node.thickness * (1+(1/(node.maxGeneration+3)));
        //node.thickness.set(node.thickness * (1+(1/(node.maxGeneration+3))) );
      else if(node.maxGeneration - node.generation == 2)
        node.thickness = node.thickness * (1+(1/(node.maxGeneration+4)));
        //node.thickness.set(node.thickness * (1+(1/(node.maxGeneration+4))) );
    }
  }
  
/////////////////////////////
//  DATA STRUCTURES
////////////////////////////////
int searchedMaxGeneration;
void setGlobalTreeVariables(binaryTree node){
  // it's unclear how useful the second step is
  // there may not be any reason to store the same variable
  //   inside every node
  searchedMaxGeneration = 0;
  findGlobals_treeVariables(node);
  setGlobals_treeVariables(node);
}
  void findGlobals_treeVariables(binaryTree node){
    if(node.generation > searchedMaxGeneration)
      searchedMaxGeneration = node.generation;
    if(node.left != null)
      findGlobals_treeVariables(node.left);
    if(node.right != null)
      findGlobals_treeVariables(node.right);
  }
  void setGlobals_treeVariables(binaryTree node){
    node.maxGeneration = searchedMaxGeneration;
    node.age = searchedMaxGeneration - node.generation + 1; 
    if(node.left != null)
      setGlobals_treeVariables(node.left);
    if(node.right != null)
      setGlobals_treeVariables(node.right);
  }

int mod6(int input){
  // throw in any value, negatives included, returns 0-5
  int i = input;
  while (i < 0) 
    i += 6;
  return i % 6;
}

void makeNodeDead(binaryTree node, float newLength, float newThickness){
  node.dead = true;
    node.thickness = newThickness;
    node.length = newLength;
    if(node.parent != null)
    node.location = new Point(node.parent.location.x + newLength * DIRECTION[node.direction].x, 
                          node.parent.location.y + newLength * DIRECTION[node.direction].y);
}

/////////////////////////////////
// GEOMETRY
/////////////////////////////////
// performs the necessary fixes to this specific problem
// and returns true if boundary was crossed and adjustments made
float checkBoundaryCrossing(binaryTree startNode, binaryTree endNode){
  // extract euclidean locations from parent and child
  Point start = startNode.location;
  Point end = endNode.location;
  // perform boundary check against 30 deg line
  Point result = RayLineIntersect(
      new Point(0.0, 0.0), 
      new Point( cos((float)(30.0/180*Math.PI)), sin((float)(30.0/180*Math.PI)) ), 
      new Point( start.x, abs(start.y) ), 
      new Point( end.x, abs(end.y) )
    );
  if(result != null){   // if yes, the boundary was crossed, result is new intersection
    // return distance from start to new intersection
    return sqrt((float)( (result.x-start.x)*(result.x-start.x) + (result.y-abs(start.y))*(result.y-abs(start.y)) ) );
  }
  return -9999;
}

Point RayLineIntersect(Point origin, Point dV, Point pA, Point pB){
  // if intersection, returns point of intersection
  // if no intersection, returns null
  Point v1 = new Point(origin.x - pA.x, origin.y - pA.y );
  Point v2 = new Point(pB.x - pA.x, pB.y - pA.y);
  Point v3 = new Point(-dV.y, dV.x);
  float t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
  float t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
  Point p = null;
  if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
    Point dAB = new Point();
    float lengthAB = sqrt( (pB.x-pA.x)*(pB.x-pA.x) + (pB.y-pA.y)*(pB.y-pA.y) );
    dAB.x = (pB.x - pA.x) / lengthAB;
    dAB.y = (pB.y - pA.y) / lengthAB;
    p = new Point(pA.x + lengthAB * t2 * dAB.x, pA.y + lengthAB * t2 * dAB.y);
  }
  return p;
}
////////////////////////////////
// DRAWING & RENDERING
////////////////////////////////
float TREE_SCALE = 0.4;
void drawTree(binaryTree node, Point start, int angleDepth){
  if(node != null){
    if(node.left != null){
      drawTree(node.left, new Point(start.x + node.length * DIRECTION[angleDepth].x * TREE_SCALE, start.y + node.length * DIRECTION[angleDepth].y * TREE_SCALE), angleDepth);
    }
    if(node.right != null){
      drawTree(node.right, new Point(start.x + node.length * DIRECTION[angleDepth].x * TREE_SCALE, start.y + node.length * DIRECTION[angleDepth].y * TREE_SCALE), mod6(angleDepth+1));
    }
    float length = node.length;
    Point end = new Point(start.x + length * DIRECTION[angleDepth].x * TREE_SCALE,
                          start.y + length * DIRECTION[angleDepth].y * TREE_SCALE);
    line(start.x, start.y, end.x, end.y);
    //ellipse(end.x, end.y, 5, 5);
  }
}

void drawSnowflake(binaryTree node, Point location){
  for(int angle = 0; angle < 6; angle+=2)
    drawHexagonTreeWithReflections(node, location, angle);
  for(int angle = 1; angle < 6; angle+=2)
    drawHexagonTreeWithReflections(node, location, angle);
  // fill(20*node.age + 150, 255);
  // drawCenterHexagon(node, location);
}
  //void drawCenterHexagon(node, start){
  //  var length = node.length.get();
  //  var thickness = node.thickness.get();
  //  beginShape();
  //  for(int angle = 0; angle < 6; angle++){
  //    var point = {
  //        x:(start.x + (length+thickness) * DIRECTION[mod6(angle)].x),
  //        y:(start.y + (length+thickness) * DIRECTION[mod6(angle)].y) };
  //    vertex(point.x, point.y);
  //  }
  //  endShape(CLOSE);
  //}
  void drawHexagonTreeWithReflections(binaryTree node, Point start, int angle){
    if(node != null){
      // LENGTH and THICKNESS
      float length = node.length;
      float thickness = node.thickness;
      float pThickness;
      if(node.parent != null) pThickness = node.parent.thickness;
      else            pThickness = 0;
      // thickness grows HEXAGONALLY, not scaling proportionally
      // thickness = node.length.get();
      if(thickness > node.thickness)      
        thickness = node.thickness;
      // START AND END
      Point end = new Point(start.x + length * DIRECTION[angle].x, 
                            start.y + length * DIRECTION[angle].y);
      Point endThick = new Point(start.x + (length+thickness) * DIRECTION[angle].x, 
                                 start.y + (length+thickness) * DIRECTION[angle].y);
      Point startThick = new Point(start.x + pThickness * DIRECTION[angle].x, 
                                   start.y + pThickness * DIRECTION[angle].y);
      int thckAng = 2;
      if(thickness > pThickness){
        startThick = start;
        thckAng = 1;
      }
      if(node.right != null){
        drawHexagonTreeWithReflections(node.right, end, mod6(angle+1) );
        drawHexagonTreeWithReflections(node.right, end, mod6(angle-1) );
      }
      //first go to the bottom of node, following the main stem
      if(node.left != null)
        drawHexagonTreeWithReflections(node.left, end, angle);
      
      Point point1a = new Point(startThick.x + thickness * DIRECTION[mod6(angle-thckAng)].x,
                                startThick.y + thickness * DIRECTION[mod6(angle-thckAng)].y);
      Point point1b = new Point(startThick.x + thickness * DIRECTION[mod6(angle+thckAng)].x,
                                startThick.y + thickness * DIRECTION[mod6(angle+thckAng)].y);
      Point point2a = new Point(end.x - thickness * DIRECTION[mod6(angle+2)].x,
                                end.y - thickness * DIRECTION[mod6(angle+2)].y);
      Point point2b = new Point(end.x - thickness * DIRECTION[mod6(angle-2)].x,
                                end.y - thickness * DIRECTION[mod6(angle-2)].y);

      // fill(255, 128 * sqrt(1.0/node.generation));
      fill(12*node.age + 120 + (node.randomValue[angle%6]-5)*2, 250);
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
      if(node.thinness != 0.0){
        float thinness = (node.thinness) * thickness;

        Point[] edges = {point1b, point2b, endThick, point2a, point1a};

        for(int i = 0; i < 4; i++){
          // make color universally directionally dependent
          float fillVal = sin(mod6(int(angle-(i - 1.5))));
          
          fill(12*(node.age + (fillVal*3.5)) + 120 + (node.randomValue[angle%6]-5)*2, 250);
          Point edgeNear = new Point(edges[i].x + thinness * DIRECTION[mod6(angle-i)].x,
                                     edges[i].y + thinness * DIRECTION[mod6(angle-i)].y);
          Point edgeFar = new Point(edges[i+1].x + thinness * DIRECTION[mod6(angle-i + 3)].x,
                                    edges[i+1].y + thinness * DIRECTION[mod6(angle-i + 3)].y);
          Point innerNear = new Point(edgeNear.x + thinness * DIRECTION[mod6(angle-i+2 + 3)].x,
                                      edgeNear.y + thinness * DIRECTION[mod6(angle-i+2 + 3)].y);
          Point innerFar = new Point(edgeFar.x + thinness * DIRECTION[mod6(angle-i+4)].x,
                                     edgeFar.y + thinness * DIRECTION[mod6(angle-i+4)].y);
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
  
//void drawSnowflakeTree(binaryTree node, Point location){
//  for(int i = 0; i < 6; i++)
//    drawTreeWithReflections(node, location, i);
//  function drawTreeWithReflections(node, location, angle){
//    if(node != null){
//      var length = node.length.get();
//      var start = location;
//      var end = {
//        x:(location.x + length * DIRECTION[angle].x), 
//        y:(location.y + length * DIRECTION[angle].y)
//      };
//      // stroke(0 + (200/node.maxGeneration)*node.generation);
//      line(start.x, start.y, end.x, end.y);
//      if(node.left != null)
//        drawTreeWithReflections(node.left, end, angle);
//      if(node.right != null){
//        drawTreeWithReflections(node.right, end, mod6(angle+1) );
//        drawTreeWithReflections(node.right, end, mod6(angle-1) );
//      }
//      ellipse(end.x, end.y, 5, 5);
//    }
//  }
//}

void resizeOrigins(){
  //if(windowWidth > windowHeight){
    originSnowflake = new Point(windowWidth*.5, windowHeight*.5);
    originTree = new Point(windowWidth*.8, windowHeight*.97);
  //}
  //else{
  //  originSnowflake = new Point(windowWidth*.5, windowHeight*.4);
  //  originTree = new Point(windowWidth*.3, windowHeight*.933);
  //}
}

//void windowResized() {
//  resizeCanvas(windowWidth, windowHeight);
//  resizeOrigins();
//}

void logTree(binaryTree node){
 if(node != null){
   boolean hasChildren = false;
   if(node.left != null || node.right != null)
     hasChildren = true;
   String thisChildType;
   if(node.childType == LEFT) thisChildType = "left";
   if(node.childType == RIGHT) thisChildType = "right";
   println("Node (" + 
     node.generation + "/" + 
     node.maxGeneration + ") LENGTH:(" + 
     node.length + ") PARENT:(" + 
     hasChildren + ") TYPE:(" + 
     node.childType + ") RIGHT BRANCHES:(" + 
     node.branchesR + ") (" + 
     node.location.x + "," +
     node.location.y + ")");
   logTree(node.left);
   logTree(node.right);
 }
}