class GameDataManager {
    constructor() {
        this.gameData = new GameData();
    }

    updateMonstersKilled() {
        this.gameData.monstersKilled++;
    }

    updatePlayTime(time) {
        this.gameData.playTime += time;
    }

    updateStageCount() {
        this.gameData.stageCount++;
    }

}