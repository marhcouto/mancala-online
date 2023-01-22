const UserModel = require('../Models/UserModel')
const { headers } = require('../conf');

// Controller responsible for handling the request for a registration in the website
module.exports = class extends require('./JSONArgumentController') {

    
    validateJSON() {
        return ('nick' in this.query && 'password' in this.query);
    }

    /**
     * Attempts login or sign-up
     */
    processRequest() {
        let userObj = this.query;
        let passwordHash = UserModel.hashPlainText(userObj.password);
        UserModel.retrieveUsers((usersJSON) => {
            if (usersJSON[userObj['nick']]) {
                if (usersJSON[userObj['nick']] == passwordHash) {
                    this.response.writeHead(200, headers.json);
                    this.response.end(JSON.stringify({}));

                } else {
                    this.response.writeHead(401, headers.json);
                    this.response.end(JSON.stringify ({
                        error: 'A password não corresponde ao nome de utilizador fornecido.'
                    }));
                }
            } else {
                usersJSON[userObj['nick']] = passwordHash;
                UserModel.updateModel(usersJSON);
                this.response.writeHead(200, headers.json);
                this.response.end(JSON.stringify({}));
            }
        })
    }
}