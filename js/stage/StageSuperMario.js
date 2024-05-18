
class StageSuperMario extends Phaser.Scene {
    constructor(data) {
        super('StageSuperMario');
        this.masterController;
        this.player;        
        this.stageTimer;
        this.stageDuration = 5; // 스테이지 지속 시간 (초)
        this.currentStage = 1;
        this.timerText;
        this.timer;

        this.healthBar;
        this.expBar;
        this.settlement = 0;    // 정산의 카운트;
        this.tickets = [];
        this.boss;
        this.bossTimer = 0;
        this.bossTimerText;

        this.bgm;
        this.pauseBgm;
        this.paused =false; //일시정지 유무
    }

    preload() {
        // 맵.. 일단 단일로 했음.
        this.load.image('space', 'assets/background/map/map13.png');
        // purple

        this.load.image('stopButton', 'assets/buttons/stopButton.png');

        this.load.image('ticket', 'assets/buttons/ticket2.png');


        // 미사일 몬스터 관련 이미지
        this.load.image('missile','assets/attack/attack.png');
        this.load.image('EggMissile','assets/attack/EggMissile.png');
        this.load.image('bossMissile','assets/attack/bossMissile.png');
        this.load.image('explosion', 'assets/effects/explosion.png');
        this.load.image('expBead', 'assets/attack/expBead.png');
        this.load.spritesheet('effect', 'assets/attack/effect.png',{ frameWidth: 22, frameHeight: 22 });
        this.load.spritesheet('bonusBox', 'assets/item/itemBox.png',{ frameWidth: 34, frameHeight: 46 });

        //Lv1
        this.load.spritesheet('Lv1_0001', 'assets/monster/마즈피플.png', {frameWidth: 72,frameHeight: 45});
        this.load.spritesheet('Lv1_0002', 'assets/monster/굼바(마리오).png', {frameWidth: 16,frameHeight: 16});
        this.load.spritesheet('Lv1_0003', 'assets/monster/메타르.png', {frameWidth: 17,frameHeight: 17});
        this.load.spritesheet('Lv1_0004', 'assets/monster/새.png', {frameWidth: 12,frameHeight: 12});


        //Lv2
        this.load.spritesheet('Lv2_0001', 'assets/monster/찐위들.png', {frameWidth: 30,frameHeight: 25});
        this.load.spritesheet('Lv2_0002', 'assets/monster/부.png', {frameWidth: 41,frameHeight: 61});
        this.load.spritesheet('Lv2_0003', 'assets/monster/치코보.png', {frameWidth: 32,frameHeight: 24});
        this.load.spritesheet('Lv2_0004', 'assets/monster/애벌레.png', {frameWidth: 45,frameHeight: 45});


        //Lv3
        this.load.spritesheet('Lv3_0001', 'assets/monster/쿵쿵.png', {frameWidth: 30,frameHeight: 32});
        this.load.spritesheet('Lv3_0002', 'assets/monster/애벌레뭉치.png', {frameWidth: 32,frameHeight: 26});


        this.load.json('monsterData', 'js/monster/monsterData.json');


       // 보스
       this.load.spritesheet('metalNight', 'assets/boss/보스(메타 나이트).png', {
            frameWidth: 49,
            frameHeight: 49
        });

        this.load.spritesheet('eggMan', 'assets/boss/eggMan.png', {
            frameWidth: 33,
            frameHeight: 32
        });

        //캐릭터 이미지
        this.load.spritesheet('megaman', 'assets/player/megaman.png', {frameWidth: 1056, frameHeight: 1056});
        this.load.spritesheet('link', 'assets/player/link.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('kirby', 'assets/player/kirby.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('red', 'assets/player/red.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('bulletking', 'assets/player/bulletking.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('sonic', 'assets/player/sonic.png', {frameWidth: 25, frameHeight: 40});

        //캐릭터 데이터
        this.load.json('characterData', 'js/character/character.json');

        //태그데이터
        this.load.json('tagData', 'js/character/tagOption.json');
        
        //무기데이터
        this.load.json('weaponData', 'js/character/weapon.json');
        this.load.image('bombBall', 'assets/weapon/총알/bombBall.png');
        this.load.image('healingTotem', 'assets/item/healingTotem.png');

        // 사운드
        this.load.audio('standardBGM', 'assets/sounds/SonicStageBGM.mp3');

        //무기 이펙트
        this.load.spritesheet('bombEffect', 'assets/effects/bombEffect.png',{frameWidth: 192, frameHeight: 192});
        this.load.spritesheet('levelUp', 'assets/effects/levelUp.png', {frameWidth: 120, frameHeight: 116});
    }

    create(data) {
        this.characterName = data.characterName;
        if(this.player){
            this.player.destroy();
        }
        this.player = null;

        // 사운드
        this.bgm = this.sound.add('standardBGM', { loop: true, volume: 0.3});
        this.bgm.play();

        this.pauseBgm = this.sound.add('Game-selectBGM', {volume: 0.3});

        this.masterController = new MasterController(this, this.bgm);

        this.load.image('space', 'assets/background/map/seeJustSpace.png');

        let image;

        this.load.once('complete', () => {
            image = this.add.image(50, 50, 'space').setOrigin(0);

            const desiredWidth = 2500;
            const desiredHeight = 2500;
            image.setScale(desiredWidth / image.width, desiredHeight / image.height);
            image.setDepth(-1);

            this.game.imageWidth = image.displayWidth;
            this.game.imageHeight = image.displayHeight;

            this.physics.world.setBounds(50, 50, image.displayWidth, image.displayHeight);

            // 캐릭터의 물리세계 여백의 2배만큼 띄어주면 오른쪽이랑 아래도 여백이 생김 ㅇㅇ
            this.cameras.main.setBounds(0, 0, image.displayWidth + 100, image.displayHeight + 100);

            this.cameras.main.on('cameraresize', () => {
                const positionNum = this.cameras.main.width * 0.029;
                pauseButton.setPosition(this.cameras.main.width - positionNum, positionNum);
            });
        });
        
        // 캐릭터 네임 보내기 // 이 씬 init에서 받아진 데이터임
        const selectedCharacterName = this.characterName;
        this.player = this.masterController.init(selectedCharacterName);

        
        this.load.start();

        this.player.setCollideWorldBounds(true); 
        this.cameras.main.startFollow(this.player);           

        // 일시정지 기능 / 버튼
        //const pauseButton = this.add.text(game.config.width - game.config.width / 10, 10, 'Pause', { fill: '#ffffff' });
        const positionNum = this.cameras.main.width * 0.029;
        const pauseButton = this.add.image(this.cameras.main.width - positionNum, positionNum,'stopButton');
        pauseButton.setOrigin(0.5).setInteractive().setScrollFactor(0);
        pauseButton.setDepth(10);

        pauseButton.displayHeight = this.cameras.main.width * 0.05;
        pauseButton.displayWidth = pauseButton.displayHeight;

        pauseButton.on('pointerdown', () => {
            const characterStatus = this.masterController.getCharacterStatus();
            const weapons = this.masterController.getWeapons();
            const passives = this.masterController.getPassives();

            this.pauseBgm.play();

            this.scene.launch('VictoryScene', { player:this.player, bgm:this.bgm, characterStatus: characterStatus, weapons:weapons, passives: passives});
            this.scene.pause();
            this.bgm.pause();
        });

        // ESC 키 이벤트 수정
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.scene.isPaused()) {
                const characterStatus = this.masterController.getCharacterStatus();
                const weapons = this.masterController.getWeapons();
                const passives = this.masterController.getPassives();

                this.pauseBgm.play();

                this.scene.launch('PauseMenu', { player:this.player, bgm:this.bgm, characterStatus: characterStatus, weapons:weapons, passives: passives});
                this.scene.pause();
                this.bgm.pause();
            }
        });

        this.timerText = this.add.text(game.config.width / 2, 16, '300초', { fontSize: '32px', fill: '#ffffff' })
        .setOrigin(0.5, 0) // 텍스트의 중앙을 x축 기준으로 설정
        .setScrollFactor(0);
        this.startItemSelectionScene();

        this.bossTimerText = this.add.text(game.config.width / 2, 16, `보스 : ${this.bossTimer} 초`, { fontSize: '32px', fill: '#ffffff' })
        .setOrigin(0.5, 0) // 텍스트의 중앙을 x축 기준으로 설정
        .setScrollFactor(0);
        this.bossTimerText.setVisible(false);


        // 체력 바 배경 설정
        this.healthBarBackground = this.add.graphics();
        this.healthBarBackground.fillStyle(0x000000, 0.2); // 투명한 검은색 배경
        this.healthBarBackground.fillRoundedRect(10, 10, 300, 20, 5); // 위치 조정 (Y축을 경험치 바보다 위로)
        this.healthBarBackground.lineStyle(2, 0xffffff, 1); // 하얀색 테두리 설정
        this.healthBarBackground.strokeRoundedRect(10, 10, 300, 20, 5); // 하얀색 테두리 추가
        this.healthBarBackground.setDepth(10);

        // 실제 체력 바 300이 max라고 보고 이쪽을 업데이트 해주면 됨
        this.healthBarFill = this.add.graphics();
        this.healthBarFill.fillStyle(0xff0000, 1); // 불투명한 빨간색
        this.healthBarFill.fillRoundedRect(10, 10, 300, 20, 5); // 체력 100% 상태
        this.healthBarFill.setDepth(10);

        // 경험치 바 배경 설정 (체력 바 코드 아래에 배치)
        this.expBarBackground = this.add.graphics();
        this.expBarBackground.fillStyle(0x000000, 0.2); // 투명한 검은색 배경
        this.expBarBackground.fillRoundedRect(10, 40, 300, 20, 5); // 위치, 크기, 둥근 모서리
        this.expBarBackground.lineStyle(2, 0xffffff, 1); // 하얀색 테두리 설정
        this.expBarBackground.strokeRoundedRect(10, 40, 300, 20, 5); // 하얀색 테두리 추가
        this.expBarBackground.setDepth(10);

        // 실제 경험치 바 300이 max라고 보고 이쪽을 업데이트 해주면 됨
        this.expBarFill = this.add.graphics();
        this.expBarFill.fillStyle(0x00ff00, 1); // 불투명한 초록색
        this.expBarFill.fillRoundedRect(10, 40, 0, 20, 5); // 초기 경험치 0%
        this.expBarFill.setDepth(10);

        this.healthText = this.add.text(160, 10, '', { fontSize: '16px', fill: '#ffffff' }).setScrollFactor(0);
        this.expText = this.add.text(160, 40, '', { fontSize: '16px', fill: '#ffffff' }).setScrollFactor(0);

        this.healthText.setDepth(11);
        this.expText.setDepth(11);

        // 체력 바와 경험치 바를 화면 상단에 고정
        this.healthBarBackground.setScrollFactor(0);
        this.healthBarFill.setScrollFactor(0);
        this.expBarBackground.setScrollFactor(0);
        this.expBarFill.setScrollFactor(0);


    }

    //cre 끝        // update 시작

    update() {
        // 이 부분 정상작동 체크
        if(!this.paused) {
            this.masterController.update();
        }

        this.updateTimerText(this.game.stageTimer.getRemainingSeconds());

        this.updateHealthAndExpText();
        this.updateHealthBar();
        this.updateExpBar();

        if(this.boss){
            this.updateBossHealthBar();
        } 
    }
    updateHealthAndExpText() {
        const characterStatus = this.masterController.getCharacterStatus();
    
        this.healthText.setText(`체력: ${characterStatus.nowHealth}/${characterStatus.maxHealth}`);
        this.expText.setText(`경험치: ${characterStatus.nowExperience}/${characterStatus.maxExperience}`);
    
        const healthBarCenterX = 10 + (300 / 2);
    
        const healthTextOffsetX = this.healthText.displayWidth / 2;
    
        this.healthText.setPosition(healthBarCenterX - healthTextOffsetX, 10);
    
        const expBarCenterX = 10 + (300 / 2);
    
        const expTextOffsetX = this.expText.displayWidth / 2;
    
        this.expText.setPosition(expBarCenterX - expTextOffsetX, 40);
    }

    updateHealthBar() {
        const characterStatus = this.masterController.getCharacterStatus();
        const healthRatio = characterStatus.nowHealth / characterStatus.maxHealth;
    
         // 전체 바의 너비(300)에서 비율을 곱하여 현재 체력에 해당하는 너비 계산
        const healthBarWidth = 300 * healthRatio;
        this.healthBarFill.clear();
        this.healthBarFill.fillStyle(0xff0000, 1);
        this.healthBarFill.fillRoundedRect(10, 10, healthBarWidth, 20, 5);
    }

    updateExpBar() {
        const characterStatus = this.masterController.getCharacterStatus();
        const expRatio = characterStatus.nowExperience / characterStatus.maxExperience;
    
        const expBarWidth = 300 * expRatio;
        this.expBarFill.clear();
        this.expBarFill.fillStyle(0x00ff00, 1);
        this.expBarFill.fillRoundedRect(10, 40, expBarWidth, 20, 5);
    }

    // 다음 스테이지가 보스인 경우를 제외한 나머지에 호출 == 보스가 죽었을 때도 기믹 시작
    startItemSelectionScene() {
        this.game.stageTimer = this.time.delayedCall(this.stageDuration * 1000, this.nextStageSelection, [], this);
    }

    nextStageSelection() {
        // 필요 없는 오브젝트 전부 제거 후
        this.masterController.updateStage();

        // 2초 뒤에 런치되도록 변경함
        this.time.delayedCall(2000, () => {
            this.clearTicket();
            this.currentStage ++;
            if(this.currentStage % 3 == 0) {
                this.startBossStage();
            } else {
                this.startNormalStage();
            }

        }, [], this);
    }

    // 다음 스테이지가 노말 스테이지인 경우 -> 타이머 세팅하고 아이템 셀렉션으로
    startNormalStage(){
        this.scene.pause();

        this.player.setPosition(this.game.imageWidth / 2, this.game.imageHeight / 2);

        this.game.stageTimer.paused = false;
        this.timerText.setVisible(true);
        if(this.bossTimerText && this.bossTimerText.visible) {
            this.bossTimerText.setVisible(false);
        } 

        const characterStatus = this.masterController.getCharacterStatus();
        const weapons = this.masterController.getWeapons();
        const passives = this.masterController.getPassives();

        this.startItemSelectionScene();

        this.game.selectionCount = this.settlement + 1;
        // 위에 담아놓고 초기화 다시 해버리기 ㅇㅇ
        this.settlement = 0;

        this.game.stageTimer.reset({
            delay: this.stageDuration * 1000,
            callback: this.nextStageSelection,
            args: [],
            callbackScope: this
        });

        this.scene.launch('ItemSelectionScene', { player: this.player, characterStatus : characterStatus, weapons:weapons, masterController: this.masterController, settlement : this.settlement, passives: passives});

    }

    // 다음 스테이지가 보스 스테이지인 경우 -> 보스 생성 및 체력 세팅하고 아이템 셀렉션으로
    startBossStage(){
        this.scene.pause();

        this.player.setPosition(this.game.imageWidth / 2, this.game.imageHeight / 2);

        this.timerText.setVisible(false);
        this.game.stageTimer.paused = true;

        const characterStatus = this.masterController.getCharacterStatus();
        const weapons = this.masterController.getWeapons();
        const passives = this.masterController.getPassives();

        this.scene.launch('ItemSelectionScene', { player: this.player, characterStatus : characterStatus, weapons:weapons, masterController: this.masterController, settlement : this.settlement, passives: passives});

        const boss = this.masterController.monsterController.createBoss();
        this.boss = boss;

        this.bossTimerText.setVisible(true);

        const bossCheck = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if(boss.active) {
                    console.log('살아있음')
                    this.bossTimer++;
                    this.bossTimerText.setText(`보스 : ${this.bossTimer} 초`).setOrigin(0.5, 0);
                } else {
                    console.log('죽음');

                    //this.bossTimer 를 GameData에 저장.. 이 후

                    this.bossTimerText.setVisible(false);
                    this.bossTimer = 0;

                    bossCheck.remove();
                    this.bossHealthBarBackground.destroy();
                    this.bossHealthBarFill.destroy();

                    this.nextStageSelection();
                }
            }
        });

        this.createBossHealthBar(boss);

    }

    createBossHealthBar(boss) {

        const widthX = 600;
        const heightY = 40;

        const positionX = (this.cameras.main.width - widthX) / 2;
        const positionY = this.cameras.main.height - heightY - 20;
        // 체력 바 배경 설정
        this.bossHealthBarBackground = this.add.graphics();
        this.bossHealthBarBackground.fillStyle(0x000000, 0.2);
        this.bossHealthBarBackground.fillRoundedRect(positionX, positionY, widthX, heightY, 5);
        this.bossHealthBarBackground.lineStyle(2, 0xffffff, 1);
        this.bossHealthBarBackground.strokeRoundedRect(positionX, positionY, widthX, heightY, 5);

        // 체력 바 설정
        this.bossHealthBarFill = this.add.graphics();
        this.bossHealthBarFill.fillStyle(0xff0000, 1);
        this.bossHealthBarFill.fillRoundedRect(positionX, positionY, widthX, heightY, 5);

        this.bossHealthBarBackground.setScrollFactor(0);
        this.bossHealthBarFill.setScrollFactor(0);

    }

    updateBossHealthBar() {
        if(!this.boss) {
            return;
        } else {
            const widthX = 600;
            const heightY = 40;

            const positionX = (this.cameras.main.width - widthX) / 2;
            const positionY = this.cameras.main.height - heightY - 20;
            // 체력 바 업데이트
            const fillWidth = this.boss.nowHealth * (widthX / this.boss.maxHealth);
            this.bossHealthBarFill.clear();
            this.bossHealthBarFill.fillStyle(0xff0000, 1);
            this.bossHealthBarFill.fillRoundedRect(positionX, positionY, fillWidth, heightY, 5);

        }
        
    }

    updateTimerText(seconds) {
        const totalSeconds = Math.floor(seconds); // 소수점 이하를 버림하여 정수로 만듦
        this.timerText.setText(`남은 시간 : ${totalSeconds + 1}`).setOrigin(0.5, 0); // 화면 상단 중앙에 위치
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
    
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    // 게임 일시정지 함수
    pauseGame() {
        this.scene.pause();
        this.paused = true;
        
        //standardBGM
        if(this.bgm) {
            this.bgm.pause();
        }

        // 일시정지 시 메뉴scene 여기 추가
    }

    // 게임 재개 함수
    resumeGame() {
        this.scene.resume();
        this.paused = false;

        if(this.bgm) {
            this.bgm.resume();
        }
    }

    //레벨업시 settlement업데이트
    updateSettlement(){
        this.settlement++;

        const positionYNum = this.cameras.main.width * 0.045;
        const positionXNum = this.cameras.main.width * 0.045;
        const xSet = this.settlement * (positionXNum);

        const ticket = this.add.image(this.cameras.main.width - xSet, positionYNum * 2,'ticket');
        ticket.setOrigin(0.5).setInteractive().setScrollFactor(0);
        ticket.setDepth(10);
        ticket.displayWidth = this.cameras.main.width * 0.05;
        ticket.displayHeight = ticket.displayWidth * 1.11;

        this.tickets.push(ticket);
        
    }

    clearTicket() {
        if(this.tickets.length > 0){
            for(let i = 0; i < this.tickets.length; i++) {
                this.tickets[i].destroy();
            }
            this.tickets = [];
        }
    }

}