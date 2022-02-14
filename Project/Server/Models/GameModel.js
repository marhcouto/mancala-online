const crypto = require('crypto');
const BoardModel = require('./BoardModel');
const UpdateController = require('../Controllers/UpdateController');
const { headers } = require('../conf');

// Model for the games system (the games hosted in the server)
module.exports = class {
    constructor() {
        this.games = {};
        this.pending = [];
        this.generalCode = this._getChecksum();
    }

    _getChecksum() {
        return crypto
            .randomBytes(64)
            .toString('hex');
    }

    /**
     * Subscribes Server Sent Events for In-Game Information real time updates
     * 
     * @param {Object} listenerData 
     * @param {Response} response 
     */
    subscribe(listenerData, response) {
        if (this.games[listenerData.gameCode] == null) {
            throw new Error('InvalidGameCode');
        }
        this.games[listenerData.gameCode].listeners.set(listenerData.nick, response);
        if (this.games[listenerData.gameCode].board.ready()) {
            for (const listener of this.games[listenerData.gameCode].listeners.values()) { // Only send response when game is found
                listener.writeHead(200, headers.sse);
            }
            UpdateController.sendUpdate(this.games[listenerData.gameCode], null);
        }
    }

    /**
     * Subscribes Server Sent Events
     * 
     * @param {Object} listenerData 
     */
    unsubscribe(listenerData) {
        if (this.games[listenerData.gameCode] == null) {
            throw new Error('InvalidGameCode');
        }
        if ('listeners' in this.games[listenerData.gameCode]) {
            this.games[listenerData.gameCode].listeners.delete(listenerData.nick);
            if (this.games[listenerData.gameCode].listeners.size == 0) { // Deletes game when there are no longer players
                this.deleteGame(listenerData.gameCode);
            }
        }
    }

    /**
     * Creates a new game session or joins the user to an exhisting one
     * 
     * @param {Object} joinJSON 
     * @returns 
     */
    join(joinJSON) {
        joinJSON.group = joinJSON.group ? joinJSON.group : this.generalCode;
        let pendingMatch = this.pending.find((pendingObj) => {
            let curBoard = this.games[pendingObj.gameID].board;
            return (curBoard.numOfHouses == joinJSON.size) && (curBoard.initNumOfSeeds == joinJSON.initial) && (joinJSON.group == pendingObj.group); 
        });
        if (!pendingMatch) { // No matches for the game type, creates new game
            let newMatchID = this._getChecksum();
            this.games[newMatchID] = {
                board: new BoardModel(joinJSON.size, joinJSON.initial, joinJSON.nick),
                listeners: new Map()
            };
            this.pending.push({
                group: joinJSON.group,
                gameID: newMatchID
            });
            return newMatchID;
        } else {
            this.games[pendingMatch.gameID].board.addPlayer(joinJSON.nick);
            this.pending = this.pending.filter((pendingObj) => pendingObj.gameID != pendingMatch.gameID);
            return pendingMatch.gameID;
        }
    }
    
    /**
     * Returns players of a game
     * 
     * @param {Int} gameID 
     * @returns Array 
     */
    players(gameID) {
        if (this.games[gameID] == null) {
            throw new Error('InvalidGameCode');
        }
        return Object.values(this.games[gameID].board.turns);
    }

    /**
     * Deletes a game
     * 
     * @param {Int} gameID 
     */
    deleteGame(gameID) {
        if (this.games[gameID] == null) {
            throw new Error('InvalidGameCode');
        }
        this.pending = this.pending.filter((pendingObj) => pendingObj.gameID != gameID);
        delete this.games[gameID];
    }
}