class MetalNight extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'metalNight');
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
        console.log('MetalNight');
        this.checkTrail =false;
    }

    createTrail() {

        // 보스가 이미 파괴되었다면 작업을 수행하지 않습니다.
        if (this.destroyed) {
            return;
        }


        const trail = this.scene.add.sprite(this.x, this.y, 'metalNight');
        trail.setAlpha(0.1); // 잔상의 투명도 설정
        trail.setScale(4);
        this.scene.tweens.add({
            targets: trail,
            alpha: { from: 0.5, to: 0 },
            duration: 1000, // 잔상이 사라지는 데 걸리는 시간 (밀리초)
            onComplete: () => trail.destroy(),
        });
    }

    startTrail() {

        this.checkTrail=true;
        // 잔상 생성을 시작하고, 100ms마다 createTrail 메서드를 호출하여 잔상을 생성합니다.
        this.trailTimer = this.scene.time.addEvent({
            delay: 100, // 잔상이 생성되는 시간 간격 (밀리초)
            callback: this.createTrail,
            callbackScope: this,
            loop: true,
        });

        // 일정 시간 후에 잔상 생성 중지
        this.scene.time.delayedCall(5000, this.stopTrail, [], this);
    }

    stopTrail() {
        // 잔상 생성 중지
        this.speed = 100;
        this.checkTrail=false;
        this.trailTimer.destroy();
    }

    setupAnimations() {
        const animation = this.scene.anims.get('walk_boss');

        if (!animation) {
            this.scene.anims.create({
                key: 'walk_boss',
                frames: [
                    { key: 'metalNight', frame: 0 },
                    { key: 'metalNight', frame: 6 },
                ],
                frameRate: 3,
                repeat: -1
            });

        }
        this.play('walk_boss');
    }


    fireMissileWithDelay() {
        // 미리 붉은색 투명한 원으로 표시합니다.
        const fireNum = 4;
        const mapWidth = this.scene.game.config.width;
        const mapHeight = this.scene.game.config.height;


        
        for (let j = 0; j < fireNum; j++) {
            let centerX = Phaser.Math.Between(0, mapWidth);
            let centerY = Phaser.Math.Between(0, mapHeight);
            
            const fireArea = this.scene.add.circle(centerX, centerY, 500, 0xFF0000, 0.2);


             // 원의 투명도를 감소시키는 트윈을 추가합니다.
            this.scene.tweens.add({
                targets: fireArea,
                alpha: { from: 0.2, to: 1 },
                duration: 2000, // 2초 동안 투명도를 감소시킵니다.
                onComplete: () => {
                    // 투명도가 감소된 후에 미사일을 발사합니다.
                    this.fireMissile(centerX,centerY);
                    // 원을 삭제합니다.
                    fireArea.destroy();
                }
            });

            //  // 일정 시간 후에 미사일을 발사합니다.
            // this.scene.time.delayedCall(2000, () => {
            //     this.fireMissile(centerX,centerY);
        
            //     // 원을 숨깁니다.
            //     fireArea.destroy();
            // });
         
        }
    
       
    }

    fireMissile(x,y) {
        const numMissiles = 25; // 발사할 미사일의 수
        const angleIncrement = 360/numMissiles;

        for (let i = 0; i < numMissiles; i++) {
            const angle = i * angleIncrement;
            const missile = new Missile(this.scene, x, y, 'bossMissile',300);
            missile.fire(x, y, angle);
        }
        
    }

    fireStraightMissiles() {
        const numMissiles = 25; // 전체 미사일 수
        const emptySpaceIndices = [];
    
        // 비어있는 공간의 인덱스를 4개 선택
        while (emptySpaceIndices.length < 4) {
            const index = Phaser.Math.Between(0, 9); // 0부터 9까지의 범위에서 선택
            if (!emptySpaceIndices.includes(index)) {
                emptySpaceIndices.push(index);
            }
        }
    
        const missileSpacing = 100; // 미사일 간격
    
        const sceneWidth = this.scene.game.config.width;
        const sceneHeight = this.scene.game.config.height;
    
        for (let i = 0; i < numMissiles; i++) {
            if (!emptySpaceIndices.includes(i)) {
                const missileX = i * missileSpacing + 100; // 각 미사일마다 다른 x 좌표를 사용하여 배치
                const missile = new Missile(this.scene, 0, 0, 'bossMissile',300);
                missile.fire(missileX, 70, 90); // 직각으로 아래로 발사되도록 각도를 90도로 설정
            } else {
                // 비어있는 공간에는 미사일을 발사하지 않음
            }
        }
    }

    teleport() {

        this.createTrail();
        // 보스를 무작위로 이동시킵니다.
        this.x = Phaser.Math.Between(this.player.x-500, this.player.x+500);
        this.y = Phaser.Math.Between(this.player.y-500, this.player.y+500);

        this.dash();
    }

    dash() {
        // 플레이어를 향해 돌진합니다.
       this.speed=1000;

        // 일정 시간 후에 돌진을 멈춥니다.
        this.scene.time.delayedCall(100, () => {
          this.speed=100;
        }, [], this);
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
                        this.teleport();
                        this.fireStraightMissiles();
                        this.fireMissileWithDelay();
                        break;
                    case 1:
                        this.speed = 200;
                        if(!this.checkTrail){
                            this.startTrail();
                        }
                        break;
                    case 2:
                        this.fireMissileWithDelay();
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