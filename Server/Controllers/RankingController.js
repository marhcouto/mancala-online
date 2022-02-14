const RankingModel = require('../Models/RankingModel');
const { headers } = require('../conf');

// Controller responsible for handling the request for the remote ranking
module.exports = class extends require('./Controller') {
    constructor(request, response, rankingModel) {
        super(request, response);
        this.rankingModel = rankingModel;
        this.processRequest();
    }
    
    /**
     * Retrieves ranking JSON
     */
    processRequest() {
        this.response.writeHead(200, headers.json);
        let jsonResponse = JSON.stringify({
            "ranking": this.rankingModel.rankings
        });
        this.response.end(jsonResponse);
    }
}
