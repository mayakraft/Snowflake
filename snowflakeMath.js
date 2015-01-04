// DEFS
var sin60 = 0.866025403784439;
var twoPi = 6.28318530717959;
function Point(){
	var x;
	var y;
}

// POINT inside TRIANGLE test
// http://stackoverflow.com/questions/13300904/determine-whether-point-lies-inside-triangle
function pointInTriangle(point, tr1, tr2, tr3){
	var alpha = ((tr2.y - tr3.y)*(point.x - tr3.x) + (tr3.x - tr2.x)*(point.y - tr3.y)) / ((tr2.y - tr3.y)*(tr1.x - tr3.x) + (tr3.x - tr2.x)*(tr1.y - tr3.y));
	var beta = ((tr3.y - tr1.y)*(point.x - tr3.x) + (tr1.x - tr3.x)*(point.y - tr3.y)) / ((tr2.y - tr3.y)*(tr1.x - tr3.x) + (tr3.x - tr2.x)*(tr1.y - tr3.y));
	var gamma = 1.0 - alpha - beta;
	var inside = false;
	if(alpha > 0.0 && beta > 0.0 && gamma > 0.0){
		inside = true;
	}
	return inside;
}

function penUp(pt){
	if(pt.x == -1 && pt.y == -1)
		return true;
	else
		return false;
}

//TODO: re-order
// calculate distance only once, change angle, store by skipping n elements in array
function hexagonFromTwelfthHexagon(points){
	var revolutions = 6;
	var hexPoints = [];
	if(points.length <= 0) return hexPoints;

	// build SIXTH segment from TWELFTH segment by reflecting Y values across X axis
	var sixth = [];
	for(var i = 0; i < points.length; i++) sixth.push(points[i]);
	// reflection across y axis is most accessible given current orientation
	for(var i = points.length-1; i >= 0; i--) {
		if(penUp(points[i]))
			sixth.push(points[i]);
		else
			sixth.push({x:points[i].x, y:-points[i].y});
	}
	for(var a = 0; a < revolutions; a++){
		if(penUp(sixth[0]))
			hexPoints.push(sixth[0]);
		else{
			var angle = Math.atan2(sixth[0].y, sixth[0].x);
			var distance = Math.sqrt(sixth[0].y*sixth[0].y + sixth[0].x*sixth[0].x);
			hexPoints.push({x:(distance*Math.cos(angle+a*twoPi/6)), y:(distance*Math.sin(angle+a*twoPi/6))});
		}
		for(var i = 1; i < sixth.length-1; i++){
			if(penUp(sixth[i]))
				hexPoints.push(sixth[i]);
			else{
				var angle = Math.atan2(sixth[i].y, sixth[i].x);
				var distance = Math.sqrt(sixth[i].y*sixth[i].y + sixth[i].x*sixth[i].x);
				hexPoints.push({x:(distance*Math.cos(angle+a*twoPi/6)), y:(distance*Math.sin(angle+a*twoPi/6))});
			}
		}
	}
	var i = sixth.length-1;
	if(penUp(sixth[i]))
		hexPoints.push(sixth[i]);
	else{
		var angle = Math.atan2(sixth[i].y, sixth[i].x);
		var distance = Math.sqrt(sixth[i].y*sixth[i].y + sixth[i].x*sixth[i].x);
		hexPoints.push({x:(distance*Math.cos(angle+(revolutions-1)*twoPi/6)), y:(distance*Math.sin(angle+(revolutions-1)*twoPi/6))});
	}
	return hexPoints;
}

// RAY and LINE intersection test
// http://rootllama.wordpress.com/2014/06/20/ray-line-segment-intersection-test-in-2d/

// origin and dX,dY of RAY -- pointA pointB of line
// provide pre-calculated length of AB, and dX dY of A->B
function RayLineIntersectQuick(origin, dV, pA, pB, lengthAB, dAB){
	var v1 = new Point();
	var v2 = new Point();
	var v3 = new Point();
	v1.x = origin.x - pA.x;
	v1.y = origin.y - pA.y;
	v2.x = pB.x - pA.x;
	v2.y = pB.y - pA.y;
	v3.x = -dV.y;
	v3.y = dV.x;
	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
	var p = new Point();
	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
		p.x = pA.x + lengthAB * t2 * dAB.x;
		p.y = pA.y + lengthAB * t2 * dAB.y;
	}
	return p;
}
// full robust like gma's homemade chicken
// function RayLineIntersect(origin, dV, pA, pB){
// 	var v1 = new Point();
// 	var v2 = new Point();
// 	var v3 = new Point();
// 	v1.x = origin.x - pA.x;
// 	v1.y = origin.y - pA.y;
// 	v2.x = pB.x - pA.x;
// 	v2.y = pB.y - pA.y;
// 	v3.x = -dV.y;
// 	v3.y = dV.x;
// 	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
// 	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
// 	var p = new Point();
// 	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
// 		var dAB = new Point();
// 		var lengthAB = Math.sqrt( (pB.x-pA.x)*(pB.x-pA.x) + (pB.y-pA.y)*(pB.y-pA.y) );
// 		dAB.x = (pB.x - pA.x) / lengthAB;
// 		dAB.y = (pB.y - pA.y) / lengthAB;
// 		p.x = pA.x + lengthAB * t2 * dAB.x;
// 		p.y = pA.y + lengthAB * t2 * dAB.y;
// 	}
// 	return p;
// }