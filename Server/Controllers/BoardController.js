const { between } = require('../utils');

module.exports = class {
    constructor(model, loggedUser) {
        this.model = model;
        this.user = loggedUser;
    }

    checkTurn() {
        return (this.user == this.model.playerTurn);
    }

    /**
     * Converts the index of an house from 
     * client to server interpretation
     * 
     * @param {Int} house 
     * @returns 
     */
    convertHouse(house) {
        let newHouse = house;
        if (this.model.playerTurn == this.model.turns.PLAYER2) {
            newHouse = newHouse + this.model.numOfHouses;
        }
        return newHouse;
    }

    /**
     * Checks if a house is valid for play
     * 
     * @param {Int} house 
     * @returns 
     */
    validHouse(house) {
        if (!between(0, this.model.numOfHouses - 1, house)) {
            return 'ENEMY_HOUSES';
        }
        let convertedHouse = this.convertHouse(house);
        return (this.model.getNumSeeds(`seed-house-${convertedHouse}`) == 0) ? 'INVALID_NUM_SEEDS' : 'OK';
    }

    /**
     * Executes a play/move
     */
    play(house) {
        if (!this.checkTurn()) {
            return 'INVALID_TURN';
        }
        let validHouseRes = this.validHouse(house);
        if (validHouseRes != "OK") {
            return validHouseRes;
        }
        let convertedHouse = this.convertHouse(house);
        let seeds = this.model.getNumSeeds('seed-house-' + convertedHouse);
        this.model.setSeeds('seed-house-' + convertedHouse, 0);
        let totalNumberOfHouses = this.model.numOfHouses * 2;
        let curSeedHouse = (convertedHouse + 1) % totalNumberOfHouses;
        let lastStorage = false;
        while(seeds > 0) {
            curSeedHouse %= totalNumberOfHouses; 
            if (curSeedHouse == 0 && seeds > 0 && this.model.playerTurn == this.model.turns.PLAYER2) {
                this.model.addSeeds('seed-capture-house-left', 1);
                lastStorage = true;
                seeds--;
            } else if (curSeedHouse == this.model.numOfHouses && this.model.playerTurn == this.model.turns.PLAYER1) {
                this.model.addSeeds('seed-capture-house-right', 1);
                lastStorage = true;
                seeds--;
            }
            if (seeds > 0) {
                this.model.addSeeds('seed-house-' + curSeedHouse, 1);
                lastStorage = false;
                seeds--;
            }
            curSeedHouse++;
        }
        if (!lastStorage) {
            this.model.captureSeeds(curSeedHouse - 1); // curSeedsHouse has last seed + 1
            this.model.switchPlayerTurn();
        }
        return 'OK';
    }
}