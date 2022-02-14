const fs = require('fs');

// Model for the ranking system
module.exports = class {

    /**
     * Retrieves the ranking from the JSON file
     */
    constructor() {
        this.constructor.retrieveRankings((data) => {
            this.rankings = data;
            setTimeout(() => this.backup(), 30000);
        });
    }

    /**
     * Retrieves rankings and 
     * calls a designated function
     * when it is finished
     * 
     * @param {Function} callback 
     */
    static retrieveRankings(callback) {
        fs.readFile('./Data/rankings.json', 'utf-8', (err, data) => {
            if (!err) {
                callback(JSON.parse(data));
            } else {
                console.log(err);
                throw new Error('Error reading file.');
            }
        })
    }

    /**
     * Adds a record to the ranking
     * 
     * @param {String} nick 
     * @param {Boolean} won 
     */
    insertGame(nick, won) {
        let sortFn = (elm1, elm2) => {
            return (elm2.victories - elm1.victories); 
        }
        let user = this.rankings.find((curUser) => (curUser.nick == nick));
        if (!user) {
            user = {
                nick: nick,
                victories: 0,
                games: 0
            };
            this.rankings.push(user);
        }
        user.games++;
        if (won) user.victories++;
        this.rankings.sort(sortFn);
    }

    /**
     * Updates the rankings JSON file every 30 seconds
     */
    backup() {
        fs.writeFile('./Data/rankings.json', JSON.stringify(this.rankings), (err) => {
            if (err) {
                console.log(err);
            }
        });
        setTimeout(() => this.backup(), 30000);
    }
}