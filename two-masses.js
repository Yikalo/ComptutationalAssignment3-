var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d'); 
var canvas_bg = document.getElementById('canvas_bg');
var context_bg = canvas_bg.getContext('2d');


var ball1;
var ball2;
var r1 = 10;
var r2 = 40;
var m1 = 1; 
var m2 = 60; 
var G = 100000;
var t0,dt;
var socket = io.connect("http://76.28.150.193:8888");
socket.on("load", function(data){
	console.log(data);
});


function Ball(radius,color,mass,charge,gradient){
	if(typeof(radius)==='undefined') radius = 20;
	if(typeof(color)==='undefined') color = '#0000ff';
	if(typeof(mass)==='undefined') mass = 1;
	if(typeof(charge)==='undefined') charge = 0;
	if(typeof(gradient)==='undefined') gradient = false;	
	this.radius = radius;
	this.color = color;
	this.mass = mass;
	this.charge = charge;
	this.gradient = gradient;
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;	

}		

Ball.prototype = {
	get pos2D (){
		return new Vector2D(this.x,this.y);			
	},
	set pos2D (pos){
		this.x = pos.x;
		this.y = pos.y;
	},
	get velo2D (){
		return new Vector2D(this.vx,this.vy);			
	},
	set velo2D (velo){
		this.vx = velo.x;
		this.vy = velo.y;
	},
	draw: function (context) {  
		if (this.gradient){
			grad = context.createRadialGradient(this.x,this.y,0,this.x,this.y,this.radius);
			grad.addColorStop(0,'#ffffff');
			grad.addColorStop(1,this.color);
			context.fillStyle = grad;
		}else{
			context.fillStyle = this.color;
		}	
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
		context.closePath();
		context.fill();		
	}
};

var saveButton = document.createElement("Button");
    saveButton.innerHTML = "Save";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(saveButton);

window.onload = init; 

function init() {
	balls = {
		ball:[]
	};

	
     for (var i=0; i<1000; i++){
          var star = new Ball(Math.random()*2,'#ffff00');
          star.pos2D= new Vector2D(Math.random()*canvas_bg.width,Math.random()*canvas_bg.height);
          star.draw(context_bg);
     }
	var ball1Init = new Ball(r1,'#9999ff',m1,0,true);
	ball1Init.pos2D = new Vector2D(150, 300);
	ball1Init.draw(context_bg);
		
	var ball2Init = new Ball(r2,'#ff9999',m2,0,true);		
	ball2Init.pos2D = new Vector2D(350,200);
	ball2Init.draw(context_bg);				
		
	ball1 = new Ball(r1,'#0000ff',m1,0,true);				
	ball1.pos2D = ball1Init.pos2D;
	ball1.velo2D = new Vector2D(0,150);
			
	ball1.draw(context);
	balls.ball.push(ball1);
			
	ball2 = new Ball(r2,'#ff0000',m2,0,true);
	ball2.pos2D = ball2Init.pos2D;	
	ball2.velo2D = new Vector2D(0,0);		
	ball2.draw(context);
	balls.ball.push(ball2);				
			
	t0 = new Date().getTime(); 
	animFrame();
	

};



function animFrame(){
	animId = requestAnimationFrame(animFrame,canvas);
	onTimer(); 
}
function onTimer(){
	var t1 = new Date().getTime(); 
	dt = 0.001*(t1-t0); 
	t0 = t1;
	if (dt>0.2) {dt=0;};	
	move();
}

function move(){		
	context.clearRect(0, 0, canvas.width, canvas.height);	
	moveObject(ball1);
	moveObject(ball2);	
	calcForce(ball1,ball2); 
	update(ball1);
	calcForce(ball2,ball1);	
	update(ball2);


}

function update(obj){
	updateAccel(obj.mass);
	updateVelo(obj);


	   var save = document.getElementById('save');
       var load = document.getElementById('load');
       var sentData = {ball:[] };
       //socket.on("load", function(data){
       	save.onclick = function(){
       		console.log("save button clicked");
       		console.log(balls.ball.length);
       		for (var i = 0; i < balls.ball.length; i++) {
       			sentData.ball.push(balls.ball[i]);
       		}
       		console.log(sentData);
       		socket.emit("save", { studentname: "Yikalo Ekubazgi", statename: "aState", data: sentData });
       	}
       	load.onclick = function(){
       		
       		socket.emit("load", { studentname: "Yikalo Ekubazgi", statename: "aState" });
       		for (var i = 0; i < sentData.ball.length; i++) {
       			balls.ball.push(sentData.ball[i]);
       		}
       		console.log("loaded balls" + balls);
       		console.log("load button clicked");
       	}
       //});
    
    
}


function moveObject(obj){
	obj.pos2D = obj.pos2D.addScaled(obj.velo2D,dt);	
	obj.draw(context);	
}
function calcForce(obj1,obj2){
	force = Forces.gravity(G,obj1.mass,obj2.mass,obj1.pos2D.subtract(obj2.pos2D));	
}	
function updateAccel(m){
	acc = force.multiply(1/m);
}	
function updateVelo(obj){
	obj.velo2D = obj.velo2D.addScaled(acc,dt);				
}




