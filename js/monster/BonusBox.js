class BonusBox extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x+Phaser.Math.Between(-5, 5), y+Phaser.Math.Between(-5, 5), 'bonusBox');
        
        this.scene = scene;
    
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.8);
        this.speed = 500;

        this.scene.physics.add.overlap(
            this, this.scene.player, // 충돌 대상
            this.checkCollision, // 충돌 처리 함수
            null, // 콜백 컨텍스트
            this // 호출 컨텍스트
        );

    
    }

    checkCollision(ExpBead, player) {
        ExpBead.scene.masterController.characterController.characterStatus.getExp(1);
        this.destroy();
    }

    update() {
        // 플레이어와 ExpBead 사이의 거리를 계산
        const dx = this.scene.player.x - this.x;
        const dy = this.scene.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 플레이어 쪽으로 일정한 속도로 이동
        const speed = 50; // 이동 속도 (조절 가능)

        //거리가 100이하  일때만 추적 시작
        if(distance <=50){
            this.setVelocity(dx / distance * speed, dy / distance * speed);
        }
    }
}