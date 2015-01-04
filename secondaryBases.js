// required dependency: snowflakeMath.js

var canvas2 = document.getElementById("secondaryBases");
var context2 = canvas2.getContext("2d");
var hexCanvas2 = document.getElementById("secondaryHexagonResult");
var hexContext2 = hexCanvas2.getContext("2d");

var scale2 = 300; // radius of segment's long side
var hexScale2 = scale * .5;

// ORIGIN in real pixel space
var o = new Point();
o.x = 100;
o.y = 250;
var hexCenter2 = new Point();
hexCenter2.x = hexCanvas2.width * .5;
hexCenter2.y = hexCanvas2.width * .5;

// TRIANGLE POINTS in computational space (radius = 1):
// s1 origin
// s2 arm edge
// s3 top (hexagon side mid-point)
// s4 inner (inner most point of cut toward hexagon center)
var s1 = new Point();
var s2 = new Point();
var s3 = new Point();
var s4 = new Point();

s1.x = 0;
s1.y = 0;
s2.x = s1.x+1
s2.y = s1.y;
s3.x = 0.8726089487010745
s3.y = -0.22064777327935228
s4.x = 0.3821731538967765
s4.y = -0.22064777327935228

// triangle sides:
// b bottom (large radius)
// s outside side
// t top, (top horizontal)
// i inside (diagonal from top to center)
var dB2 = new Point();  // begin from origin
var dS2 = new Point();  // from small radius to large
var dT2 = new Point();  // begin from origin
var dI2 = new Point();  // begin from origin
var bLength2 = Math.sqrt( (s2.x-s1.x)*(s2.x-s1.x) + (s2.y-s1.y)*(s2.y-s1.y) );
var sLength2 = Math.sqrt( (s2.x-s3.x)*(s2.x-s3.x) + (s2.y-s3.y)*(s2.y-s3.y) );
var tLength2 = Math.sqrt( (s3.x-s1.x)*(s3.x-s1.x) + (s3.y-s1.y)*(s3.y-s1.y) );
var iLength2 = Math.sqrt( (s3.x-s1.x)*(s3.x-s1.x) + (s3.y-s1.y)*(s3.y-s1.y) );
dB2.x = (s2.x - s1.x) / bLength2;
dB2.y = (s2.y - s1.y) / bLength2;
dS2.x = (s3.x - s2.x) / sLength2;
dS2.y = (s3.y - s2.y) / sLength2;
dT2.x = (s3.x - s1.x) / tLength2;
dT2.y = (s3.y - s1.y) / tLength2;
dI2.x = (s4.x - s1.x) / iLength2;
dI2.y = (s4.y - s1.y) / iLength2;

// RAYS from the mouse
var dRayR2 = {x:.5, y:-sin60};
var dRayL2 = {x:-.5, y:-sin60};

function drawSegmentAndHexagon2(mouse){
	canvas2.width = canvas2.width;
	context2.lineWidth = 4;
	context2.lineCap = "round";


	var inside1 = pointInTriangle({x:(mouse.x/scale2), y:(mouse.y/scale2)}, s1, s2, s3);
	var inside2 = pointInTriangle({x:(mouse.x/scale2), y:(mouse.y/scale2)}, s1, s3, s4);

	// build slice from mouse input
	// var points = secondaryBaseCut({x:(mouse.x/scale2), y:(mouse.y/scale2)});
	var points = [s1, s2, s3, s4];

	// light gray fill, visible segment piece
	context2.fillStyle = "#E0E0E0";
	context2.beginPath();
	context2.moveTo(o.x + s1.x*scale, o.y + s1.y*scale);
	for(var i = 0; i < points.length; i++) context.lineTo(o.x + points[i].x*scale, o.y + points[i].y*scale);
	context2.lineTo(o.x + s1.x*scale, o.y + s1.y*scale);
	context2.fill();

	// 2 mouse ray lines
	if(inside1)
		context2.strokeStyle = "#FF0000";
	else if(inside2)
		context2.strokeStyle = "#0000FF";
	else
		context2.strokeStyle = "#E0E0E0";
	context2.beginPath();
	context2.moveTo(o.x + mouse.x, o.y + mouse.y);
	context2.lineTo(o.x + mouse.x+scale2*2*dRayR2.x, o.y + mouse.y+scale2*2*dRayR2.y);
	context2.moveTo(o.x + mouse.x, o.y + mouse.y);
	context2.lineTo(o.x + mouse.x+scale2*2*dRayL2.x, o.y + mouse.y+scale2*2*dRayL2.y);
	context2.stroke();

	// 1/12 full segment- light gray outline
	// context.strokeStyle = "#E0E0E0";
	// context.beginPath();
	// context.moveTo(o.x + s1.x*scale, o.y + s1.y*scale);
	// context.lineTo(o.x + s2.x*scale, o.y + s2.y*scale);
	// context.lineTo(o.x + s3.x*scale, o.y + s3.y*scale);
	// context.lineTo(o.x + s1.x*scale, o.y + s1.y*scale);
	// context.stroke();

	// 1/12 visible segment- black outline
	context2.strokeStyle = "#000000";
	context2.beginPath();
	context2.moveTo(o.x + s1.x*scale2, o.y + s1.y*scale2);
	for(var i = 0; i < points.length; i++){
		context2.lineTo(o.x + points[i].x*scale2, o.y + points[i].y*scale2);
	}
	context2.lineTo(o.x + s1.x*scale2, o.y + s1.y*scale2);
	context2.stroke();


	// HEXAGON SNOWFLAKE RESULT
  	hexCanvas2.width = hexCanvas2.width;
	hexContext2.lineWidth = 4;
	hexContext2.lineCap = "round";

	var hexPoints = hexagonFromTwelfthHexagon(points);
	hexContext2.moveTo(hexCenter2.x + hexPoints[0].x*hexScale2, hexCenter2.y + hexPoints[0].y*hexScale2);
	for(var i = 1; i < hexPoints.length; i++){
		hexContext2.lineTo(hexCenter2.x + hexPoints[i].x*hexScale2, hexCenter2.y + hexPoints[i].y*hexScale2);
	}
	hexContext2.stroke();
}

// makes a snowflake pattern by two or one cuts, based on position of one point
function secondaryBaseCut(point){
	var i1 = RayLineIntersectQuick(point, d1, s4, s1, sLength2, dS2); // check intersect with outside
	var i2 = RayLineIntersectQuick(point, d1, s1, s3, tLength2, dT2); // check horizontal intersect with top
	var i3 = RayLineIntersectQuick(point, d2, s1, s3, tLength2, dT2); // check 60 deg intersect with top
	var i4 = RayLineIntersectQuick(point, d2, s1, s2, bLength2, dB2); // check 60 deg intersect with bottom

	var points = [];
	if(i4.x != undefined){ // cuts through the bottom: small hexagon
		points.push(i3);
		points.push(i4);
	}
	else if(i3.x != undefined){ // 60deg cut into top, there are 2 cuts
		points.push(i3);
		points.push(point);
		points.push(i1);
		points.push(s2);
	}
	else if(i2.x != undefined){ // horizontal cut across top
		points.push(i2);
		points.push(i1);
		points.push(s2);
	}
	else{ 						// no cuts
		points.push(s3);
		points.push(s2);
	}
	return points;
}

$("#secondaryBases").mousemove(function(event){
	var mouse = new Point();  // in the computational space.  origin is the origin of the triangle
    // get the scale based on actual width;
	var sx = canvas.width / canvas2.offsetWidth;
    var sy = canvas.height / canvas2.offsetHeight;
	mouse.x = event.offsetX * sx - o.x;
	mouse.y = event.offsetY * sy - o.y;
	drawSegmentAndHexagon2(mouse);
});

drawSegmentAndHexagon2({x:(5000), y:(-5000)});
