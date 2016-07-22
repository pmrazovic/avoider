window.onload = function () {
	// Set the name of the hidden property and the change event for visibility
	var hidden, visibilityChange; 
	if (typeof document.hidden !== "undefined") {
	  hidden = "hidden";
	  visibilityChange = "visibilitychange";
	} else if (typeof document.mozHidden !== "undefined") {
	  hidden = "mozHidden";
	  visibilityChange = "mozvisibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
	  hidden = "msHidden";
	  visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
	  hidden = "webkitHidden";
	  visibilityChange = "webkitvisibilitychange";
	}

	// Back key event listener
	document.addEventListener('tizenhwkey', function(e) {
	  if (e.keyName === "back") {
	      try {
	          tizen.application.getCurrentApplication().exit();
	      } catch (ignore) {}
	  }
	});

	// Visibility change event listener
	document.addEventListener(visibilityChange, function () {
	  if (document[hidden]){
	  	pause = true;
	      document.removeEventListener('click', action);
	      document.removeEventListener('rotarydetent', move);
	  } else {
	    pause = false;
	    countP = 0;
	    document.addEventListener('click', action);
	    document.addEventListener('rotarydetent', move);
	  }
	}, false);
	// tap event
	document.addEventListener('click', action);
    
    // Setting up the canvas
    var canvas = document.getElementById('canvas'),
        ctx    = canvas.getContext('2d'),
        cH     = ctx.canvas.height = 360,
        cW     = ctx.canvas.width  = 360;

    //General sprite load
    var imgHeart = new Image();
    imgHeart.src = 'images/heart.png'
    var imgRefresh = new Image();
    imgRefresh.src = 'images/refresh.png';
    var spriteExplosion = new Image();
    spriteExplosion.src = 'images/explosion.png';
    var imgRocket1 = new Image();
    imgRocket1.src = 'images/rocket_1.png';
    var imgRocket2 = new Image();
    imgRocket2.src = 'images/rocket_2.png';
    var imgRocketIcon = new Image();
    imgRocketIcon.src = 'images/rocket_icon.png';
    var imgRock1 = new Image();
    imgRock1.src = 'images/rock_1.png';
    var imgRock2 = new Image();
    imgRock2.src = 'images/rock_2.png';
    var imgRock3 = new Image();
    imgRock3.src = 'images/rock_3.png';

    //Game
    var points     = 0,
        lives      = 4,
        count      = 0,
        pause      = false,
        countP     = 0,
        playing    = false,
        gameOver   = false,
    	starting = true,
        speed = 2,
        frame = 0;

    var record = localStorage.getItem("record");
    record = record == null ? 0 : record;
    
    //Player
    var player = new _player(cW/2-20, cH/2-15, "start");

    function move(e) {
        if (e.detail.direction === "CW") { 
            player.changeDirection('up');
        } else{
            player.changeDirection('down');
        }

    }

    function check_direction(argument) {
        if(player.y >= 325){
          player.changeY(325);
        }
        if(player.y <= 5){
          player.changeY(5);
        }
        if(player.direction == 'up'){
          var ny = player.y + 2;
          player.changeY(ny);
        }else if(player.direction == 'down'){
          var ny = player.y - 2;
          player.changeY(ny);
        }
    }

    // Enemies
    var enemies = [];

    function action(e) {
        e.preventDefault();
        if(gameOver) {
            if(e.type == 'click') {
                gameOver   = false;
                starting = true;
                playing = false;
                count      = 0;
                points = 0;
                lives = 4;
                speed = 2;
                enemies = [];
                player = new _player(cW/2-20, cH/2-15, "start");
                document.removeEventListener('rotarydetent', move);
            } 
        } else if (starting) {
        	if(e.type == 'click') {
        		starting = false;
                playing = true;
                enemies = [];
                document.addEventListener('rotarydetent', move);
        	}
        } else if (playing) {
            if(e.type == 'click') {
                playing = true;
                document.addEventListener('rotarydetent', move);
            }
        }
        
    }

    function _player(x,y,direction) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 29;
        this.direction = direction;
        this.changeX = function(nx){
          this.x = nx;
        }
        this.changeY = function(ny){
          this.y = ny;
        }
        this.changeDirection = function(nd){
            this.direction = nd;
        }
    }

    function _enemy(x, y, direction){
        this.x = x;
        this.y = y;
        this.state = 0;
        this.stateX = 0;
        this.destroyed = false;
        this.extinct = false;
        this.direction = direction;
        this.size = 20;
        this.type = random(1,3);

        switch(this.type){
            case 1:
                this.img = imgRock1;
                break;
            case 2:
                this.img = imgRock2;
                break;
            case 3:
                this.img = imgRock3;
                break;
        }

        this.changeX = function(nx){
          this.x = nx;
        }
        this.changeY = function(ny){
          this.y = ny
        }
        this.changeDirection = function(nd){
          this.direction = nd;
        }
      }

    function explosion(enemy) {
        ctx.save();

        var spriteY,
            spriteX = 256;
        if(enemy.state == 0) {
            spriteY = 0;
            spriteX = 0;
        } else if (enemy.state < 8) {
            spriteY = 0;
        } else if(enemy.state < 16) {
            spriteY = 256;
        } else if(enemy.state < 24) {
            spriteY = 512;
        } else {
            spriteY = 768;
        }

        if(enemy.state == 8 || enemy.state == 16 || enemy.state == 24) {
            enemy.stateX = 0;
        }

        ctx.drawImage(
            spriteExplosion,
            enemy.stateX += spriteX,
            spriteY,
            256,
            256,
            enemy.x-20,
            enemy.y-20,
            50,
            50
        );
        enemy.state += 1;

        if(enemy.state == 31) {
            enemy.extinct = true;
            var ne = enemies.indexOf(enemy);
            enemies.splice(ne, 1);
        }

        ctx.restore();
    }


    function start() {
        if (pause) {
            if (countP < 1) {
                countP = 1;
            }
        } else if (playing) {
        	//Clear
            ctx.clearRect(0, 0, cW, cH);
            ctx.beginPath();
            
            check_direction();

            // Drawing player
            var currentRocketImg;
            if (frame % 4 == 0 || frame % 8 == 0) {
                currentRocketImg = imgRocket1;
            } else {
                currentRocketImg = imgRocket2;
            }

            ctx.drawImage(
                currentRocketImg,
                player.x,
                player.y,
                player.width,
                player.height
            );

            // Drawing enemies
            for(i=0; i < enemies.length; i++){
                if(enemies[i].x > 360){
                    var ne = enemies.indexOf(enemies[i]);
                    enemies.splice(ne, 1);
                    points++;
                }

                if (!enemies[i].destroyed) {
                    speed = 2 + points/50;
                    if (speed > 10) {speed = 10}

                    var nx = enemies[i].x + speed;
                    enemies[i].changeX(nx);

                    ctx.drawImage(
                        enemies[i].img,
                        enemies[i].x,
                        enemies[i].y,
                        20,
                        20
                    );
                } else if (!enemies[i].extinct) {
                    explosion(enemies[i]);
                }
            }

            // Checking collision
            for(i=0;i<enemies.length;i++){
              var en = enemies[i];
              if(!en.destroyed && player.x < en.x + en.size && player.x + player.width > en.x && player.y < en.y - 10 + en.size && player.y + player.height > en.y + 10){
                lives--;
                enemy_loop = null;
                en.destroyed = true;
                explosion(en);
              }
            }

            if (lives == -1) {
                gameOver = true;
                playing  = false;
                canvas.removeEventListener('rotarydetent',move);
            }

            // Draw HUD
            ctx.font = "18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillText(points, cW/2,cH/2 + 150);

            ctx.font = "10px Helvetica";
            ctx.fillStyle = "white";
            ctx.textBaseline = 'middle';
            ctx.textAlign = "center";
            ctx.fillText('Record: '+record+'', cW/2,cH/2 - 150);

            var startX = 130;
            for (var i = 0; i < lives; i++) {
                ctx.drawImage(
                    imgHeart,
                    startX,
                    40,
                    20,
                    20
                );
                startX += 25;
            }

        	
        } else if(starting) {
            //Clear
            ctx.clearRect(0, 0, cW, cH);
            ctx.beginPath();

            ctx.font = "bold 25px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["avoider"], cW/2,cH/2 - 120);

            ctx.font = "bold 18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["tap_to_play"], cW/2,cH/2 - 90);     
              
            ctx.font = "bold 18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["instructions"], cW/2,cH/2 + 90);
              
            ctx.font = "14px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            wrapText(TIZEN_L10N["avoid"], cW/2,cH/2 + 115, 220, 18);
            
            ctx.drawImage(
                    imgRocketIcon,
                    cW/2 - 64,
                    cH/2 - 64,
                    128,
                    128
                );
            
        } else if(count < 1) {
            count = 1;
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.rect(0,0, cW,cH);
            ctx.fill();

            ctx.font = "bold 25px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Game over",cW/2,cH/2 - 100);

            ctx.font = "18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["score"] + ": "+ points, cW/2,cH/2 + 100);

            record = points > record ? points : record;
            localStorage.setItem("record", record);

            ctx.font = "18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["record"] + ": "+ record, cW/2,cH/2 + 125);

            ctx.drawImage(imgRefresh, cW/2 - 23, cH/2 - 23);
        }
    }

    function init(){
        var game_loop = setInterval(function(){
           start();
           frame += 1;
           frame %= 30;
        }, 30);
        var enemy_loop = setInterval(function(){
            if (!pause) {
                var rnd = Math.random()*360;
                var e = new _enemy(-20, rnd, 'left');
                enemies.push(e);
            }
        }, 400);
    }

    init();

    //Utils
    function random(from, to) {
        return Math.floor(Math.random() * (to - from + 1)) + from;
    }

    function wrapText(text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
      }

}