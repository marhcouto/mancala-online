const { headers } = require('../conf');
const RankingModel = require('../Models/RankingModel');

// Controller responsible for handling the server sent events and the update request which starts them
module.exports = class extends require('./Controller') {
    static rankingModel;

    static factory(rankingModel) {
        this.rankingModel = rankingModel;
    }

    constructor(request, response, parsedURL, gameModel) {
        super(request, response);
        this.query = parsedURL.query;
        if (!this._validateQuery()) {
            this.response.writeHead(400, headers.json);
            this.response.end(JSON.stringify ({
                error: 'Error parsing query string: Some arguments were not found!'
            }));
        } else if (!(this.query.game in gameModel.games)) {
            this.response.writeHead(400, headers.json);
            this.response.end(JSON.stringify ({
                error: 'Invalid game reference!'
            }));
        } else { // If valid, subscribe SSE
            let listenerData = {
                gameCode: this.query.game,
                nick: this.query.nick
            };
            gameModel.subscribe(listenerData, this.response);
            request.on('close', () => gameModel.unsubscribe(listenerData));
        }
    }

    _validateQuery() {
        return ((this.query != null) && ('nick' in this.query) && ('game' in this.query));
    }

    /**
     * Sends SSE update (with new game data),
     * executed after a move
     * 
     * @param {Object} game 
     * @param {Object} lastMove 
     */
    static sendUpdate(game, lastMove) {
        let boardModel = game.board;
        let boardJSON = {sides: {}};
        boardJSON.sides[boardModel.turns.PLAYER1] = boardModel.getPlayerSeeds(boardModel.turns.PLAYER1);
        boardJSON.sides[boardModel.turns.PLAYER2] = boardModel.getPlayerSeeds(boardModel.turns.PLAYER2);
        boardJSON.turn = boardModel.playerTurn;
        let completeResponse = {
            board: boardJSON,
        }
        if (lastMove != null) {
            completeResponse.pit = lastMove;
        }
        if (boardModel.isGameOver()) {
            completeResponse.winner = boardModel.winner();
            for (const player of Object.values(game.board.turns)) 
                this.rankingModel.insertGame(player, player == boardModel.winner());
        }

        for (const listener of game.listeners.values()) {
            listener.write('event: message\n');
            listener.write(`data: ${JSON.stringify(completeResponse)}`);
            listener.write('\n\n');
        }
    }

    /**
     * Sends SSE update for give up
     * 
     * @param {Object} game 
     * @param {String} winner 
     */
    static sendGiveUp(game, winner) {
        let data = {
            winner: winner
        };
        for (const listener of game.listeners.values()) {
            if (winner == null) {
                listener.writeHead(200, headers.sse);
            }
            listener.write('event: message\n');
            listener.write(`data: ${JSON.stringify(data)}`);
            listener.write('\n\n');
        }
    }
}