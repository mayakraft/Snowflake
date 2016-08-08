// Atmosphere is an array of fake atmospheric conditions, actually it's conditions for growing one moment of a snowflake
// currently using P5.js for convenience functions like 'random()'
//
// contains:  {'mass',
//             'branch',
//             'thin'}

var Atmosphere = function(length){
	this.length = int(length);
	this.mass = [];
	this.thin = [];
	this.branch = [];
	if(length <= 0){return;}

	var phase1 = random(2*PI)-PI;
	var phase2 = random(2*PI)-PI;
	var phase3 = random(2*PI)-PI;

	var freq1 = random(0.5, 10.0) / this.length;
	var freq2 = random(0.5, 10.0) / this.length;
	var freq3 = random(4.0, 20.0) / this.length;

	for(var i = 0; i < this.length; i++){		
		this.mass[i] = (cos(phase1+freq1*i)*.5+.5);
		this.thin[i] = (cos(phase2+freq2*i)*.5+.5);
		if(cos(phase3+freq3*i) > 0)  this.branch[i] = true;
		else                         this.branch[i] = false;
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

		// mass, branch, thin
		for(var i = 0; i < (this.length-1); i++){
			stroke(255, 128, 128);
			line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.mass[i] * rect.height, 
			     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.mass[i+1] * rect.height);
			stroke(128, 255, 128);
			line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.thin[i] * rect.height, 
			     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.thin[i+1] * rect.height);
			stroke(128, 128, 255);
			line(rect.x + (i)/(this.length-1) * rect.width, rect.y + this.branch[i] * rect.height, 
			     rect.x + (i+1)/(this.length-1) * rect.width, rect.y + this.branch[i+1] * rect.height);
		}
	}
};