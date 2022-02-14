const UserModel = require('../Models/UserModel');
const { headers } = require('../conf');

// Controller responsible for handling a join request (join a game)
module.exports = class extends require('./JSONArgumentController') {
    constructor(request, response, gameModel) {
        super(request, response);
        this.gameModel = gameModel;
    }

    validateJSON() {
        return ('nick' in this.query && 'password' in this.query && 'size' in this.query && 'initial' in this.query);
    }

    /**
     * Attempts an authentication, followed by a join
     */
    processRequest() {
        UserModel.authenticateUser(this.query, this.joinUser.bind(this));
    }

    /**
     * If the user's credentials matched, it joins a game
     * 
     * @param {Boolean} authenticated 
     */
    joinUser(authenticated) {
        if (authenticated) {
            let gameID = this.gameModel.join(this.query);
            this.response.writeHead(200, headers.json);
            this.response.end(JSON.stringify ({
                game: gameID
            }));
        } else {
            this.response.writeHead(401, headers.json);
            this.response.end(JSON.stringify ({
                error: 'Os dados fornecidos no pedido não correspondem a nenhum utilizador.'
            }));
        }
    }
}