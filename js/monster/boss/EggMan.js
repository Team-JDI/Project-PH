class EggMan extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'eggMan');
        this.scene = scene;
        this.player = player;
        scene.add.existing(this);
        this.setupAnimations();
        this.maxHealth = 35000;
        this.nowHealth = this.maxHealth;
        this.maxpattern = 3;
        this.speed = 100;
        this.pattern = 0;
        this.setScale(4);
        console.log('eggMan');
    }

    setupAnimations() {
        const animation = this.scene.anims.get('walk_boss');

        if (!animation) {
            this.scene.anims.create({
                key: 'walk_boss',
                frames: [
                    { key: 'eggMan', frame: 0 },
                    { key: 'eggMan', frame: 6 },
                ],
                frameRate: 3,
                repeat: -1
            });

        }
        this.play('walk_boss');
    }




    fireCrossMissiles() {
        // 크로스 미사일 발사
        const numMissiles = 5; // 발사할 미사일의 수
    
        // 발사 각도 배열
        const angles = [0, 90, 180, 270];
    
        // 몬스터의 현재 위치
        const monsterX = this.x;
        const monsterY = this.y;
    
        for (let i = 0; i < numMissiles; i++) {
            const angle = angles[i];
            const missile = new Missile(this.scene, monsterX, monsterY, 'EggMissile', 300);
            missile.fire(monsterX, monsterY, angle);
        }
    }


    update() {
        // 플레이어와 몬스터 사이의 거리를 계산합니다.
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 플레이어를 향해 천천히 이동합니다.
        this.setVelocity(dx / distance * this.speed, dy / distance * this.speed);

        // 일정 시간마다 미사일 발사
        if (this.scene.time.now > (this.nextFireTime || 0)) {

            this.nextFireTime = this.scene.time.now + Phaser.Math.Between(2000, 5000); // 미사일을 발사하는 간격 (3초 ~ 5초 사이)


            if(this.pattern >= 1){

                let  attack = Phaser.Math.Between(0, this.pattern);

                switch(attack){
                    case 0:
                        this.scene.masterController.monsterController.createCirclePatternMonster();
                        this.fireCrossMissiles();
                        break;
                    case 1:
                        
                        
                    case 2:
                        
                        break;

                    
                }
                
            }

        }
    }

    hit(damage) {
        let update = this.nowHealth - damage;
        if(update <= 0) {
           this.destroy();
        } else {
            this.nowHealth = update;
        }

        //패턴 배수
        const patternThreshold = 3;
        if (this.nowHealth > 0 && this.maxHealth*(this.maxpattern-this.pattern) / patternThreshold >= this.nowHealth) {
            this.pattern++; 
        }
    }
}