
// Controller responsible for handling requests whose route is not a match
module.exports = class extends require('./Controller') {
    constructor(request, response) {
        super(request, response);
        this.processRequest();
    }
    
    /**
     * Sends error
     */
    processRequest() {
        this.response.writeHead(404, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Transfer-Encoding': 'chunked'
        });
        this.response.end(`{"error":"unknown ${this.request.method} request"}`);
    }
}
