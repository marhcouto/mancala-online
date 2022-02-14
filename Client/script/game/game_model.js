/*
    game_model:
    This module contains the game model where getters and setters are defined. It stores all the information about the game 

*/
"use strict"

export class GameModel {
    static Turn = Object.freeze({PLAYER: 'Human', ENEMY: 'CPU'});

    constructor(numOfHouses, initNumOfSeeds, startingPlayer) {
        this.playerTurn = startingPlayer;
        this.numOfHouses = numOfHouses;
        this.constructBoardMap(initNumOfSeeds);
        this.hasEnded = false;
    }

    /**
     * Constructs map that represents
     * the board
     * 
     * @param {Int} initNumOfSeeds 
     */
    constructBoardMap(initNumOfSeeds) {
        this.boardMap = new Map();
        this.boardMap.set('seed-capture-house-left', 0);
        for (let i = 0; i < this.numOfHouses; i++) {
            this.boardMap.set('seed-house-' + i, initNumOfSeeds);
        }
        this.boardMap.set('seed-capture-house-right', 0);
        for (let i = this.numOfHouses; i < this.numOfHouses * 2; i++) {
            this.boardMap.set('seed-house-' + i, initNumOfSeeds);
        }
    }

    /**
     * Makes a copy of the current game model
     * 
     * @param {GameModel} gameModel 
     */
    copy(gameModel) {
        this.playerTurn = JSON.parse(JSON.stringify(gameModel.getPlayerTurn()));
        this.numOfHouses = JSON.parse(JSON.stringify(gameModel.getNumOfHouses()));
        this.boardMap = new Map(JSON.parse(JSON.stringify(Array.from(gameModel.getBoardMap()))));
    }

    switchPlayerTurn() {
        if (this.getPlayerTurn() == GameModel.Turn.ENEMY) {
            this.playerTurn = GameModel.Turn.PLAYER;
        } else if (this.playerTurn = GameModel.Turn.PLAYER) {
            this.playerTurn = GameModel.Turn.ENEMY;
        }
    }

    /**
     * Attempt to capture seeds from a certain index
     * 
     * @param {Int} idx 
     */
    captureSeeds(idx) {

        let doCapture = () => { // Capture execution function
            let opositeHouseIdx = (this.getNumOfHouses() * 2 - idx - 1);
            let capturedSeeds = this.getNumSeeds('seed-house-' + opositeHouseIdx) + 1;
            if (idx >= 0 && idx <= 5) {
                this.addSeeds('seed-capture-house-right', capturedSeeds);
            } else {
                this.addSeeds('seed-capture-house-left', capturedSeeds);
            }
            this.setSeeds('seed-house-' + idx, this.getNumSeeds('seed-house-' + idx) - 1);
            this.setSeeds('seed-house-' + opositeHouseIdx, 0);
        }

        if (this.getNumSeeds('seed-house-' + idx) == 1) {
            switch (this.playerTurn) {
                case (GameModel.Turn.ENEMY): {
                    if (idx >= this.numOfHouses && idx < (this.numOfHouses * 2)) { // Only capture if house is in your side of the board
                        doCapture()
                    }
                    break;
                }
                case (GameModel.Turn.PLAYER): {
                    if (idx >= 0 && idx < this.numOfHouses) {
                        doCapture();
                    }
                    break;
                }
            }
        }
    }

    /**
     * Checks if both players still have seeds
     * 
     * @returns Boolean
     */
    hasPlays() {
        let player = false;
        let enemy = false;
        for (let i = 0; i < this.numOfHouses; i++) {
            if (this.boardMap.get('seed-house-' + i) != 0) 
                player = true;
        }
        for (let i = this.numOfHouses; i < this.numOfHouses * 2; i++) {
            if (this.boardMap.get('seed-house-' + i) != 0) 
                enemy = true;
        }
        return player && enemy;
    }

    isGameOver() {
        if (!this.hasPlays()) {
            this.hasEnded = true;
        } 
        return this.hasEnded;
    }

    /**
     * Collects all seeds from the field when game ends
     */
    collectAll() {
        for (let i = 0; i < this.numOfHouses; i++) {
            this.addSeeds('seed-capture-house-right', this.getNumSeeds('seed-house-' + i));
            this.setSeeds('seed-house-' + i, 0);
        }
        for (let i = this.numOfHouses; i < this.numOfHouses * 2; i++) {
            this.addSeeds('seed-capture-house-left', this.getNumSeeds('seed-house-' + i));
            this.setSeeds('seed-house-' + i, 0);
        }
    }

    /**
     * Returns string describing the ending situation of the game
     * 
     * @returns String
     */
    winner() {
        if (this.boardMap.get('seed-capture-house-right') > this.boardMap.get('seed-capture-house-left')) return GameModel.Turn.PLAYER;
        else if (this.boardMap.get('seed-capture-house-right') < this.boardMap.get('seed-capture-house-left')) return GameModel.Turn.ENEMY; 
        else return "draw";
    }

    /**
     * Checks if a play is valid
     * 
     * @param {Int} idx 
     * @returns 
     */
    validPlay(idx) {
        let seeds = this.boardMap.get('seed-house-' + idx);
        if (seeds <= 0) { // No seeds
            return 1;
        } else if ((this.playerTurn == GameModel.Turn.PLAYER && (idx >= this.numOfHouses)) || (this.playerTurn == GameModel.Turn.ENEMY && (idx < this.numOfHouses))) { // Wrong houses
            return 2;
        } else { // Good
            return 0;
        }
    }

    getNumOfHouses() {
        return this.numOfHouses;
    }

    getBoardMap() {
        return this.boardMap;
    }
    
    getPlayerTurn() {
        return this.playerTurn
    }

    getNumSeeds(houseStr) {
        return this.boardMap.get(houseStr);
    }

    setSeeds(houseStr, nSeeds) {
        return this.boardMap.set(houseStr, nSeeds);
    }

    addSeeds(houseStr, nSeeds) {
        return this.boardMap.set(houseStr, this.getNumSeeds(houseStr) + nSeeds);
    }
}