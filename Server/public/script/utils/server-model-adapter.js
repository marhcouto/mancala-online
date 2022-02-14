export class ServerModelAdapter {
    constructor(localNickName) {
        this.localNickName = localNickName;
    }

    update(serverModel, gameModel) {
        console.log(serverModel);
        let sideData = serverModel.sides;
        for (let objectName in sideData) {
            if (this.localNickName == objectName) {
                gameModel.setSeeds('seed-capture-house-right', sideData[objectName].store);
                for(let i = 0; i < sideData[objectName].pits.length; i++) {
                    gameModel.setSeeds(`seed-house-${i}`, sideData[objectName].pits[i]);
                }
            } else {
                gameModel.setSeeds('seed-capture-house-left', sideData[objectName].store);
                for(let i = sideData[objectName].pits.length; i < sideData[objectName].pits.length * 2; i++) {
                    gameModel.setSeeds(`seed-house-${i}`, sideData[objectName].pits[i - sideData[objectName].pits.length]);
                }
            }
        }
    }
}