class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'bossSprite');
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

        //추가
        this.damageTimers = Array(6).fill(0);
        
    }

    createTrail() {

        // 보스가 이미 파괴되었다면 작업을 수행하지 않습니다.
        if (this.destroyed) {
            return;
        }


        const trail = this.scene.add.sprite(this.x, this.y, 'bossSprite');
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
        this.trailTimer.destroy();
    }

    setupAnimations() {
        const animation = this.scene.anims.get('walk_boss');

        if (!animation) {
            this.scene.anims.create({
                key: 'walk_boss',
                frames: [
                    { key: 'bossSprite', frame: 0 },
                    { key: 'bossSprite', frame: 6 },
                ],
                frameRate: 3,
                repeat: -1
            });

        }
        this.play('walk_boss');
    }

    fireMissile() {
        const numMissiles = 25; // 발사할 미사일의 수
        const angleIncrement = 360/numMissiles;
        const fireNum = 4;
    
        const mapWidth = this.scene.game.config.width;
        const mapHeight = this.scene.game.config.height;
    
        for (let j = 0; j < fireNum; j++) {
            let centerX = Phaser.Math.Between(0, mapWidth);
            let centerY = Phaser.Math.Between(0, mapHeight);
    
            for (let i = 0; i < numMissiles; i++) {
                const angle = i * angleIncrement;
                const missile = new Missile(this.scene, centerX, centerY, 'bossMissile');
                missile.fire(centerX, centerY, angle);
            }
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
                const missile = new Missile(this.scene, 0, 0, 'bossMissile');
                missile.fire(missileX, 70, 90); // 직각으로 아래로 발사되도록 각도를 90도로 설정
            } else {
                // 비어있는 공간에는 미사일을 발사하지 않음
            }
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
                        this.fireStraightMissiles();
                        break;
                    case 1:
                        this.speed = 200;
                        this.startTrail();
                        break;
                    case 2:
                        this.fireMissile();
                        break;

                    
                }
                
            }

        }
    }

    hit(damage, weaponIndex, absorption) {
        let update = this.nowHealth - damage;

        /////////////추가
        const currentTime = this.scene.time.now;
        if(weaponIndex !== undefined){
            // 무기별 타이머를 확인하여 일정 기간 동안 같은 무기로부터 데미지를 입지 않도록 함
            if (currentTime < this.damageTimers[weaponIndex]) {
                  return; // 현재 시간이 이전 데미지 타이머 내에 있는 경우 바로 반환
            }

              // 무기 인덱스별 타이머 갱신 (예: 1000ms 동안 같은 무기로부터 데미지를 받지 않도록 설정)
            this.damageTimers[weaponIndex] = currentTime + 300;
        }

        if (Math.floor(Math.random() * 100) + 1 <= absorption) {
            this.scene.masterController.characterController.characterStatus.absorptionHealth();
        }
        /////////////

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