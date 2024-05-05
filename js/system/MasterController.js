class MasterController {
    constructor(scene, bgm) {
        this.playerManager;
        this.monsterController;
        this.characterController; //캐릭터 컨트롤러 - 김용우
        this.effectController; // 이팩트 컨트롤러 - 최재영
        this.soundController; // 사운드 컨트롤러 - 최재영
        this.gameDataManager;
        this.sceneData = scene;
        this.bgm = bgm;
        this.currentStage = 1;
        this.weaponController;
    }


    // Create의 데이터 상속
    init(characterName) {
        // 잘 넘어옴
        console.log(characterName);

        // 모두 평등하게 기본 칼 하나 지급, 근데 메가맨은 대체 알파 ㅇㅇ

        //무기 이미지 로드
        this.loadWeaponsData();

        let firstWeapon;

         // 로드가 완료되면 실행할 작업 설정
         this.sceneData.load.once('complete', () => {
            // 모든 이미지 로드 완료 후 실행할 코드(첫 무기 웨펀컨트롤러에 추가)
            switch(true){
                case characterName == 'megaman' :
                    firstWeapon = 'automaticRocketLauncher';
                    break;
                case characterName == 'link' :
                    firstWeapon = 'kar98';
                    break;
                case characterName == 'red' :
                    firstWeapon = 'automaticRocketLauncher';
                    break;
                case characterName == 'sonic' :
                    firstWeapon = 'kar98';
                    break;
                case characterName == 'bulletking' :
                    firstWeapon = 'kar98';
                    break;
                    case characterName == 'kirby' :
                    firstWeapon = 'kar98';
                    break;
            }
            
            
            this.setupAfterLoad(firstWeapon);
        });

        this.sceneData.load.start();

        //변수화 필요
        this.characterName = characterName || 'megaman';     
        //캐릭터 컨트롤러 생성
        this.characterController = new CharacterController(this.sceneData, this.characterName);
        //캐릭터 부여
        this.player = this.characterController.player;

        //캐릭터 위치 선정
        this.player.setPosition(game.config.width / 4, game.config.height / 2);

        this.monsterController = new MonsterController(this.sceneData, this.player);    

        //무기 컨트롤러 생성
        this.weaponController = new WeaponController(this.sceneData, this.player);

        //이펙트 컨트롤러 생성
        this.effectController = new EffectController(this.sceneData);
        
        //사운드 컨트롤러 생성
        this.soundController = new SoundController(this.sceneData);

        // 게임 관련된 정보 저장 - 몬스터 킬 수, 타이머 저장 등 ㅇㅇ
        this.gameDataManager = new GameDataManager();

        return this.player;
    }

    // 업데이트의 데이터 상속
    update() {
        this.characterController.update();
        this.monsterController.update();
        this.weaponController.update();
    }

    updateStage() {
        this.currentStage += 1;

        this.monsterController.updateStage(this.currentStage);
        // 그 다른 컨트롤러에서 업데이트에 필요한 부분 호출해서 업데이트 하기\
        
        //스테이지 종료시 총알 제거
        this.weaponController.allWeaponMissileDestroy();

    }

    //무기 이미지 로드
    loadWeaponsData() {
        const weaponsData = this.sceneData.cache.json.get('weaponData');
        for (const weaponKey in weaponsData) {
            const weapon = weaponsData[weaponKey];
            this.sceneData.load.image(weapon.name, weapon.path);
            if(weapon.missileName){
                this.sceneData.load.image(weapon.missileName, weapon.missilePath);
            }
        }
    }

    //첫무기를 웨펀컨트롤러에 추가
    setupAfterLoad(weaponName) {
        this.weaponController.addWeapon("automaticRocketLauncher", 1);
        this.weaponController.addWeapon("automaticRocketLauncher", 1);
        this.weaponController.addWeapon("justSword", 2);
        this.weaponController.addWeapon("rocketLancer", 2);
        this.weaponController.addWeapon("rocketLancer", 3);
        this.weaponController.addWeapon("rocketLancer", 3);
        this.weaponController.addWeapon("rocketLancer", 2);
    }

    getCharacterStatus() {
        return this.characterController.characterStatus.getCharacterStatus();
    }

    getWeapons() {
        return this.weaponController.getWeapons();
    }

    characterTakeDamage(damage) {
        let result = this.characterController.characterStatus.takeDamage(damage);

        if(result == 'gameOver') {
            this.gameOver();
        }
    }

    //이거는 CharacterStatus에서 패시브 배열 뽑아오기 ㅇㅇ
    getPassives() {
        return this.characterController.characterStatus.getPassives();
    }

    gameOver() {
        const weapons = this.getWeapons();
        const characterStatus = this.getCharacterStatus();

        // stop으로 진행하는것보다 launch로 해야 시작트윈스이벤트가 먹히는듯?

        

        this.sceneData.scene.pause('StageSuperMario');
        this.bgm.stop();
        this.sceneData.scene.launch('EndingScene', {
            weapons : weapons,
            characterStatus : characterStatus
        });
    }

    updateItem(data) {
        // data 받은거 passives.json의 타입을 passive라고 하고 나서
        // 해당 data.type == passive 라면 패시브로
        // 아니라면 전부 무기로 보내는데 지금 코드는 웨폰 이름이니까
        // 이름을 보내도록
        switch(true){
            case data.type == 'passive' :
                if(data.activate){
                    //this.characterController.characterStatus.updateStatus(data)
                }
                    this.characterController.characterStatus.updateStatus(data);
                break;
            default : this.weaponController.addWeapon(data.name);
            break;
        }
        //this.characterController.characterStatus.updateStatus(data);
    }



}