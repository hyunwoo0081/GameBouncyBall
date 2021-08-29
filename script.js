import GameMaps from './gameMaps.js';

const canvasEl = document.querySelector("canvas");
const ctx = canvasEl.getContext("2d");

const heightV = 15;
var LocalTime;

var Camera = {
	screenWidth: 0,
	screenHeight: 0,
	screenStartWidth: 0,
	screenStartHeight: 0,
	dp: 0,
	resizeWindow(){
		canvasEl.width = Camera.screenWidth = window.innerWidth;
		canvasEl.height = Camera.screenHeight = window.innerHeight;
		Camera.resizeMap(MapCtx.width, MapCtx.height);
	},
	resizeMap(width, height){
		width = width || 25;
		height = height || 15;
		Camera.dp = Camera.screenHeight / height;
		Camera.screenStartWidth = (Camera.screenWidth - Camera.dp * width) / 2;
		Camera.screenStartHeight = 0;
	},
	drawBackground(){
		ctx.beginPath();
		ctx.rect(0, 0, Camera.screenWidth, Camera.screenHeight);
		ctx.fillStyle = "white";
		ctx.fill();
	},
	drawBall(x, y, r, color){
		ctx.beginPath();
		ctx.arc(Camera.screenStartWidth + x*Camera.dp, Camera.screenHeight - y*Camera.dp, r*Camera.dp, 0, 2*Math.PI, true);
		ctx.fillStyle = color;
		ctx.fill();

		ctx.strokeStyle = "black";
		ctx.lineWidth = Camera.dp/25;
		ctx.stroke();
	},
	drawText(x, y, str){
		x = Camera.screenStartWidth + x*Camera.dp;
		y = Camera.screenHeight - y*Camera.dp;
		ctx.fillStyle = "black";
		ctx.font = "32px serif";
		ctx.fillText(str, x, y);
	},
	drawImgBlock(x, y, type){
		if(type === 0) return;
		type -= 1;

		let source = new Image();
		source.src = "gui.png";
		
		x = Camera.screenStartWidth + x*Camera.dp;
		y = Camera.screenHeight - (y+1)*Camera.dp;

		ctx.drawImage(source, type%15*32, Math.floor(type/15)*32+0.3, 31.7, 31.5, x, y, Camera.dp, Camera.dp);
	}
};

var MapCtx = {
	mapName: "map0001",
	playMapData: null,
	width:0,
	height:0,
	starCount:0,
	isClear:false,
	clearCount:-1,
	loadMap(mapName){
		console.log(mapName);
		MapCtx.mapName = mapName || "map0000";
		MapCtx.width = GameMaps[MapCtx.mapName]["mapSize"][0];
		MapCtx.height = GameMaps[MapCtx.mapName]["mapSize"][1];
		MapCtx.isClear = false;
		MapCtx.clearCount = -1;

		MapCtx.playMapData = new Array(MapCtx.height);
		for(let i = 0; i < MapCtx.height; i++){
			MapCtx.playMapData[i] = Array.from({length: MapCtx.width}, () => 0);
		}

		MapCtx.reloadMap();
		Camera.resizeMap(MapCtx.width, MapCtx.height);
	},
	reloadMap(){
		Ball.x = GameMaps[MapCtx.mapName]["ballPosition"][0] + 0.5;
		Ball.y = GameMaps[MapCtx.mapName]["ballPosition"][1] + 0.5;
		Ball.velY = 0;
		Ball.flyDirection = -1;

		MapCtx.starCount = 0;
		
		for(let i = 0; i < MapCtx.height; i++){
			for(let j = 0; j < MapCtx.width; j++){
				MapCtx.playMapData[i][j] = GameMaps[MapCtx.mapName]["map"][i][j];

				if(MapCtx.playMapData[i][j] === 77)
					MapCtx.starCount++;
			}
		}
	},
	drawMap(){
		for(let i = 0; i < MapCtx.height; i++){
			for(let j = 0; j < MapCtx.width; j++){
				Camera.drawImgBlock(j, i, MapCtx.playMapData[i][j]);
			}
		}
	}
};

var Storage = {
	isAvailable: false,
	init(){
		try {
			localStorage.setItem("x", "x");
			localStorage.getItem("x");
			localStorage.removeItem("x");
			Storage.isAvailable = true;
		}catch(e){
			console.log(e.toString());
			Storage.isAvailable = false;
		}
	},
	save:function(){
		
	}
};

var Key = {
	left: false,
	right: false,
	leftTime: -1,
	rightTime: -1,
	doubleTime: 150,
	doEvent(DeltaTime){
		if(Key.left) Ball.x -= DeltaTime*3.2;
		else if(Key.right) Ball.x += DeltaTime*3.2;

		if(Key.left || Key.right){
			Ball.flyDirection = -1;
		}
	}
};


function init(){
	Camera.resizeWindow();
	Storage.init();
	MapCtx.loadMap();

	window.addEventListener("resize", e => {
		Camera.resizeWindow();
	});

	window.addEventListener("keydown", function(e){
		let time = new Date().getTime();
		switch(e.keyCode){
			case 37: 
				Key.left = true;
				if(time - Key.leftTime < Key.doubleTime){
					//console.log("left double");
				}
				Key.leftTime = time;
				Key.right = false;
				break;
			case 39: 
				Key.right = true;
				if(time - Key.rightTime < Key.doubleTime){
					//console.log("right double");
				}
				Key.rightTime = time;
				Key.left = false;
				break;
		}
	});

	window.addEventListener("keyup", function(e){
		switch(e.keyCode){
			case 37: 
				Key.left = false;
				break;
			case 39:
				Key.right = false;
				break;
		}
	});
	
	window.addEventListener("touchstart", function(event){
		let touch = event.changedTouches[0];
		let time = new Date().getTime();
		if(touch.pageX <= Camera.screenWidth/2){
			Key.left = true;
			if(time - Key.leftTime < Key.doubleTime){
				//console.log("left double");
			}
			Key.leftTime = time;
			Key.right = false;
		}
		else{
			Key.right = true;
			if(time - Key.rightTime < Key.doubleTime){
				//console.log("right double");
			}
			Key.rightTime = time;
			Key.left = false;
		}
	});
	
	window.addEventListener("touchend", function(event){
		Key.left = false;
		Key.right = false;
	});
	
	canvasEl.requestFullscreen();
	
	LocalTime = new Date().getTime();
	draw();
}

var Ball = {
	x:5,
	y:5.5,
	r:0.25,
	velY:0,
	gravity:-4/0.375/0.375,
	flyDirection: -1,
	isAlive: true
};

let mapLevelCounter = 1;

function nextLevel(){
	mapLevelCounter++;
	if(mapLevelCounter < 10) return "map000"+mapLevelCounter;
	else if(mapLevelCounter < 100) return "map00"+mapLevelCounter;
	else if(mapLevelCounter < 1000) return "map0"+mapLevelCounter;
	return "map"+mapLevelCounter;
}

function endGame(restart){
	if(restart){
		if(!MapCtx.isClear) MapCtx.reloadMap();
	}
	else{
		MapCtx.loadMap(nextLevel());
	}
}

function collision(){
	if(Ball.x - Ball.r < 0){
		Ball.x = Ball.r;
		Ball.flyDirection = -1;
	}
	else if(Ball.x + Ball.r > MapCtx.width){
		Ball.x = MapCtx.width - Ball.r;
		Ball.flyDirection = -1;
	}

	for(let i = Math.floor(Ball.y-Ball.r); i <= Math.floor(Ball.y+Ball.r); i++){
		for(let j = Math.floor(Ball.x-Ball.r); j <= Math.floor(Ball.x+Ball.r); j++){
			if(i >= 0 && i < MapCtx.height && j >= 0 && j < MapCtx.width && MapCtx.playMapData[i][j] !== 0){
				switch(MapCtx.playMapData[i][j]){
					case 77:
						MapCtx.playMapData[i][j] = 0;
						if(--MapCtx.starCount <= 0){
							MapCtx.isClear = true;
							MapCtx.clearCount = 2;
						}
						return;
					default: 
						Ball.flyDirection = -1;
						break;
				}

				let CenterX = j + 0.5;
				let CenterY = i + 0.5;

				if(Ball.y-CenterY > 0.4){ //collision top
					if(MapCtx.playMapData[i+1][j] != 0) return;
					Ball.y = i + 1 + Ball.r;
					Ball.velY = 1.3/0.375/0.375;

					switch(MapCtx.playMapData[i][j]){
						case 31:
							MapCtx.playMapData[i][j] = 0;
							break;
						case 32:
							Ball.velY = 2/0.375/0.375;
							break;
						case 33:
							Ball.flyDirection = 0;
							Ball.y = CenterY;
							Ball.x = j + 1.5;
							break;
						case 34:
							Ball.flyDirection = Math.PI;
							Ball.y = CenterY;
							Ball.x = j - 0.5;
							break;
					}
				}
				else if(Ball.y-CenterY < -0.4){ //collision bottom
					if(Ball.velY > 0){
						Ball.y = i - Ball.r;
						Ball.velY -= Ball.velY;
					}
				}
				else{
					if(Ball.x-CenterX > 0){ //collision right
						Ball.x = j + 1.1 + Ball.r;
					}
					else{ //collision left
						Ball.x = j - Ball.r - 0.1;
					}
				}
			}
		}
	}

	if(Ball.y < 0){
		endGame(true);
	}
}

function physics(DeltaTime){
	//up to down => 0.75s = 750ms;
	//height = 2;

	if(Ball.flyDirection === -1){
		Ball.velY += Ball.gravity * DeltaTime;
		Ball.y += Ball.velY * DeltaTime;
	}
	else{
		Ball.velY = 0;
		Ball.x += Math.cos(Ball.flyDirection) * 10 * DeltaTime;
		Ball.y += Math.sin(Ball.flyDirection) * 10 * DeltaTime;
	}
	
}

function draw(){
	let currentTime = new Date().getTime();
	let FrameTime = (currentTime - LocalTime)/1000;
	LocalTime = currentTime;
	
	//key event
	Key.doEvent(FrameTime);
	collision();
	physics(FrameTime);
	
	//draw
	Camera.drawBackground();
	Camera.drawBall(Ball.x, Ball.y, Ball.r, "yellow");
	MapCtx.drawMap();

	//timer
	if(MapCtx.isClear){
		if(MapCtx.clearCount > 0){
			MapCtx.clearCount -= FrameTime;
		}
		else{
			MapCtx.clearCount = -FrameTime;
			MapCtx.isClear = false;
			endGame(false);
		}
	}
	
	requestAnimationFrame(draw);
}


init();