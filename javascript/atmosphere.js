// Atmosphere is an array of atmospheric conditions, sequential indices represent changing time
// requires P5.js for things like 'random()' and 'PI'
//
// contains:  {'pressure',
//             'density',
//             'moisture'}

var Atmosphere = function(length){
	this.length = length;
	this.pressure = [];
	this.moisture = [];
	this.density = [];
	if(length <= 0){return;}

	var curves = [];
	for(var waves = 0; waves < 3; waves++){
		var curve = [];
		// capture a sine curve with some frequency and offset, relative to this nuber of this.length
		var offset = random(2*PI)-PI;
		var frequency = (random(8)+.5) / this.length;
		if(waves == 1)
			frequency = (random(2)+4.5) / this.length;

		for(var i = 0; i < this.length; i++){
			curve.push( cos(offset + PI*frequency * i)*.5 + .5 );  // betwee 0 and 1
		}
		curves.push(curve);
	}
	for(var i = 0; i < this.length; i++){
		this.pressure[i] = (curves[0][i]) * .9 + .05;      //random(1);
		if(curves[1][i] > 0.5)//random(10) > 5)
			this.density[i] = true;
		else 
			this.density[i] = false;
		this.moisture[i] = (curves[2][i]) * .9 + .05;    //random(1);
	}
	// // manually mess with the data
	// for(var i = 0; i < 3; i++){
	// 	var index = int(random(this.length));
	// 	this.pressure[index] = random(0.0, 0.1);
	// }

	this.drawGraph = function(rect){
	// rect is expecting {'x':_, 'y':_, 'width':_, 'height':_, }
		noStroke();
		fill(40,255);
		beginShape();
		vertex(rect.x, rect.y);
		vertex(rect.x, rect.y + rect.height);
		vertex(rect.x + rect.width, rect.y + rect.height);
		vertex(rect.x + rect.width, rect.y);
		endShape(CLOSE);

		for(var i = 0; i < this.length - 1; i++){
			stroke(255,0,0);
			line(rect.x + (i)*(rect.width/this.length), rect.y + this.pressure[i] * rect.height, 
				rect.x + (i+1)*(rect.width/this.length), rect.y + this.pressure[i+1] * rect.height);
			stroke(0,255,0);
			line(rect.x + (i)*(rect.width/this.length), rect.y + this.moisture[i] * rect.height, 
				rect.x + (i+1)*(rect.width/this.length), rect.y + this.moisture[i+1] * rect.height);
			stroke(70,70,255);
			line(rect.x + (i)*(rect.width/this.length), rect.y + this.density[i] * rect.height, 
				rect.x + (i+1)*(rect.width/this.length), rect.y + this.density[i+1] * rect.height);
		}
	}
};