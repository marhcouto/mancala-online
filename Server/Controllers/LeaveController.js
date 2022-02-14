const UserModel = require('../Models/UserModel');
const UpdateController = require('../Controllers/UpdateController');
const { headers } =  require('../conf');

// Controller responsible for handling the request to leave a game
module.exports = class extends require('./JSONArgumentController') {
    constructor(request, response, gameModel) {
        super(request, response);
        this.gameModel = gameModel;
    }

    validateJSON() {
        return ((this.query != null) && ('nick' in this.query) && ('password' in this.query) && ('game' in this.query));
    }

    /**
     * Attempts an authentication, followed by leaving the game
     */
    processRequest() {
        UserModel.authenticateUser(this.query, this.leave.bind(this));
    }

    /**
     * Attempts to quit the player from a game
     * 
     * @param {Boolean} authenticated 
     */
    leave(authenticated) {
        if (authenticated) {
            try {
                const players = this.gameModel.players(this.query.game);
                let winner = null;
                if (players.length != 1) {
                    winner = players.find((curNick) => (curNick != this.query.nick));
                }
                UpdateController.sendGiveUp(this.gameModel.games[this.query.game], winner);
                this.response.writeHead(200, headers.json);
                this.response.end(JSON.stringify({}));
            } catch(err) {
                this.response.writeHead(400, headers.json);
                this.response.end(JSON.stringify({
                    error: 'Invalid game reference'
                }));
            }
        } else {
            this.response.writeHead(401, headers.json);
            this.response.end(JSON.stringify ({
                error: 'Os dados fornecidos no pedido não correspondem a nenhum utilizador.'
            }));
        }
    }
}