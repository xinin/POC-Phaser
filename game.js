
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  create: function () {

    this.setupBackground();
    this.setupPlayer();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
    this.setupPlayerIcons();
    this.setupText();

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  setupBackground : function(){
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    this.sea.autoScroll(0,BasicGame.SEA_SCROLL_SPEED);
  },

  setupPlayer : function(){
    this.player = this.add.sprite(this.game.width / 2,this.game.height - 50,'player');
    this.player.anchor.setTo(0.5,0.5);
    this.player.animations.add('fly',[0, 1, 2], 20, true);
    this.player.animations.add('ghost', [ 3, 0, 3, 1 ], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player,Phaser.Physics.ARCADE);
    this.player.speed = BasicGame.PLAYER_SPEED;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(50, 40, 0, 1);//w,h, x, y
  },

  setupEnemies : function(){
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50,'greenEnemy');
    this.enemyPool.setAll('anchor.x',0.5);
    this.enemyPool.setAll('anchor.y',0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    this.enemyPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true);

    this.enemyPool.forEach(function (enemy) {
      enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
      enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
      enemy.events.onAnimationComplete.add( function (e) {
        e.play('fly');
      }, this);
    });

    this.nextEnemyAt = 0;
    this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;
  },

  setupBullets : function(){
    this.bulletPool = this.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'bullet');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    this.nextShotAt = 0;
    this.shotDelay = BasicGame.SHOT_DELAY;
  },

  setupExplosions : function(){
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(50, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function (explosion) {
      explosion.animations.add('boom');
    });
  },

  setupPlayerIcons: function () {
    this.lives = this.add.group();
    var firstLifeIconX = this.game.width - 10 - (BasicGame.PLAYER_EXTRA_LIVES * 30);
    for (var i = 0; i < BasicGame.PLAYER_EXTRA_LIVES; i++) {
      var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
      life.scale.setTo(0.5, 0.5);
      life.anchor.setTo(0.5, 0.5);
    }
  },

  setupText : function(){
    this.instructions = this.add.text( this.game.width / 2, this.game.height - 100,
        'Usa las flechas de dirección para moverte.\n Presiona la barra espaciadora para disparar.',
        { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + BasicGame.INSTRUCTION_EXPIRE;

    this.score = 0;
    this.scoreText = this.add.text(this.game.width / 2, 30, '' + this.score,
        { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.scoreText.anchor.setTo(0.5, 0.5);
  },

  update: function () {
    this.checkCollisions();
    this.processPlayerInput();
    this.spawnEnemies();
    this.processDelayedEffects();
  },

  checkCollisions : function(){
    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
  },

  processPlayerInput: function(){
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

  spawnEnemies : function(){
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      enemy.reset(this.rnd.integerInRange(20, this.game.width - 20), 0, BasicGame.ENEMY_HEALTH);
      enemy.body.velocity.y = this.rnd.integerInRange(BasicGame.ENEMY_MIN_Y_VELOCITY, BasicGame.ENEMY_MAX_Y_VELOCITY);
      enemy.play('fly');
    }
  },

  processDelayedEffects: function () {
    if (this.instructions.exists && this.time.now > this.instExpire) {
      this.instructions.destroy();
    }

    if (this.ghostUntil && this.ghostUntil < this.time.now) {
      this.ghostUntil = null;
      this.player.play('fly');
    }
  },

  fire: function (){
    if (this.nextShotAt < this.time.now && this.player.alive || this.bulletPool.countDead() === 0) {
      this.nextShotAt = this.time.now + this.shotDelay;

      var bullet = this.bulletPool.getFirstExists(false);
      bullet.reset(this.player.x, this.player.y - 20);
      bullet.body.velocity.y = - BasicGame.BULLET_VELOCITY;
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
    this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
  },

  playerHit: function (player,enemy){
    if(!this.ghostUntil){
      this.damageEnemy(enemy, BasicGame.CRASH_DAMAGE);
      var life = this.lives.getFirstAlive();
      if (life !== null) {
        life.kill();
        this.ghostUntil = this.time.now + BasicGame.PLAYER_GHOST_TIME;
        this.player.play('ghost');
      } else {
        this.explode(player);
        player.kill();
      }
    }
  },

  damageEnemy: function (enemy, damage) {
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.addToScore(enemy.reward);
    }
  },

  addToScore: function (score) {
    this.score += score;
    this.scoreText.text = this.score;
  },

  //render: function() {
  //
  //  var game = this.game;
  //
  //  this.bulletPool.forEach(function (bullet) {
  //    game.debug.body(bullet);
  //  });
  //
  //  this.enemyPool.forEach(function (enemy) {
  //    game.debug.body(enemy);
  //  });
  //
  //  this.game.debug.body(this.player);
  //},

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
