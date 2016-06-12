// Atmosphere is an array of atmospheric conditions, sequential indices represent changing time
// requires P5.js for things like 'random()' and 'PI'
//
// contains:  {'pressure',
//             'density',
//             'moisture'}

var Atmosphere = function(length){
	this.length = int(length);
	this.pressure = [];
	this.moisture = [];
	this.density = [];
	if(length <= 0){return;}

	var phase1 = random(2*PI)-PI;
	var phase2 = random(2*PI)-PI;
	var phase3 = random(2*PI)-PI;

	var freq1 = random(0.5, 10.0) / this.length;
	var freq2 = random(0.5, 10.0) / this.length;
	var freq3 = random(4.0, 20.0) / this.length;

	for(var i = 0; i < this.length; i++){		
		this.pressure[i] = (cos(phase1+freq1*i)*.5+.5);
		this.moisture[i] = (cos(phase2+freq2*i)*.5+.5);
		if(cos(phase3+freq3*i) > 0)  this.density[i] = true;
		else                         this.density[i] = false;
	}

	this.drawGraph = function(rect){
		// rect is expecting {'x':_, 'y':_, 'width':_, 'height':_, }
		var MARGIN = 10;

		// bounding box
		stroke(220);
		fill(240);
		beginShape();
		vertex(rect.x-MARGIN, rect.y-MARGIN);
		vertex(rect.x-MARGIN, rect.y+MARGIN + rect.height);
		vertex(rect.x+MARGIN + rect.width, rect.y+MARGIN + rect.height);
		vertex(rect.x+MARGIN + rect.width, rect.y-MARGIN);
		endShape(CLOSE);

		// x=0 origin line
		stroke(220);
		line(rect.x-MARGIN, rect.y + .5 * rect.height, rect.x+MARGIN + rect.width, rect.y + .5 * rect.height);

		// pressure, density, moisture
		for(var i = 0; i < (this.length-1); i++){
			stroke(255, 128, 128);
			line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.pressure[i] * rect.height, 
			     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.pressure[i+1] * rect.height);
			stroke(128, 255, 128);
			line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.moisture[i] * rect.height, 
			     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.moisture[i+1] * rect.height);
			stroke(128, 128, 255);
			line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.density[i] * rect.height, 
			     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.density[i+1] * rect.height);
		}
	}
};