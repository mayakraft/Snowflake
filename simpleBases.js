// required dependency: snowflakeMath.js

var canvas = document.getElementById("simpleBases");
var context = canvas.getContext("2d");
var hexCanvas = document.getElementById("hexagonResult");
var hexContext = hexCanvas.getContext("2d");

var scale = 300; // radius of segment's long side
var hexScale = scale * .5;

// ORIGIN in real pixel space
var o = new Point();
o.x = 100;
o.y = 250;
var hexCenter = new Point();
hexCenter.x = hexCanvas.width * .5;
hexCenter.y = hexCanvas.width * .5;

// TRIANGLE POINTS in computational space (radius = 1):
// p1 origin
// p2 arm edge
// p3 top (hexagon side mid-point)
var p1 = new Point();
var p2 = new Point();
var p3 = new Point();

p1.x = 0;
p1.y = 0;
p2.x = p1.x+1
p2.y = p1.y;
p3.x = p1.x+1*.75;
p3.y = p1.y-1*.5*sin60;

// triangle sides:
// b bottom (large radius)
// s outside side
// i inside, (small radius)
var dB = new Point();  // begin from origin
var dS = new Point();  // from small radius to large
var dI = new Point();  // begin from origin
var bLength = Math.sqrt( (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y) );
var sLength = Math.sqrt( (p2.x-p3.x)*(p2.x-p3.x) + (p2.y-p3.y)*(p2.y-p3.y) );
var iLength = Math.sqrt( (p3.x-p1.x)*(p3.x-p1.x) + (p3.y-p1.y)*(p3.y-p1.y) );
dB.x = (p2.x - p1.x) / bLength;
dB.y = (p2.y - p1.y) / bLength;
dS.x = (p3.x - p2.x) / sLength;
dS.y = (p3.y - p2.y) / sLength;
dI.x = (p3.x - p1.x) / iLength;
dI.y = (p3.y - p1.y) / iLength;

// RAYS from the mouse
var dRayR = {x:1, y:0};
var dRayL = {x:-.5, y:-sin60};

function drawSegmentAndHexagon(mouse){
	canvas.width = canvas.width;
	context.lineWidth = 4;
	context.lineCap = "round";

	// build slice from mouse input
	var points = outsideEdgeFromSimpleBaseCut({x:(mouse.x/scale), y:(mouse.y/scale)});

	// light gray fill, visible segment piece
	// context.fillStyle = "#E0E0E0";
	// context.beginPath();
	// context.moveTo(o.x + p1.x*scale, o.y + p1.y*scale);
	// for(var i = 0; i < points.length; i++) context.lineTo(o.x + points[i].x*scale, o.y + points[i].y*scale);
	// context.lineTo(o.x + p1.x*scale, o.y + p1.y*scale);
	// context.fill();

	// 2 mouse ray lines
	context.strokeStyle = "#E0E0E0";
	context.beginPath();
	context.moveTo(o.x + mouse.x, o.y + mouse.y);
	context.lineTo(o.x + mouse.x+scale*2*dRayR.x, o.y + mouse.y+scale*2*dRayR.y);
	context.moveTo(o.x + mouse.x, o.y + mouse.y);
	context.lineTo(o.x + mouse.x+scale*2*dRayL.x, o.y + mouse.y+scale*2*dRayL.y);
	context.stroke();

	// 1/12 full segment- light gray outline
	// context.strokeStyle = "#E0E0E0";
	// context.beginPath();
	// context.moveTo(o.x + p1.x*scale, o.y + p1.y*scale);
	// context.lineTo(o.x + p2.x*scale, o.y + p2.y*scale);
	// context.lineTo(o.x + p3.x*scale, o.y + p3.y*scale);
	// context.lineTo(o.x + p1.x*scale, o.y + p1.y*scale);
	// context.stroke();

	// 1/12 visible segment- black outline
	context.strokeStyle = "#000000";
	context.beginPath();
	context.moveTo(o.x + p1.x*scale, o.y + p1.y*scale);
	for(var i = 0; i < points.length; i++){
		context.lineTo(o.x + points[i].x*scale, o.y + points[i].y*scale);
	}
	context.lineTo(o.x + p1.x*scale, o.y + p1.y*scale);
	context.stroke();


	// HEXAGON SNOWFLAKE RESULT
  	hexCanvas.width = hexCanvas.width;
	hexContext.lineWidth = 4;
	hexContext.lineCap = "round";

	var hexPoints = hexagonFromTwelfthHexagon(points);
	hexContext.moveTo(hexCenter.x + hexPoints[0].x*hexScale, hexCenter.y + hexPoints[0].y*hexScale);
	for(var i = 1; i < hexPoints.length; i++){
		hexContext.lineTo(hexCenter.x + hexPoints[i].x*hexScale, hexCenter.y + hexPoints[i].y*hexScale);
	}
	hexContext.stroke();
}

// makes a snowflake pattern by two or one cuts, based on position of one point
function outsideEdgeFromSimpleBaseCut(point){
	var i1 = RayLineIntersectQuick(point, dRayR, p2, p3, sLength, dS); // check intersect with outside
	var i2 = RayLineIntersectQuick(point, dRayR, p1, p3, iLength, dI); // check horizontal intersect with top
	var i3 = RayLineIntersectQuick(point, dRayL, p1, p3, iLength, dI); // check 60 deg intersect with top
	var i4 = RayLineIntersectQuick(point, dRayL, p1, p2, bLength, dB); // check 60 deg intersect with bottom

	var points = [];
	if(i4.x != undefined){ // cuts through the bottom: small hexagon
		points.push(i3);
		points.push(i4);
	}
	else if(i3.x != undefined){ // 60deg cut into top, there are 2 cuts
		points.push(i3);
		points.push(point);
		points.push(i1);
		points.push(p2);
	}
	else if(i2.x != undefined){ // horizontal cut across top
		points.push(i2);
		points.push(i1);
		points.push(p2);
	}
	else{ 						// no cuts
		points.push(p3);
		points.push(p2);
	}
	return points;
}

$("#simpleBases").mousemove(function(event){
	var mouse = new Point();  // in the computational space.  origin is the origin of the triangle
    // get the scale based on actual width;
	var sx = canvas.width / canvas.offsetWidth;
    var sy = canvas.height / canvas.offsetHeight;
	mouse.x = event.offsetX * sx - o.x;
	mouse.y = event.offsetY * sy - o.y;
	drawSegmentAndHexagon(mouse);
});

// run once upon load to draw once.
drawSegmentAndHexagon({x:(5000), y:(-5000)});
