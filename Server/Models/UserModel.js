const fs = require('fs');
const crypto = require('crypto');

// Model for a user
module.exports = class {

    /**
     * Retrieves users from JSON file
     * 
     * @param {Function} callback 
     */
    static retrieveUsers(callback) {
        fs.readFile('./Data/users.json', 'utf-8', (err, data) => {
            if (!err) {
                callback(JSON.parse(data));
            } else {
                console.log(err);
                throw new Error('Error reading file.');
            }
        })
    }

    /**
     * Hashes a password
     * 
     * @param {String} plainTextPassword 
     * @returns String
     */
    static hashPlainText(plainTextPassword) {
        return crypto
            .createHash('md5')
            .update(plainTextPassword)
            .digest('hex');
    }

    /**
     * Attempts to authenticate a user 
     * and calls a designated function
     * when it is finished
     * 
     * @param {Object} user 
     * @param {Function} callback 
     */
    static authenticateUser(user, callback) {
        this.retrieveUsers((userModels) => {
            if (!userModels[user.nick]) {
                callback(false);
            }
            if (userModels[user.nick] != this.hashPlainText(user.password)) {
                callback(false);
            }
            callback(true);
        });
    }
    
    /**
     * Updates users file
     * 
     * @param {Object} model 
     */
    static updateModel(model) {
        fs.writeFile('./Data/users.json', JSON.stringify(model), (err) => {
            if (err) {
                console.log(err);
                throw new Error('Error reading file.');
            }
        })
    }
}