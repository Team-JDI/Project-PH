/**
 * 로딩화면 클래스
 */


class Loading extends Phaser.Scene {

    constructor(){
        super({ key: 'Loading'}); // 이 클래스 사용 시 식별자
    }

    preload(){ 
        this.load.image('loadingBackground', 'assets/background/retro_computer.png');
        this.load.audio('startBGM', 'assets/sounds/startUpSound.mp3');
    }
    create(){ 
        //
        const{x,y,width,height} = this.cameras.main;
        this.background = this.add.image(x + width/2, y + height/2, 'loadingBackground')
                            .setOrigin(0.5)

        const center = {
            x : x + width/2,
            y : y + height/2
        }

        this.title = this.add.text(
            center.x,
            height * 1/4,
            'Pixel Heroes'
        )
        .setFill('#f55a42')
        .setFontSize(100)
        .setOrigin(0.5)
        .setDepth(999)
        .setAlign('center')
        this.clickToStart = this.add.text(
            center.x,
            height * 3/4,
            'Click to start'
        )
        .setFill('#f55a42')
        .setFontSize(50)
        .setOrigin(0.5)
        .setDepth(999)
        .setAlign('center');

        this.tweens.add({
            targets: this.clickToStart,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        })

        // 사운드
        this.bgm = this.sound.add('startBGM', { loop: true, volume: 0.3, rate: 0.88});
        

        this.input.once('pointerdown', () => {
            this.bgm.play();
            let zoomLevel = 1;
        
            this.tweens.add({
                targets: this.cameras.main,
                duration: 0,
                zoom: 1000,
                ease: 'Linear',
                onUpdate: (tween) => {
                    const progress = tween.data[0].progress; // 0부터 1까지 도달하는.. 도달률? 이라고 보면 됨
                    const acceleration = 5;
                    const originSpeed = 1;
                    zoomLevel = originSpeed + (progress * acceleration + (acceleration * zoomLevel / 80));

                    this.cameras.main.setZoom(zoomLevel);
                    
                },
                onComplete: () => {
                    this.bgm.stop();

                    this.scene.transition({ target: 'MainMenu', duration: 800 });
                }
            });
        });

    }

    update(){ // 변경(갱신)

    }
}


