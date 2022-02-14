const Controller = require('./Controller');

// Generic controller for the requests who respond with JSON
module.exports = class extends Controller {
    constructor(request, response) {
        super(request, response);
        let body = '';
        request
            .on('data', (chunk) => { body += chunk })
            .on('end', () => {
                try {
                    this.query = JSON.parse(body);
                    if (!this.validateJSON()) {
                        throw Error('Invalid JSON body');
                    }
                    this.processRequest();
                } catch(err) {
                    console.log(err);
                    response.writeHead(400, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Transfer-Encoding': 'chunked'
                    });
                    response.end(JSON.stringify({
                        error: "Error parsing JSON request: SyntaxError: Unexpected end of JSON input"
                    }));
                }
            })
            .on('error', (err) => console.log(err));
    }
}
