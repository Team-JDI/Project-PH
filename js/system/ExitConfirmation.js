class ExitConfirmation extends Phaser.Scene {
    constructor() {
        super('ExitConfirmation');
    }

    create(data) {
        const player = data.player;

        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        overlay.setOrigin(0);

        const warningText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'Are you sure you want to exit the game?', { fill: '#ffffff', fontSize: 24 });
        warningText.setOrigin(0.5);

        const yesButton = this.add.text(this.cameras.main.width / 2 - 100, this.cameras.main.height / 2 + 50, 'Yes', { fill: '#ffffff', fontSize: 24 });
        yesButton.setOrigin(0.5).setInteractive();

        yesButton.on('pointerdown', () => {
            // 캐릭터 초기화

            player.destroy();
            this.scene.stop('StageSuperMario');
            this.scene.stop('PauseMenu');
            this.scene.stop('ExitConfirmation');
            this.scene.start('MainMenu');
        });
        
        const noButton = this.add.text(this.cameras.main.width / 2 + 100, this.cameras.main.height / 2 + 50, 'No', { fill: '#ffffff', fontSize: 24 });
        noButton.setOrigin(0.5).setInteractive();

        noButton.on('pointerdown', () => {
            this.scene.stop('ExitConfirmation');
            this.scene.resume('PauseMenu');
        });
    }
}
