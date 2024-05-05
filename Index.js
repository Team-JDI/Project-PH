
const config = {
    type:Phaser.AUTO,
    width:window.innerWidth,
    height:window.innerHeight,
    physics: { // 물리엔진
        default: 'arcade',
        arcade: {
            //debug:true, //디버깅 사용
        }
    },
    scale:{
        mode: Phaser.Scale.FIT, // 자동맞춤
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width:window.innerWidth,
        height:window.innerHeight,
    },
    

    // 장면 설정
    scene:[Loading, MainMenu, CharacterSelect, StageSuperMario, EndingScene, ItemSelectionScene, PauseMenu, ExitConfirmation]
}

const game = new Phaser.Game(config);