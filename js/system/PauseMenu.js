class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
    }

    preload() {
        this.load.image('resumeButton', 'assets/buttons/stopButton.png');
    }

    create(data) {

        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        overlay.setOrigin(0);

        // 캐릭터 받아오기
        const player = data.player;
        const bgm = data.bgm;

        this.resumeBgm = this.sound.add('Game-selectBGM', {volume: 0.3});
        
        const characterStatus = data.characterStatus;
        const weapons = data.weapons;
        const passives = data.passives;

        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        const spacing = gameWidth * 0.09;

        // 장비창 디자인
        const equipmentPanel = this.add.container(gameWidth * 0.15, gameHeight * 0.2 ); // 왼쪽 영역
        const weaponSlots = []; // 무기 영역

        // 무기 슬롯 생성
        const maxWeaponSlots = characterStatus.maxEquipment;
        const slotWidth = 80;
        const slotHeight = 80;

        for (let i = 0; i < maxWeaponSlots; i++) {
            const x = (i % 5) * spacing;
            const y = Math.floor(i / 5) * spacing;
            
            if (i < weapons.length) {
                // 카구팔 기준으로 setOrigin(0.6)정도 해야 크기가 맞네.. ㅠ
                const weaponImage = this.add.image(x, y, weapons[i].name).setOrigin(0.6).setScale(0.5);
                equipmentPanel.add(weaponImage);
                weaponSlots.push(weaponImage);

                const imageWidth = weaponImage.width;
                const imageHeight = weaponImage.height;

                if (imageWidth > slotWidth || imageHeight > slotHeight) {
                    const scaleFactor = Math.min(slotWidth / imageWidth, slotHeight / imageHeight);
                    weaponImage.setScale(scaleFactor);
                } else {
                    weaponImage.displayWidth = slotWidth;
                    weaponImage.displayHeight = slotHeight;
                }
            } else {
                // weapons 배열에 무기가 없는 경우 사각형
                const rect = this.add.rectangle(x, y, slotWidth, slotHeight, 0xFFE4E1);
                equipmentPanel.add(rect);
                weaponSlots.push(rect);
            }
        }

        const passiveSlots = []; // 패시브 슬롯 배열
        
        let inter = 0;
        for(let key in passives) {
            const x = (inter % 5) * spacing;
            const y = (Math.floor(inter / 5) + 3) * spacing;

            const textPosition = spacing * 0.1;
            
            const value = passives[key];
            const passiveImage = this.add.image(x, y, key).setOrigin(0.6).setScale(0.5);
            const valueText = this.add.text(x+textPosition, y+textPosition, `x${value}`, { fill: '#000000'});


            equipmentPanel.add(passiveImage);
            equipmentPanel.add(valueText);
            passiveSlots.push(passiveImage);

            const imageWidth = passiveImage.width;
            const imageHeight = passiveImage.height;

            if (imageWidth > slotWidth || imageHeight > slotHeight) {
                const scaleFactor = Math.min(slotWidth / imageWidth, slotHeight / imageHeight);
                passiveImage.setScale(scaleFactor);
            } else {
                passiveImage.displayWidth = slotWidth; 
                passiveImage.displayHeight = slotHeight;
            }

            

            inter++
        }

         // 캐릭터 스탯 디자인
         const statsPanel = this.add.container(gameWidth * 0.65, gameHeight * 0.175 ); // 오른쪽 영역
         const playerStats = [
            `Level: ${characterStatus.level}`,
            `Experience: ${characterStatus.nowExperience}`,
            `MaxHealth: ${characterStatus.maxHealth}`,
            `NowHealth: ${characterStatus.nowHealth}`,
            `Speed: ${characterStatus.speed}`,
            `Attack Power: ${characterStatus.power}`,
            `Attack Speed: ${characterStatus.attackSpeed}`,
            `Range: ${characterStatus.range}`,
            `Critical: ${characterStatus.critical}`,
            `Avoidance: ${characterStatus.avoidance}`,
            `Defence: ${characterStatus.defence}`,
            `Max Equipment: ${characterStatus.maxEquipment}`,
            `Luck: ${characterStatus.luck}`,
            `Absorption: ${characterStatus.absorption}`
        ];

        const indexPosition = gameHeight * 0.034
 
         playerStats.forEach((stat, index) => {
             const text = this.add.text(0, index * indexPosition, stat, { fill: '#ffffff', fontSize:24 });
             statsPanel.add(text);
         });

        // 재개 버튼 추가
        const resumeButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - indexPosition, 'Resume', { fill: '#ffffff', fontSize: 30});
        resumeButton.setOrigin(0.5).setInteractive();
        resumeButton.on('pointerdown', () => {
            this.resumeBgm.play();

            this.scene.stop();
            this.scene.resume('StageSuperMario');
            bgm.resume();
        });

        // ESC 키 이벤트 수정
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeBgm.play();

            this.scene.stop();
            this.scene.resume('StageSuperMario');
            bgm.resume();
        });

        // 게임 종료 버튼 추가
        const exitButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height-indexPosition*2, 'Exit Game', { fill: '#ffffff', fontSize: 30 });
        exitButton.setOrigin(0.5).setInteractive();

        exitButton.on('pointerdown', () => {
            // 게임 종료 확인 다이얼로그 표시
            this.scene.pause('PauseMenu');
            this.scene.launch('ExitConfirmation', {player: player});
        });




    }

}