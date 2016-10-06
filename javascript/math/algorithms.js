// POINT inside TRIANGLE test
// http://stackoverflow.com/questions/13300904/determine-whether-point-lies-inside-triangle
//    all the arguments are points {x:___, y:___}
function pointInTriangle(point, tr1, tr2, tr3){
	var alpha = ((tr2.y - tr3.y)*(point.x - tr3.x) + (tr3.x - tr2.x)*(point.y - tr3.y)) / ((tr2.y - tr3.y)*(tr1.x - tr3.x) + (tr3.x - tr2.x)*(tr1.y - tr3.y));
	var beta = ((tr3.y - tr1.y)*(point.x - tr3.x) + (tr1.x - tr3.x)*(point.y - tr3.y)) / ((tr2.y - tr3.y)*(tr1.x - tr3.x) + (tr3.x - tr2.x)*(tr1.y - tr3.y));
	var gamma = 1.0 - alpha - beta;
	if(alpha > 0.0 && beta > 0.0 && gamma > 0.0){
		return true;
	}
	return false;
}

// RAY and LINE intersection test
// http://rootllama.wordpress.com/2014/06/20/ray-line-segment-intersection-test-in-2d/

// origin and dX,dY of RAY -- pointA pointB of line
// provide pre-calculated length of AB, and dX dY of A->B
function RayLineIntersectQuick(origin, dV, pA, pB, lengthAB, dAB){
	var v1 = {x: (origin.x - pA.x), 
	          y: (origin.y - pA.y) };
	var v2 = {x: (pB.x - pA.x),
	          y: (pB.y - pA.y) };
	var v3 = {x: (-dV.y),
	          y: (dV.x) };
	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
		return {x: (pA.x + lengthAB * t2 * dAB.x),
		        y: (pA.y + lengthAB * t2 * dAB.y) };
	}
	return undefined;
}

// no shortcut function
function RayLineIntersect(origin, dV, pA, pB){
	var v1 = {x: (origin.x - pA.x), 
	          y: (origin.y - pA.y) };
	var v2 = {x: (pB.x - pA.x),
	          y: (pB.y - pA.y) };
	var v3 = {x: (-dV.y),
	          y: (dV.x) };
	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
		var lengthAB = Math.sqrt( (pB.x-pA.x)*(pB.x-pA.x) + (pB.y-pA.y)*(pB.y-pA.y) );
		var dAB = {x: ((pB.x - pA.x) / lengthAB),
		           y: ((pB.y - pA.y) / lengthAB) };
		return {x: (pA.x + lengthAB * t2 * dAB.x),
		        y: (pA.y + lengthAB * t2 * dAB.y) };
	}
	return undefined;
}