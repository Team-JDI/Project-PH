class WeaponMissile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, weapon){
        super(scene, x, y, weapon.missileName);
        this.sceneData = scene;

        this.weapon = weapon;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(weapon.missileScale); //미사일 크기

        this.speed = weapon.missileSpeed; //미사일 속도

    }

    fire(x, y, angle, weaponDamage){
        this.setPosition(x, y);
        this.setRotation(angle);
        this.setVelocityX(Math.cos(angle) * this.speed);
        this.setVelocityY(Math.sin(angle) * this.speed);

        const monsters = this.scene.masterController.monsterController.getMonsters();

        let byTypeCheckCollision;

        if(this.weapon.type == 'rifle' || this.weapon.type == 'sniper' || this.weapon.type == 'shotgun'){
            byTypeCheckCollision = (missile, monster) => this.checkCollisionJustMissile(missile, monster, weaponDamage);
        }else if(this.weapon.type == 'artillery'){
            byTypeCheckCollision = (missile, monster) => this.checkCollisionArtillery(missile, monster, weaponDamage);
        }else if(this.weapon.type == 'artillery-bomb'){
            /* const targetX = x + Math.cos(angle) * this.weapon.range; // 최종 목표 x 위치
            const targetY = y + Math.sin(angle) * this.weapon.range; // 최종 목표 y 위치


            //충돌하지 않아도 해당지점에 도착하면 터질 수 있게 만듬
            this.scene.tweens.add({
                targets: this,
                x: targetX,
                y: targetY,
                duration: this.weapon.range / this.speed * 1000, // 이동 시간 계산
                onComplete: () => {
                    this.explodeMisiile(targetX, targetY, weaponDamage); // 이동 완료 후 폭발
                }
            }); */
            byTypeCheckCollision = (missile, monster) => this.checkCollisionBomb(missile, monster, weaponDamage);
        }


        this.scene.physics.add.overlap(
            this, monsters,
            (missile, monster) => byTypeCheckCollision(missile, monster, weaponDamage),
            null, // 처리할 추가적인 조건이 없으므로 null을 전달합니다.
            this // 콜백 함수 내에서 this가 미사일 객체를 참조하도록 합니다.
        );

        return this;
    }

    //폭발 중화기
    checkCollisionBomb(missile, monster, damage){
        this.explodeMissile(monster.x, monster.y, damage);
        this.sceneData.masterController.effectController.playEffectAnimation(monster.x, monster.y, "bombEffect");
        missile.destroy();
    }

    // x = 충돌한 몬스터의 x값, y = 충돌한 몬스터의 y 값
    explodeMissile(x, y, weaponDamage){
        // 모든 몬스터들을 가지고옴
        const monsters = this.scene.masterController.monsterController.getMonsters();
        // 모든 몬스터를 순회하면서 폭발 범위 안에 있는 몬스터들을 찾음
        const inRangeMonster = monsters.getChildren().filter(monster => {
            const distance = Phaser.Math.Distance.Between(monster.x, monster.y, x, y);
            return distance <= this.weapon.bombScale;
        });

        // 범위 안 몬스터들에게 데미지 부여
        inRangeMonster.forEach(monster => {
            if(Math.floor(Math.random() * 100) + 1 <= this.weapon.critical){
                monster.hit(2 * weaponDamage, undefined, this.weapon.absorption);
            }else{
                monster.hit(weaponDamage, undefined, this.weapon.absorption);
            }

        });

        

        /* // 파티클 이펙트 생성
        const particles = this.scene.add.particles('bombEffect');
        const emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 200
        });

        // 파티클 이펙트 위치 설정 및 발동
        emitter.setPosition(x, y);
        emitter.explode(20); */

        this.destroy(); // 미사일 객체 파괴
    }

    // 무기가 몬스터 때리기
    checkCollisionJustMissile(missile, monster, damage) {
        if(Math.floor(Math.random() * 100) + 1 <= this.weapon.critical){
            monster.hit(2 * damage, undefined, this.weapon.absorption);
        }else{
            monster.hit(damage, undefined, this.weapon.absorption);
        }
        missile.destroy();
    }

    //일반 중화기
    checkCollisionArtillery(missile, monster, damage){

    }

    
}