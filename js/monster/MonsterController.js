class MonsterController {
    constructor(scene, player) {
        this.scene = scene;
        this.monstersGroup = scene.physics.add.group(); // 몬스터 그룹 생성
        this.missilesGroup = scene.physics.add.group(); // 미사일 그룹생성
        this.expBeadsGroup = scene.physics.add.group(); // 경험치 그룹생성
        this.bonusBoxGroup = scene.physics.add.group(); // 상자 그룹생성
        this.monsterTimer = 0;
        this.spawnDelay = this.calculateSpawnDelay(this.stageNum); // stage마다 줄어드는 스폰 딜레이
        this.circlePatternTimer = 0; //몬스터 원형 패턴
        this.player = player;
        this.stageNum = 1;
        this.monsterRatio = this.calculateMonsterRatios(this.stageNum); // stage배율 받는 몬스터 스폰 로직
        this.stageMonster = this.calculateTotalMonsters(this.stageNum); //stage마다 증가하는 몬스터 수
        this.monsterCounts = [0,0,0];
        this.nowMonsterNum = 0;
        this.stateMonsterLevel = 0;
        //this.createBoss();

        this.divisions = 4; // 맵을 4x4로 분할한다고 가정

        this.setupCollisions();

        this.lastPlayerPosition = { x: null, y: null };

        // 이미 나온 보스의 타입을 저장하는 배열
        this.spawnedBossTypes = [];

        // 보스의 타입 목록
        this.bossTypes = ['metalNight', 'eggMan'];
    }

    // 스테이지 몬스터 소환 딜레이
    calculateSpawnDelay(stageNum) {
        const baseDelay = 1000; // 기본 주기: 1000밀리초
        const reductionPerFiveStages = 100; // 5 스테이지마다 줄어드는 시간: 100밀리초
        const decrement = Math.floor((stageNum - 1) / 5) * reductionPerFiveStages;
    
        return Math.max(baseDelay - decrement, 500); // 최소 주기는 500밀리초로 설정
    }

    //스테이지 마다 몬스터 수
    calculateTotalMonsters(stageNum) {
        const baseMonsters = 100;
        const increasePerFiveStages = 50;
        const incrementCount = Math.floor((stageNum - 1) / 5);

        return baseMonsters + (incrementCount * increasePerFiveStages);
    }

    //스테이지 몬스터 비율
    calculateMonsterRatios(stageNum) {
        let baseRatio = [6, 3, 1]; // 초기 비율 설정
        const incrementCount = Math.floor((stageNum - 1) / 5);
    
        // 레벨 1 몬스터 비율 감소: 0.5씩
        baseRatio[0] -= incrementCount * 0.5;
        // 레벨 2 몬스터 비율 증가: 0.3씩
        baseRatio[1] += incrementCount * 0.3;
        // 레벨 3 몬스터 비율 증가: 0.2씩
        baseRatio[2] += incrementCount * 0.2;
    
        // 비율이 음수가 되지 않도록 보정
        baseRatio = baseRatio.map(x => Math.max(x, 0));
        let total = baseRatio.reduce((a, b) => a + b, 0);
        // 총합을 10으로 조정하여 비율을 유지
        return baseRatio.map(x => x / total * 10);
    }
    

    
    getRandomSpawnPosition() {
        this.mapWidth = this.scene.game.imageWidth;
        this.mapHeight = this.scene.game.imageHeight;
        
        // 사분할된 영역 중 하나를 랜덤하게 선택
        const divisionWidth = this.mapWidth / this.divisions;
        const divisionHeight = this.mapHeight / this.divisions;
        const randomDivisionX = Phaser.Math.Between(0, this.divisions - 1);
        const randomDivisionY = Phaser.Math.Between(0, this.divisions - 1);

        // 선택된 분할 영역 내에서 랜덤 위치 생성
        const posX = Phaser.Math.Between(
            randomDivisionX * divisionWidth,
            (randomDivisionX + 1) * divisionWidth
        );
        const posY = Phaser.Math.Between(
            randomDivisionY * divisionHeight,
            (randomDivisionY + 1) * divisionHeight
        );

        return { x: posX, y: posY };
    }


    isInMapBounds(x, y) {
        return x >= 0 && x <= this.mapWidth && y >= 0 && y <= this.mapHeight;
    }

    createCirclePatternMonster() {
        const centerX = this.player.x;
        const centerY = this.player.y;
        const spawnKey= "Lv1_0001";
        let radius = 400; // 기본 원의 반지름
        let monstersCount = 10; // 생성할 몬스터의 수
    
        if (this.lastPlayerPosition.x === centerX && this.lastPlayerPosition.y === centerY) {
            monstersCount = Phaser.Math.Between(10,30);
            radius = Phaser.Math.Between(200, 500); // 반지름을 100에서 400 사이로 랜덤 조정
        }

        // 플레이어 위치가 맵 가장자리에 가까울 경우 원의 반지름 조정
        const edgeThreshold = 50; // 가장자리로부터의 거리 임계값
        const minRadius = 100; // 최소 반지름
    
        // 가장자리 확인 및 반지름 조정
        if (centerX < edgeThreshold || centerX > this.mapWidth - edgeThreshold ||
            centerY < edgeThreshold || centerY > this.mapHeight - edgeThreshold) {
            radius = minRadius; // 원의 반지름을 최소로 조정
        }
    
        
        for (let i = 0; i < monstersCount; i++) {
            const angle = (i / monstersCount) * 2 * Math.PI;
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);
    
            // 몬스터가 맵 밖으로 나가지 않도록 조정
            x = Phaser.Math.Clamp(x, 50, this.mapWidth-50);
            y = Phaser.Math.Clamp(y, 50, this.mapHeight-50);
    
            this.spawnMonster(x, y,spawnKey,3);
        }

        this.lastPlayerPosition.x = centerX;
        this.lastPlayerPosition.y = centerY;
    }
    
    


    //박쥐 패턴으로 수정예정
    /*
    createCirclePatternMonster() {
        const centers = this.getMapDivisionsCenters();
        const centerIndex = Math.floor(Math.random() * centers.length);
        const center = centers[centerIndex];

        const radius = 100; // 원의 반지름을 작게 조정하여 플레이어 주변에서만 생성
        const monstersCount = 10; // 생성할 몬스터의 수

        for (let i = 0; i < monstersCount; i++) {
            const angle = (i / monstersCount) * 2 * Math.PI;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);

            this.spawnMonster(x, y);
        }
    }
    */

    setupCollisions() {
        // 몬스터 그룹 내에서의 충돌 처리를 설정합니다.
        this.scene.physics.add.collider(this.monstersGroup, this.monstersGroup, (monsterA, monsterB) => {
            // 충돌 처리 로직
            // 예시로, 각 몬스터에 대해 handleCollision 메서드를 호출합니다.
            if (monsterA.handleCollision) monsterA.handleCollision();
            if (monsterB.handleCollision) monsterB.handleCollision();
        });
    }

    spawnMonster(x, y,spawnKey,speed) {
        const monsterInfo = this.getMonsterInfoBySpriteKey(spawnKey);
        monsterInfo.speed = speed;

        this.scene.masterController.effectController.playEffectAnimation(x,y,'effect');
        const monster = new Monster(this.scene, x, y, monsterInfo, this.player); // 항상 0001 유형의 몬스터 생성
        this.monstersGroup.add(monster);
        this.scene.physics.add.collider(this.monstersGroup, monster);

    }

    // 몬스터 생성 메서드
    createMonster() {
        const totalMonsters = this.stageMonster; // 스테이지별 총 몬스터 수
        const ratio = this.monsterRatio; // 레벨별 생성 비율
        let targetCounts = ratio.map(r => Math.floor(totalMonsters * (r / ratio.reduce((a, b) => a + b))));
    
        if (this.nowMonsterNum >= totalMonsters) return; // 모든 몬스터가 생성되면 종료
    
        // 레벨 선택을 위한 무작위 로직
        let cumulativeRatio = 0;
        let randomThreshold = Math.random() * ratio.reduce((a, b) => a + b, 0);
        let selectedLevel = 0;
        for (let i = 0; i < ratio.length; i++) {
            cumulativeRatio += ratio[i];
            if (randomThreshold < cumulativeRatio) {
                selectedLevel = i;
                break;
            }
        }
    
        // 선택된 레벨에 해당하는 몬스터 수가 목표를 초과하지 않았는지 확인
        if (this.monsterCounts[selectedLevel] >= targetCounts[selectedLevel]) return;

        const { x: posX, y: posY } = this.getRandomSpawnPosition();
        const monsterInfo = this.getMonsterInfoByLevel(selectedLevel);
    
        setTimeout(() => {
            this.scene.masterController.effectController.playEffectAnimation(posX,posY,'effect');
            const monster = new Monster(this.scene, posX, posY, monsterInfo, this.player);
            this.monstersGroup.add(monster);
            this.scene.physics.add.collider(this.monstersGroup, monster);
            this.nowMonsterNum++;
        }, this.spawnDelay);
    }

    getMonsterInfoByLevel(level) {
        const allMonstersData = this.scene.cache.json.get('monsterData');
        const levelMonsters = Object.values(allMonstersData).filter(monster => monster.level === level+1);
        
        const pickedMonster = Phaser.Math.RND.pick(levelMonsters);
        return pickedMonster;
    }

    getMonsterInfoBySpriteKey(spriteKey) {
        const allMonstersData = this.scene.cache.json.get('monsterData');
        const monsterInfo = allMonstersData[spriteKey];
        return monsterInfo;
    }
    
    
    
    
    

    update() {
        this.circlePatternTimer++;

        if (this.monsterTimer > 60) {
            this.monsterTimer = 0;
            this.createMonster(); // 몬스터 추가
        }
        //4초마다 원형 패턴 몬스터 생성
        if (this.circlePatternTimer > 240) {
            this.circlePatternTimer = 0;
            if(this.stageNum == 5){
                this.createCirclePatternMonster(); // 원형 패턴 몬스터 생성
            }
        }

        // 몬스터 그룹의 몬스터들을 갱신합니다.
        this.monstersGroup.children.each(monster => {
            monster.update();
        });


        this.expBeadsGroup.children.each(expBead => {
            expBead.update();
        });
        this.bonusBoxGroup.children.each(bonusBox => {
            bonusBox.update();
        });


        this.monsterTimer++;
    }

    updateStage(stageNum) {
        this.stageNum = stageNum;

        this.allMonsterDestroy();
        this.allMissileDestroy();
        this.allExpBeadDestroy();

        // 업데이트 되면 다음 스테이지로 넘어간거니 초기화
        this.stateMonsterLevel = 0;
    }

    createBoss() {
        let bossType;
        let boss=null;

        // 아직 나오지 않은 보스 타입을 무작위로 선택
        do {
            bossType = Phaser.Math.RND.pick(this.bossTypes);
        } while (this.spawnedBossTypes.includes(bossType));

        // 보스 객체 생성
        //bossType='metalNight';

        switch (bossType) {
            case 'metalNight':
                boss = new MetalNight(this.scene, 200, 200, this.player);
                break;
            case 'eggMan':
                boss = new EggMan(this.scene, 200, 200, this.player);
                break;
        }


        if (boss) {
            // 몬스터 그룹과 새로운 보스 간의 충돌 감지
            this.scene.physics.add.collider(this.monstersGroup, boss);

            // 생성된 보스를 그룹에 추가합니다.
            this.monstersGroup.add(boss);

            // 나온 보스의 숫자를 기록
            this.spawnedBossTypes.push(bossType);
        }

        return boss;
    }

    allMonsterDestroy() {
        this.monstersGroup.clear(true, true);
        
    }

    allMissileDestroy() {
        // 미사일 그룹 만들어주세용
        this.missilesGroup.clear(true, true);
    }

    allExpBeadDestroy(){

        // 이게 개수인데 아직은 경험치가 1짜리인것만 있으므로 1* exp 개수
        let exp = this.expBeadsGroup.getChildren().length;

        this.expBeadsGroup.clear(true, true);

        let box = this.bonusBoxGroup.getChildren().length;

        this.bonusBoxGroup.clear(true, true);

        // 받아온 경험치 구슬 그룹 수를 반환한거 가지고 계산 전체 exp 전달
        this.scene.masterController.characterController.characterStatus.getExp(exp);
  
    }

    //위치 받기용 추가 함수
    getMonsters() {
        return this.monstersGroup;
    }

}