import { EnemyEngine } from "./enemy-engine.js";
import { PlayMaker } from "./play-maker.js";

export class MediumEnemyEngine extends EnemyEngine {
    constructor(model) {
        super(model);
    }


    getPlay() {
        let play = PlayMaker.minimax(this._model, 2);
        console.log("PC's play: " + play);
        return play;
    }
}