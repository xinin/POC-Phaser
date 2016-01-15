
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  create: function () {

    this.sea = this.add.tileSprite(0, 0, 800, 600, 'sea');

    this.player = this.add.sprite(400,500,'player');
    this.player.anchor.setTo(0.5,0.5);
    this.player.animations.add('fly',[0, 1, 2], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player,Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;

    this.cursors = this.input.keyboard.createCursorKeys();

    this.bullets = [];

    this.nextShotAt = 0;
    this.shotDelay = 100;

    this.enemy = this.add.sprite(400, 200, 'greenEnemy');
    this.enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
    this.enemy.play('fly');
    this.enemy.anchor.setTo(0.5, 0.5);
    this.physics.enable(this.enemy, Phaser.Physics.ARCADE);

  },

  update: function () {
    this.sea.tilePosition.y += 0.2;

    for(var i = 0; i < this.bullets.length; i++){
      this.physics.arcade.overlap(this.bullets[i], this.enemy, this.enemyHit, null, this);
    }


    this.player.body.velocity.x= 0;
    this.player.body.velocity.y= 0;

    if(this.cursors.left.isDown){
      this.player.body.velocity.x = - this.player.speed;
    }
    else if(this.cursors.right.isDown){
      this.player.body.velocity.x = this.player.speed;
    }

    if(this.cursors.up.isDown){
      this.player.body.velocity.y = - this.player.speed;
    }
    else if(this.cursors.down.isDown){
      this.player.body.velocity.y = this.player.speed;
    }

    if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      this.fire();
    }

  },

  fire: function (){
    if (this.nextShotAt < this.time.now) {
      this.nextShotAt = this.time.now + this.shotDelay;
      var bullet = this.add.sprite(this.player.x, this.player.y-20, 'bullet');
      bullet.anchor.setTo(0.5, 0.5);
      this.physics.enable(bullet, Phaser.Physics.ARCADE);
      bullet.body.velocity.y = -500;
      this.bullets.push(bullet);
    }
  },

  enemyHit: function (bullet, enemy) {
    bullet.kill();
    enemy.kill();

    var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom');
    explosion.play('boom', 15, false, true);
  },

  render: function() {
    for(var i = 0; i < this.bullets.length; i++) {
      this.game.debug.body(this.bullets[i]);
    }
    this.game.debug.body(this.enemy);
    this.game.debug.body(this.player);
  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
