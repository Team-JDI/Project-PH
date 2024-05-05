/**
 * 게임 라운드 클래스
 */
class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
        this.bgm;
    }

    preload(){ // 사전설정
        //this.load.image('background', 'assets/background/mountine.png');
        this.load.image('mainBackground', 'assets/background/citypopBG.png');
        this.load.image('button', 'assets/buttons/blue_button.png');
        this.load.audio('joinSceneVoice', 'assets/sounds/pixelHeroseVoiceMechanick.mp3');
        this.load.audio('lobyBGM', 'assets/sounds/lobyBGM.mp3');
        
    }
    create(){ // 생성
        // 사운드
        this.bgm = this.sound.add('lobyBGM', { loop: true, volume: 0.3, rate: 1.25});
        this.bgm.play();


        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.joinSceneVoice = this.sound.add('joinSceneVoice', { loop: false, volume: 0.3});
        // 나중에 Loading.js 씬 완성하고 넘어온 후에 자연스러운 타이밍에 소리나도록
        // 예를들면 딜레이 0.5 정도 걸어서 화면이 눈에 보이고 소리 ㄱㄱ
        this.joinSceneVoice.play();
        
        let background = this.add.image(centerX, centerY, 'mainBackground');
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.title = this.add.text(
            centerX,
            this.cameras.main.height * 0.1,
            'Pixel Heroes'
        )
        .setFill('#f55a42')
        .setFontSize(100)
        .setOrigin(0.5)
        .setDepth(999)
        .setAlign('center');

        //console.log(this.cameras.main.height);
        // 여백 만들기
        const topMargin = this.cameras.main.height * 0.127;
        const bottomMargin = this.cameras.main.height * 0.127; 
        const availableHeight = this.cameras.main.height - topMargin - bottomMargin;

        // 버튼 생성 및 텍스트 추가 합쳤음
        const buttonLabels = ['Click to select', 'Options', 'Ranking', 'Developers'];
        const buttonCount = buttonLabels.length;
        const verticalSpacing = availableHeight / (buttonCount + 1);

        for (let i = 0; i < buttonCount; i++) {
            const button = this.add.image(
                centerX,
                topMargin + verticalSpacing * (i + 1),
                'button'
            ).setInteractive().setDepth(50);

            button.setScale(0.3, 0.2);

            const labelText = this.add.text(centerX, topMargin + verticalSpacing * (i + 1), buttonLabels[i])
                .setFill('#f55a42')
                .setDepth(999)
                .setOrigin(0.5)
                .setAlign('center')
                .setFontSize(30);

            button.on('pointerdown', () => {
                switch (i) {
                    case 0:
                        this.scene.start('CharacterSelect', { lobyBGM: this.bgm });
                        break;
                    case 1:
                        this.scene.start();
                        break;
                    case 2:
                        this.scene.start();
                        break;
                    case 3:
                        this.scene.start();
                        break;
                    default:
                        break;
                }
            });
        }



    }
    update(){ // 변경(갱신)

    }
}