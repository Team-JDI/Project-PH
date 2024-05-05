class SoundController {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // 효과음 파일 로드
        this.scene.load.audio('swordeffect', 'assets/sounds/SwordSound.mp3');

        this.scene.load.audio('sniperSound', 'assets/sounds/sniperSound.mp3');
        this.scene.load.audio('machineGunSound', 'assets/sounds/machineGunSound.mp3');
        this.scene.load.audio('assualtRifleSound', 'assets/sounds/assualtRifleSound.mp3');
        this.scene.load.audio('rocketLauncherFireSound', 'assets/sounds/rocketLauncherFireSound.mp3');
        this.scene.load.audio('expAcquisition', 'assets/sounds/expAcquisition.mp3');
        this.scene.load.audio('characterHit', 'assets/sounds/characterHit.mp3');
        this.scene.load.audio('levelUpSound', 'assets/sounds/levelUpSound.mp3');
    }

    // volume 0~1, rate 기본이 1  0~2
    // playEffectSound(soundName, volume, rate)
    playEffectSound(soundName) {
        // 효과음 플레이어 생성 및 사운드 추가
        const effectSound = this.scene.sound.add(soundName);

        // 임의 조정했습니다.
        effectSound.setVolume(0.25);
        effectSound.setRate(2);

        // 효과음 재생
        effectSound.play();
    }
}