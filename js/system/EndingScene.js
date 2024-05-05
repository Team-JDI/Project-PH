// EndingScene.js

class EndingScene extends Phaser.Scene {
    constructor(character) {
        super('EndingScene');

        this.characterData = character;
        this.bgm;
    }

    preload() {
        this.load.audio('endingBGM', 'assets/sounds/endingBGM.mp3');
        this.load.image('bleeding', 'assets/effects/blooding.png');
    }

    create(data) { 
        const characterStatus = data.characterStatus;
        const weapons = data.weapons;

        const gameWidth = game.config.width;
        const gameHeight = game.config.height;

        const fadeRect = this.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000);
        fadeRect.setOrigin(0, 0);
        fadeRect.alpha = 0;

        this.tweens.add({
            targets: fadeRect,
            alpha: 1, 
            duration: 5000,
            onComplete: () => {
                // DEFEAT에서 피가 뚝뚝 떨어지는 애니메이션 실행하고 싶다
                this.showEndingText(characterStatus, weapons);

                this.input.on('pointerdown', () =>{
                    this.scene.stop();
                    this.scene.stop('StageSuperMario');
                    this.scene.start('Loading');
                    this.bgm.stop();
                })
            }
        });

        const defeatText = this.add.text(
            gameWidth / 2,
            gameHeight * 1/8,
            'DEFEAT',
            {
                fontFamily: 'Arial',
                fontSize: 130,
                color: '#ff0000',
                align: 'center',
                padding: {
                    top: 10,
                    bottom: 10,
                },
            }
        );

        defeatText.setOrigin(0.5);

        this.time.addEvent({
            delay: 2600,
            callback: () => {
                const bloodDrop = this.add.sprite(defeatText.x * 1.45, defeatText.y, 'bleeding');
                bloodDrop.setOrigin(0.5, 0);
                bloodDrop.setScale(0.2, 0.2);
                
                this.tweens.add({
                    targets: bloodDrop,
                    y: bloodDrop.y + 50, // 아예 밑으로 떨어지게 할까 고민중..
                    alpha: 0,
                    duration: 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        bloodDrop.destroy();
                    }
                });
            },
            repeat: -1
        });

         // 사운드
         this.bgm = this.sound.add('endingBGM', { loop: true, volume: 0.3, rate: 0.5});
         this.bgm.play();
    }

    showEndingText(characterStatus, weapons) {
        const gameWidth = game.config.width;
        const gameHeight = game.config.height;

        const statsPanel = this.add.container(gameWidth * 0.65, gameHeight * 0.2 ); // 오른쪽 영역
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
 
         playerStats.forEach((stat, index) => {
             const text = this.add.text(0, index * 30, stat, { fill: '#ffffff', fontSize:24 });
             statsPanel.add(text);
         });

        const equipmentPanel = this.add.container(gameWidth * 0.15, gameHeight * 0.28 ); // 왼쪽 영역
        const weaponSlots = []; // 무기 영역

        // 무기 슬롯 생성
        const maxWeaponSlots = characterStatus.maxEquipment;
        const slotWidth = 80;
        const slotHeight = 80;

        for (let i = 0; i < maxWeaponSlots; i++) {
            const x = (i % 5) * 90;
            const y = Math.floor(i / 5) * 90;
            
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

        const clickToContinue = this.add.text(
            gameWidth / 2,
            gameHeight * 0.88,
            'Click To Continue',
            {
                fontFamily: 'Arial',
                fontSize: 45,
                color: '#ff0000',
                align: 'center',
                padding: {
                    top: 10,
                    bottom: 10,
                },
            }
        );
        clickToContinue.setOrigin(0.5);

        this.tweens.add({
            targets: clickToContinue,
            alpha: 0,
            duration: 800,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        })

        
        
    }
}
