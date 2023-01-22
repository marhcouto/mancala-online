"use strict"

export class GameModel {
    static Turn = Object.freeze({PLAYER: 'Human', ENEMY: 'CPU'});

    constructor(numOfHouses, initNumOfSeeds, startingPlayer) {
        this.playerTurn = startingPlayer;
        this.numOfHouses = numOfHouses;
        this.constructBoardMap(initNumOfSeeds);
        this.hasEnded = false;
    }

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

    captureSeeds(idx) {

        let doCapture = () => {
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
                    if (idx >= this.numOfHouses && idx < (this.numOfHouses * 2)) {
                        // console.log("Captured from " + idx + " and " + (totalNumberOfHouses - idx - 1));
                        doCapture()
                    }
                    break;
                }
                case (GameModel.Turn.PLAYER): {
                    if (idx >= 0 && idx < this.numOfHouses) {
                        // console.log("Captured from " + idx + " and " + (totalNumberOfHouses - idx - 1));
                        doCapture();
                    }
                    break;
                }
            }
        }
    }

    hasPlays() {
        let start, finish;
        if (this.playerTurn == GameModel.Turn.ENEMY) {
            start = this.numOfHouses;
            finish = this.numOfHouses * 2;
        } else {
            start = 0;
            finish = this.numOfHouses;    
        }
        for (let i = start; i < finish; i++) {
            if (this.boardMap.get('seed-house-' + i) != 0) 
                return true;
        }
        return false;
    }

    isGameOver() {
        if (!this.hasPlays()) {
            this.hasEnded = true;
        } 
        return this.hasEnded;
    }

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

    winner() {
        if (this.boardMap.get('seed-capture-house-right') > this.boardMap.get('seed-capture-house-left')) return GameModel.Turn.PLAYER;
        else if (this.boardMap.get('seed-capture-house-right') < this.boardMap.get('seed-capture-house-left')) return GameModel.Turn.ENEMY; 
        else return "draw";
    }

    validPlay(idx) {
        console.log(idx, this.playerTurn);
        let seeds = this.boardMap.get('seed-house-' + idx);
        if (seeds <= 0) {
            return 1;
        } else if ((this.playerTurn == GameModel.Turn.PLAYER && (idx >= this.numOfHouses)) || (this.playerTurn == GameModel.Turn.ENEMY && (idx < this.numOfHouses))) {
            return 2;
        } else {
            return 0;
        }
    }
    
    // What for?
    getValidPlays() {
        let validPlays = [];
        let curIdx;
        let endIdx;

        if (this.playerTurn == GameModel.Turn.ENEMY) {
            curIdx = this.numOfHouses;
            endIdx =  this.numOfHouses * 2;
        } else {
            curIdx = 0;
            endIdx = this.numOfHouses;
        }

        while (curIdx < endIdx) {
            let nSeeds = this.getNumSeeds(`seed-house-${curIdx}`); 
            if (nSeeds > 0) {
                validPlays.push(curIdx);
            }
            curIdx++;
        }
        return validPlays;
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