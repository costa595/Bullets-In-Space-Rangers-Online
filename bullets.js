var Bullet = function (game, key) {

    Phaser.Sprite.call(this, game, 0, 0, key);

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    this.anchor.set(0.5, 0.5);
    this.animations.add('fly');

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;

    this.tracking = false;
    this.scaleSpeed = 0;
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

//Выстреленная пуля
Bullet.prototype.fire = function (x, y, angle, speed) {

    this.reset(x, y);
    this.scale.set(2, 2);

    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

    this.angle = angle;
    this.play('fly', 40, false);

    return this;
};

//**********************

//Объект группы пушек с различными спрайтами и настройками
var BulletGroup = {};

//********************* ГРУППА БУЛИТА 1 ******************************

//Группа ОДИНОЧНОЙ пули
BulletGroup.firstBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'first', false, true, Phaser.Physics.ARCADE);

    this.bulletSpeed = 800;
    this.forEach(this.setOptions, this);

    for (var i = 0; i < 50; i++) {
        this.add(new Bullet(game, 'bullet21'), true);
    }

    return this;
};

module.exports = {

    bulletsArray: [],
    bulletsGroups: [],
    
    launchBullet: function(objectFromDamage) {

        var strayBullet;

        //если стреляю я
        if(objectFromDamage.attackerLogin == playerInfoObject.login) {

            strayBullet = this.bulletsGroups[objectFromDamage.gunSprite].fire(myShip);
            strayBullet.bulletDamage = objectFromDamage.damage;
            strayBullet.bulletTarget = objectFromDamage.targetLogin;
            this.bulletsArray.push(strayBullet);

        } else if(createdPlayers[objectFromDamage.attackerLogin] != null && createdPlayers[objectFromDamage.attackerLogin] != null) {// если стреляет кто-то другой

            strayBullet = this.bulletsGroups[objectFromDamage.gunSprite].fire(createdPlayers[objectFromDamage.attackerLogin].ship);
            strayBullet.bulletDamage = objectFromDamage.damage;
            strayBullet.bulletTarget = objectFromDamage.targetLogin;
            this.bulletsArray.push(strayBullet);
        }
    },

    makeBulletToFollowShip: function() {

        if(damageObject != null && this.bulletsArray != null) {

            for(var i = 0, len = this.bulletsArray.length; i < len; i++) {

                if(this.bulletsArray[i] != null) {

                    if(this.bulletsArray[i].bulletTarget == playerInfoObject.login) {
                    
                        game.physics.arcade.moveToXY(this.bulletsArray[i], myShip.x, myShip.y, this.bulletsGroups[damageObject.gunSprite].bulletSpeed);
                        this.bulletsArray[i].rotation = Math.atan2(myShip.y, myShip.x);
                        this.checkBulletDistanceToShip(myShip.x, myShip.y, playerInfoObject.race, i);

                    } else if(createdPlayers[this.bulletsArray[i].bulletTarget] != null) {

                        var enemyShip = createdPlayers[this.bulletsArray[i].bulletTarget].ship;

                        game.physics.arcade.moveToXY(this.bulletsArray[i], enemyShip.x, enemyShip.y, this.bulletsGroups[damageObject.gunSprite].bulletSpeed);
                        this.bulletsArray[i].rotation = Math.atan2(enemyShip.y, enemyShip.x);
                        this.checkBulletDistanceToShip(enemyShip.x, enemyShip.y, enemyShip.race, i);
                    }
                }
            }
        }
    },

    checkBulletDistanceToShip: function(shipX, shipY, race, bulletNum) {

        var distance = this.game.math.distance(this.bulletsArray[bulletNum].x, this.bulletsArray[bulletNum].y, shipX, shipY);

        var color = this.setRaceColour(race);

        if (distance < 25) { 

            this.createDamageText(shipX, shipY, this.bulletsArray[bulletNum].bulletDamage, this.bulletsArray[bulletNum].critical, color);
            this.bulletsArray[bulletNum].kill();
            this.bulletsArray.splice(bulletNum, 1);
        }
    },

    createDamageText: function(shipX, shipY, damage, critical, color) {

        var damageText;

        if(damageText != null) {
            damageText.destroy();
        }

        damageText = game.add.text(shipX - 15, shipY - 80, damage, {
                            font: ((critical == 0) ? '22px' : '30px')+ ' "Press Start 2P"',
                            fill: color,
                            stroke: '#000000',
                            strokeThickness: 3,
                            align: 'center'
                        });

        setTimeout(function() {
            damageText.destroy();
        }, 150);
    }
}
