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
	// member functions
	this.draw = drawAtmosphereGraph;

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
};