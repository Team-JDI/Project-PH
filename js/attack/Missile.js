class Missile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, spriteName) {
        super(scene, x, y, spriteName);
        // 생성자에서 this.scene 설정
        this.scene = scene;
    
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(1);
        
        // 미사일 속도
        this.speed = 500;

    }

    fire(x, y, angle) {
        this.setPosition(x, y);
        this.setRotation(Phaser.Math.DegToRad(angle));
        this.setVelocityX(Math.cos(Phaser.Math.DegToRad(angle)) * this.speed);
        this.setVelocityY(Math.sin(Phaser.Math.DegToRad(angle)) * this.speed);

        // 미사일과 대상의 충돌 설정
        this.scene.physics.add.overlap(
            this, this.scene.player, // 충돌 대상
            this.checkCollision, // 충돌 처리 함수
            null, // 콜백 컨텍스트
            this // 호출 컨텍스트
        );
    }

    checkCollision(missile, player) {

        this.scene.masterController.effectController.playEffectAnimation(missile.x,missile.y,'effect');
        this.scene.masterController.soundController.playEffectSound('swordeffect');
    
            
        // 플레이어 데미지 입히기
        missile.scene.masterController.characterController.characterStatus.takeDamage(10);
    
        // 미사일 제거
        missile.destroy();
    
        // 이후에 충돌 후 처리를 수행할 내용을 여기에 추가하세요.
    }
}