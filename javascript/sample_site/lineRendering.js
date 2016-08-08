var TWOPI = 6.28318530717959;
var sin60 = 0.866025403784439;

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
			hexPoints.push({x:(distance*Math.cos(angle+a*TWOPI/6)), y:(distance*Math.sin(angle+a*TWOPI/6))});
		}
		for(var i = 1; i < sixth.length-1; i++){
			if(penUp(sixth[i]))
				hexPoints.push(sixth[i]);
			else{
				var angle = Math.atan2(sixth[i].y, sixth[i].x);
				var distance = Math.sqrt(sixth[i].y*sixth[i].y + sixth[i].x*sixth[i].x);
				hexPoints.push({x:(distance*Math.cos(angle+a*TWOPI/6)), y:(distance*Math.sin(angle+a*TWOPI/6))});
			}
		}
	}
	var i = sixth.length-1;
	if(penUp(sixth[i]))
		hexPoints.push(sixth[i]);
	else{
		var angle = Math.atan2(sixth[i].y, sixth[i].x);
		var distance = Math.sqrt(sixth[i].y*sixth[i].y + sixth[i].x*sixth[i].x);
		hexPoints.push({x:(distance*Math.cos(angle+(revolutions-1)*TWOPI/6)), y:(distance*Math.sin(angle+(revolutions-1)*TWOPI/6))});
	}
	return hexPoints;
}