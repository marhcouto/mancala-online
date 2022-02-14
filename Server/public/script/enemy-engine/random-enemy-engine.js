import { EnemyEngine } from "./enemy-engine.js";

export class RandomEnemyEngine extends EnemyEngine {
    constructor(model) {
        super(model);
    }

    getPlay() {
        let validHouses = this._model.getValidPlays();
        let validHouseIdx = Math.floor(Math.random() * validHouses.length);
        console.log(validHouses[validHouseIdx]);
        return validHouses[validHouseIdx];
    }
}