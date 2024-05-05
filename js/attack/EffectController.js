class EffectController{
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init(){
        this.scene.anims.create({
            key: 'effect',
            frames: this.scene.anims.generateFrameNumbers('effect', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'bombEffect',
            frames: this.scene.anims.generateFrameNumbers('bombEffect', { start: 0, end: 6 }),
            frameRate: 21,
            repeat: 0
        });
    }

    playEffectAnimation(x, y,effectName) {
        // 애니메이션을 재생할 스프라이트 생성
        const effectSprite = this.scene.add.sprite(x, y, effectName);
        
        // 애니메이션 설정
        effectSprite.anims.play(effectName);

        // 애니메이션 종료 후 제거
        effectSprite.once('animationcomplete', () => {
            effectSprite.destroy();
        });
    }

    activateLevelUp(){
        const emitter = this.scene.add.particles(0, -150, 'levelUp', { //stageSpuerMario에 이미지 랜더링 해놓음 - 원래는 
            frame: [1], // 만들어 놓은 것중 단 1 프레임만 가져옴 - > 
            follow : this.scene.masterController.player, // 캐릭터를 따라감
            maxAliveParticles : 1,  // 파티클이 몇개까지 겹쳐서 내보내는지
            lifespan : 10, // 파티클의 1프레임의 유지 길이
            duration: 1000 // 파티클의 유지 길이
        });
    }
}