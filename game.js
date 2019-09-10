var FPS = 10;
var dt = 1/FPS;
var startingModule = 1;
var core;
var water;
var job;
var modules;


function get(c) {
    
    return document.getElementsByClassName(c)[0];
    
}

function gets(c) {
    
    return document.getElementsByClassName(c);
    
}

job = {
    enabled:true,
    name:"job",
    reputation:0,
    reputation_bar:0,
    next_promotion:200,
    message:"",
    messagetime:2000,
    promotions:[200,500,1000,1500],
    level:0,
}

job.run = function () {
    job.reputation = Math.max(0,job.reputation);
    applyData(job);
}

job.penalty = function (rep,message) {
    var penalty = job.reputation;
    job.reputation = Math.max(0,job.reputation + rep);
    penalty = job.reputation - penalty;
    if(penalty < -1) {
    	job.message = message + " " + Math.round(penalty);
    	setTimeout(job.removemessage,job.messagetime);
    }
}

job.removemessage = function() {
    job.message = "";
}

core = {
    enabled:true,
    name:"core",
    temp:500,
    max_temp:1000,
    power:0,
    power_rep:0.002,
    efficiency:0.695,
    temp_display:500,
    time:0,
    c_noise:0,
    water:0,
    water_display:0,
    noise_length:500,
    heat_varibility:10,
    
    
    
    
}

core.run = function() {
    core.time += dt;
    core.temp -= core.water * dt * water.heat_flow * core.heat_varibility;
    core.c_noise = PerlinNoise.noise(this.time/this.noise_length,0,0)
    core.temp += this.c_noise * dt * this.heat_varibility;
    core.temp_display = Math.round(this.temp);
    core.water_display = Math.round(this.water * 100);
    core.power = Math.pow(core.temp, core.efficiency);
    job.reputation += core.power * core.power_rep * dt;
    if(core.temp > core.max_temp) {
        job.penalty(-999999,"Temp exceeding 1000 degrees") 
    }
    applyData(core);
}

core.addwater = function(w) {
    this.water += w;
    this.water = Math.min(this.water,1);
    this.water = Math.max(this.water,0);
}

water = {
    enabled:false,
    name:"water",
    max_liters:500,
    liters:500,
    liters_display:0,
    waste_rep:-0.1,
    waste_threshold:50,
    empty_rep:10,
    heat_flow:1,
    flow:1,
    tankdisplay:get("tankdisplay"),
}

water.run = function() {
    this.liters -= core.water * water.flow * dt;
    if(this.liters < 0) {
        this.liters = 0;
        core.water = 0;
        job.penalty(water.empty_rep * dt,"Water is empty");
    }
    water.tankdisplay.style.top = (1-(this.liters/this.max_liters)) * 100;
    water.tankdisplay.style.height = (this.liters/this.max_liters) * 100;
    this.liters_display = Math.round(this.liters);
    
    this.temp_display = Math.round(this.temp);
    
    applyData(water);
}

water.reset = function() {
    if(water.liters > water.waste_threshold) {
    	job.penalty(water.liters * water.waste_rep,"Water was wasted");
    }
    water.liters = water.max_liters;
}

var modules = [job,core,water];

function setup(d) {
    setInterval(run,dt);
    
}

function run() {
    for(var i = 0;i < startingModule + job.level + 1;i++) {
        modules[i].run();
    }
    
    
}


function applyData(d) {
    keys = Object.keys(d);
    div = document.getElementsByClassName(d.div)[0];
    for(var i = 0;i < keys.length;i++) {
        var l = document.getElementsByClassName(d.name + "." + keys[i])
        var value = d[keys[i]];
        for(var j = 0;j < l.length;j++) {
            var v;
            if(l[j].getAttribute("round") == "true")
            {
            	v = Math.round(value);
            } else {
                v = value;
            }
            if(l[j].id == "bar") {
            	l[j].child[0].width = v;;
            }
            
        }
    }
    
}