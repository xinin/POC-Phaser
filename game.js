
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
    this.player.body.setSize(50, 40, 0, 1);//w,h, x, y

    this.cursors = this.input.keyboard.createCursorKeys();

    this.bulletPool = this.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'bullet');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    this.nextShotAt = 0;
    this.shotDelay = 100;

    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50,'greenEnemy');
    this.enemyPool.setAll('anchor.x',0.5);
    this.enemyPool.setAll('anchor.y',0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);

    this.enemyPool.forEach(function (enemy) {
      enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
    });

    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;

    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(50, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function (explosion) {
      explosion.animations.add('boom');
    });

    this.instructions = this.add.text( 400, 450,
        'Usa las flechas de dirección para moverte.\n Presiona la barra espaciadora para disparar.',
        { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + 10000;
  },

  update: function () {
    this.sea.tilePosition.y += 0.2;

    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);

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

    if (this.instructions.exists && this.time.now > this.instExpire) {
      this.instructions.destroy();
    }

    this.enemyRespawn();
  },

  enemyRespawn: function(){
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      enemy.reset(this.rnd.integerInRange(20, 780), 0);
      enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
      enemy.play('fly');
    }
  },

  fire: function (){
    if (this.nextShotAt < this.time.now && this.player.alive || this.bulletPool.countDead() === 0) {
      this.nextShotAt = this.time.now + this.shotDelay;

      var bullet = this.bulletPool.getFirstExists(false);
      bullet.reset(this.player.x, this.player.y - 20);
      bullet.body.velocity.y = -500;
    }
    else{
      //TODO
    }
  },

  explode: function(sprite){
    if(this.explosionPool.countDead() > 0){
      var explosion = this.explosionPool.getFirstExists(false);
      explosion.reset(sprite.x, sprite.y);
      explosion.play('boom', 15, false, true);

      explosion.body.velocity.x = sprite.body.velocity.x;
      explosion.body.velocity.y = sprite.body.velocity.y;
    }
  },

  enemyHit: function (bullet, enemy) {
    bullet.kill();
    this.explode(enemy);
    enemy.kill();
  },

  playerHit: function (player,enemy){
    this.explode(enemy);
    enemy.kill();

    this.explode(player);
    player.kill();
  },

  render: function() {

    var game = this.game;

    this.bulletPool.forEach(function (bullet) {
      game.debug.body(bullet);
    });

    this.enemyPool.forEach(function (enemy) {
      game.debug.body(enemy);
    });

    this.game.debug.body(this.player);
  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
