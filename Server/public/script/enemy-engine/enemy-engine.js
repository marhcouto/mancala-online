export class EnemyEngine {
    constructor(model) {
        this._model = model;
    }

    getPlay() {
        throw new Error("Abstract method can't be called!");
    }
}