/*
    Abstract class that represents a Play Engine. It generates plays based on some strategy.
*/

export class EnemyEngine {
    constructor(model) {
        this._model = model;
    }

    getPlay() {
        throw new Error("Abstract method can't be called!");
    }
}