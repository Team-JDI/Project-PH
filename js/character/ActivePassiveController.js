class ActivePassiveController{
    constructor(scene){
        this.scene = scene;
        this.activePassive = [];

        this.characterPlace = this.scene.masterController.player;
        this.characterInfo = this.scene.masterController.characterController.characterStatus;
        this.weaponsInfo = this.scene.masterController.weaponController;
        this.monstersInfo = this.scene.masterController.monsterController;

        this.mineGroup = this.scene.physics.add.group();
        this.totemGroup = this.scene.physics.add.group();

        
    }

    update(){
        this.activatePassive();
    }

    addPassive(data) {
        let checkItem = this.activePassive.find(item => item.itemName === data.name);
        if (checkItem) {
            checkItem.itemNum++;
        } else {
            this.activePassive.push({ itemName: data.name, itemNum: 1, activeTime: 0, coolDown: data.coolDown, imagePath : data.name});
        }
    }

    activatePassive(){
        for (let item of this.activePassive) {
            const currentTime = this.scene.time.now;
            if (currentTime >= item.activeTime + item.coolDown) {
                const activateMethod = item.itemName + 'Activate';
                this[activateMethod](item);
                item.activeTime = currentTime;
            }
        }
    }

    /* handActivate(item) {
        this.installMine(item);
    }

    bodyActivate(item) {
        this.installMine(item);
    }

    eyesActivate(item) {
        this.installMine(item);
    }

    footActivate(item) {
        this.installMine(item);
    } */

    //경험치 획득시 5 * 갯수 %로 체력 회복(회복 수치는 exp얻는곳에서 변경)
    edibleGemsActivate(item) {
        this.characterInfo.expRecovery[0] = true;
        this.characterInfo.expRecovery[1] = 5 * item.itemNum;
    }


    //탄환의 관통 수 증가
    permeationActivate(item) {
        if(this.weaponsInfo.permeation[0] == item.itemNum){
            return;
        }else{
            this.weaponsInfo.permeation[0]++;
            this.weaponsInfo.permeation[1]++;
        }
    }

    //체력 회복하는 패시브 아이템 구현 완료
    healingPackActivate(item) {
        if(this.characterInfo.nowHealth < this.characterInfo.maxHealth){
            this.characterInfo.nowHealth += 10 * item.itemNum;
            if(this.characterInfo.nowHealth > this.characterInfo.maxHealth){
                this.characterInfo.nowHealth = this.characterInfo.maxHealth;
            }
        }
    }


    //힐링 포탑
    healingTotemActivate(item){
        if(this.totemGroup.children.size < item.itemNum){
            for(let i = 0; i <item.itemNum; i++){
                const healingTotem = this.scene.add.image(Math.floor(Math.random() * 2001), Math.floor(Math.random() * 2001), item.imagePath);
                healingTotem.setScale(3);
                this.totemGroup.add(healingTotem);
                console.log(healingTotem.x, healingTotem.y);
            }
        }

        const playerInRange = this.totemGroup.getChildren().filter(totem => {
            const distance = Phaser.Math.Distance.Between(totem.x, totem.y, this.characterPlace.x, this.characterPlace.y);
            return distance <= 200;
        });
        
        if(playerInRange.length > 0 && (this.characterInfo.nowHealth < this.characterInfo.maxHealth)){
            this.characterInfo.nowHealth += playerInRange.length * 20;
            if(this.characterInfo.nowHealth > this.characterInfo.maxHealth) this.characterInfo.nowHealth = this.characterInfo.maxHealth;
        }
    }

    //모든 힐링 포탑 파괴
    allHealingTotemDestroy() {
        this.totemGroup.clear(true, true);
    }

    //지뢰 설치
    bombBallActivate(item){
        if(item.activeTime + item.coolDown < this.scene.time.now){
            for(let i = 0; i < item.itemNum; i++){
                const bombScale = 200;
                const mine = this.scene.add.image(Math.floor(Math.random() * (2201 - bombScale)) + bombScale, Math.floor(Math.random() * (2201 - bombScale)) + bombScale, item.imagePath);
                this.mineGroup.add(mine);

                this.scene.add.existing(mine);
                this.scene.physics.add.existing(mine);

                const monsters = this.monstersInfo.getMonsters();

                this.scene.physics.add.overlap(
                    mine, monsters,
                    (mine, monster) => this.checkCollision(mine, monster, bombScale, 4000),
                    null, // 처리할 추가적인 조건이 없으므로 null을 전달합니다.
                    mine // 콜백 함수 내에서 this가 미사일 객체를 참조하도록 합니다.
                );
            }
        }
    }

    checkCollision(mine, monster, bombScale, damage){
        const monsters = this.scene.masterController.monsterController.getMonsters();
        // 모든 몬스터를 순회하면서 폭발 범위 안에 있는 몬스터들을 찾음
        const inRangeMonster = monsters.getChildren().filter(monster => {
            const distance = Phaser.Math.Distance.Between(monster.x, monster.y, mine.x, mine.y);
            return distance <= bombScale;
        });

        // 범위 안 몬스터들에게 데미지 부여
        inRangeMonster.forEach(monster => {
            monster.hit(damage, undefined, 0);
        });

        this.scene.masterController.effectController.playEffectAnimation(mine.x, mine.y, "bombEffect");
        mine.destroy();
    }

    //모든 지뢰 파괴
    allMineDestroy() {
        this.mineGroup.clear(true, true);
    }

    //캐릭터를 기준으로 탄환을 발사 (6배수로 발사하며 발사쿨타임은 passives.json에 coolDown으로 조정)
    flyingBeadsActivate(item) {
        const weapon = {"missileName" : "알발사기", "missileScale" : 0.5, "missileSpeed" : 2000, "type" : "rifle", "damage" : this.characterInfo.power};

        const bulletNum = item.itemNum * 6;
        const angleStep = Phaser.Math.PI2 / bulletNum;
        for(let i = 0; i < bulletNum; i++){
            const weaponMissile = new WeaponMissile(this.scene, this.characterPlace.x, this.characterPlace.y, weapon, this.weaponsInfo.permeation[1]);

            //생성 후 미사일 그룹에 추가
            this.weaponsInfo.weaponMissilesGroup.add(weaponMissile);
            //발사
            weaponMissile.fire(this.characterPlace.x, this.characterPlace.y, angleStep + (angleStep * i), weapon.damage);
        }
    }


    //획득 경험치 배율 증가
    merchantActivate(item) {
        if(this.characterInfo.expRatio == item.itemNum + 1){
            return;
        }else{
            this.characterInfo.expRatio += item.itemNum;
        }
        
    }

    /* //몬스터가 죽은 위치에서 탄환을 6개 발사 숫자는 변경가능
    deadManSwitchActivate(position) {
        //내가 보유한 값중에 이 패시브 이름이 있다면 발동
        if (this.activePassive.some(item => item.itemName === 'deadManSwitch')) {
            const weapon = {"missileName" : item.imagePath, "missileScale" : 1, "missileSpeed" : 2000, "type" : "rifle", "damage" : 1};

            const bulletNum = 6;
            const angleStep = Phaser.Math.PI2 / bulletNum;
            for(let i = 0; i < bulletNum; i++){
                const weaponMissile = new WeaponMissile(this.scene, position.x, position.y, weapon, this.weaponsInfo.permeation[1]);

                //생성 후 미사일 그룹에 추가
                this.weaponsInfo.weaponMissilesGroup.add(weaponMissile);
                //발사
                weaponMissile.fire(position.x, position.y, angleStep + (angleStep * i), weapon.damage);
            }
        }
        //
        이건 몬스터.js에 destroyMonster에
        const position = { x: this.x, y: this.y };
        this.scene.masterController.activePassiveController.handActivate(position);
        추가해줘야 함
        ///
    } */




    /*
    //캐릭터 주위 일정 범위 안으로 들어오면 이속 저하 디버프
    gloomyDayActivate(item) {
        const radius = 300;

        const monsters = this.scene.masterController.monsterController.getMonsters();
        // 모든 몬스터를 순회하면서 디버프 범위 안에 있는 몬스터들을 찾음
        const inRangeMonster = monsters.getChildren().filter(monster => {
            const distance = Phaser.Math.Distance.Between(monster.x, monster.y, this.characterPlace.x, this.characterPlace.y);
            return distance <= radius;
        });

        // 범위 안 몬스터들에게 디버프 부여
        inRangeMonster.forEach(monster => {
            monster.debuff('slow', item.itemNum * 20);
        });
    }

    //몬스터에 debuff메소드 필요
    debuff(type, amount){
        switch(true){
        case type == "bleeding":
            const bleeding = setInterval(()=>{
            if(this.health - amount > 0){
                this.health -= amount;
            }else{
                this.health = 1;
            }
            }, 1000);

            setTimeout(()=>{
            clearInterval(bleeding);
            },3000);
            break;
        case type == "slow":
            this.speed -= amount;
            setTimeout(()=>{
            this.speed += amount;
            },3000)
        }
    }
    */


}

