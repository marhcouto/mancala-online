const UserModel = require('../Models/UserModel');
const UpdateController = require('./UpdateController');
const BoardController = require('./BoardController');
const { headers } = require('../conf'); 

// Controller responsible for handling a Notify request (which represents a player's move)
module.exports = class extends require('./JSONArgumentController') {
    constructor(request, response, gameModel) {
        super(request, response);
        this.gameModel = gameModel
    }

    validateJSON() {
        return (('nick' in this.query) && ('password' in this.query) && ('game' in this.query) && ('move' in this.query));
    }

    /**
     * Executes a play/move
     */
    processRequest() {
        let user = {
            nick: this.query.nick,
            password: this.query.password
        };
        UserModel.authenticateUser(user, (authenticated) => {
            let games = this.gameModel.games;
            if (!authenticated) {
                this.response.writeHead(401, headers.json);
                this.response.end(JSON.stringify ({
                    error: 'Os dados fornecidos no pedido não correspondem a nenhum utilizador.'
                }));
            } else {
                if (!(this.query.game in games)) {
                    this.response.writeHead(400, headers.json);
                    this.response.end(JSON.stringify ({
                        error: 'O jogo fornecido não existe!'
                    }));
                }
                let val = new BoardController(games[this.query.game].board, this.query.nick).play(this.query.move); // Attempts the play
                // Possible outcomes
                switch(val) {
                    case 'INVALID_TURN': {
                        this.response.writeHead(400, headers.json);
                        this.response.end(JSON.stringify ({
                            error: 'Não é o seu turno!'
                        }));
                        break;
                    }
                    case 'ENEMY_HOUSES': {
                        this.response.writeHead(400, headers.json);
                        this.response.end(JSON.stringify ({
                            error: 'Tentou jogar numa casa inimiga!'
                        }));
                        break;
                    }
                    case 'INVALID_NUM_SEEDS': {
                        this.response.writeHead(400, headers.json);
                        this.response.end(JSON.stringify ({
                            error: `Casa com número de sementes inválido: ${this.query.move}`
                        }));
                        break;
                    }
                    case 'OK': {
                        this.response.writeHead(200, headers.json);
                        this.response.end(JSON.stringify ({}));
                        UpdateController.sendUpdate(games[this.query.game], this.query.move); // If OK update client data
                        break;
                    }
                    default: {
                        console.log(val);
                        this.response.writeHead(500, headers.json);
                        this.response.end(JSON.stringify({}));
                        break;
                    }
                }
            }
        })
    }
}