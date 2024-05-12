class WeaponMissile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, weapon, permeation){
        super(scene, x, y, weapon.missileName);
        this.sceneData = scene;

        this.weapon = weapon;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(weapon.missileScale); //미사일 크기

        this.speed = weapon.missileSpeed; //미사일 속도

        this.permeation = permeation; //관통 갯수
        this.permeationCount = 0; // 현재 충돌수

    }

    fire(x, y, angle, weaponDamage){
        this.setPosition(x, y);
        this.setRotation(angle);
        this.setVelocityX(Math.cos(angle) * this.speed);
        this.setVelocityY(Math.sin(angle) * this.speed);

        const monsters = this.scene.masterController.monsterController.getMonsters();

        let byTypeCheckCollision;

        if(this.weapon.type == 'rifle' || this.weapon.type == 'sniper' || this.weapon.type == 'shotgun' || this.weapon.type == 'artillery'){
            byTypeCheckCollision = (missile, monster) => this.checkCollisionJustMissile(missile, monster, weaponDamage);
        }else if(this.weapon.type == 'artillery-fire'){
            byTypeCheckCollision = (missile, monster) => this.checkCollisionArtillery(missile, monster, weaponDamage);
        }else if(this.weapon.type == 'artillery-bomb'){
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

        if(this.permeationCount == this.permeation){
            missile.destroy();
        }
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
        this.permeationCount++;
    }

    // 무기가 몬스터 때리기
    checkCollisionJustMissile(missile, monster, damage) {
        if(Math.floor(Math.random() * 100) + 1 <= this.weapon.critical){
            monster.hit(2 * damage, undefined, this.weapon.absorption);
        }else{
            monster.hit(damage, undefined, this.weapon.absorption);
        }

        this.permeationCount++;

        if(this.permeationCount == this.permeation){
            missile.destroy();
        }
        
    }

    //일반 중화기
    checkCollisionArtilleryFire(missile, monster, damage){

    }

    
}