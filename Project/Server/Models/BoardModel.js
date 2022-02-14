module.exports = class {

    /**
     * Represents the GameModel: The board and the operations related to it
     * 
     * @param {Int} numOfHouses 
     * @param {Int} initNumOfSeeds 
     * @param {*} player 
     */
    constructor(numOfHouses, initNumOfSeeds, player) {
        this.turns = {
            PLAYER1: player
        };
        this.numOfHouses = numOfHouses;
        this.initNumOfSeeds = initNumOfSeeds;
        this.constructBoardMap(initNumOfSeeds);
        this.hasEnded = false;
    }

    /**
     * Adds player to game
     * 
     * @param {String} nick 
     */
    addPlayer(nick) {
        this.turns.PLAYER2 = nick;
        this.playerTurn = [this.turns.PLAYER1, this.turns.PLAYER2][Math.floor(Math.random() * 2)];
    }

    /**
     * Checks if the game has 2 players,
     * which is synonym to being ready
     * 
     * @returns Bool
     */
    ready() {
        return (this.turns.PLAYER2 != null);
    }

    /**
     * Constructs map that represents board
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

    switchPlayerTurn() {
        if (this.playerTurn == this.turns.PLAYER1) {
            this.playerTurn = this.turns.PLAYER2;
        } else if (this.playerTurn = this.turns.PLAYER2) {
            this.playerTurn = this.turns.PLAYER1;
        }
    }

    /**
     * Attempts a capture for the current player
     * in the house given by idx
     * 
     * @param {Int} idx 
     */
    captureSeeds(idx) {
        let totalNumberOfHouses = this.numOfHouses * 2;
        let opositeHouseIdx = (totalNumberOfHouses - idx - 1); 
        let doCapture = () => {
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
                case (this.turns.PLAYER2): {
                    if (idx >= this.numOfHouses && idx < (this.numOfHouses * 2)) { // Captures if the house is in the player's side of the board
                        doCapture()
                    }
                    break;
                }
                case (this.turns.PLAYER1): {
                    if (idx > 0 && idx < this.numOfHouses) {
                        doCapture();
                        break;
                    }
                }
            }
        }
    }

    /**
     * Checks if player2 has possible plays (checks the seeds in his side of the board)
     * 
     * @returns Bool
     */
    enemyHasPlays() {
        for (let i = this.numOfHouses; i < this.numOfHouses * 2; i++) {
            if (this.boardMap.get('seed-house-' + i) != 0) 
                return true;
        }
        return false;
    }

    /**
     * Checks if player1 has possible plays (checks the seeds in his side of the board)
     * 
     * @returns Boolean
     */
    playerHasPlays() {
        for (let i = 0; i < this.numOfHouses; i++) {
            if (this.boardMap.get('seed-house-' + i) != 0) 
                return true;
        }
        return false;
    }

    isGameOver() {
        if (!this.playerHasPlays() || !this.enemyHasPlays()) {
            this.hasEnded = true;

        } 
        return this.hasEnded;
    }

    /**
     * Returns end of game result
     * 
     * @returns String
     */
    winner() {
        if (this.boardMap.get('seed-capture-house-right') > this.boardMap.get('seed-capture-house-left')) return this.turns.PLAYER1;
        else if (this.boardMap.get('seed-capture-house-right') < this.boardMap.get('seed-capture-house-left')) return this.turns.PLAYER2; 
        else return "draw";
    }
    
    /**
     * Gets an array with the valid plays in the current turn
     * 
     * @returns Array
     */
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

    /**
     * Returns the seeds in a player's side and in his storage
     * 
     * @param {String} player 
     * @returns Object
     */
    getPlayerSeeds(player) {
        let seeds = {};
        if (player == this.turns.PLAYER1) { 
            seeds.store = this.getNumSeeds('seed-capture-house-right');
            seeds.pits = [];
            for(let i = 0; i < this.numOfHouses; i++) {
                seeds.pits.push(this.getNumSeeds(`seed-house-${i}`));
            }
        } else {
            seeds.store = this.getNumSeeds('seed-capture-house-left');
            seeds.pits = [];
            for(let i = this.numOfHouses; i < (this.numOfHouses * 2); i++) {
                seeds.pits.push(this.getNumSeeds(`seed-house-${i}`));
            }
        }
        return seeds;
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
