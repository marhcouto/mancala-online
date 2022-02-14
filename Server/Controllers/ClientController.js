const { headers } = require('../conf.js');
const fs = require('fs');

// Controller responsible for handling the request for the website itself
module.exports = class extends require('./Controller') {
    static basePath = './public';

    constructor(request, response, pathname) {
        super(request, response);
        this.pathname = pathname
        this.processRequest();
    }

    /**
     * Sends error message
     */
    sendInvalidRequest() {
        this.response.writeHead(404, headers.internalError);
        this.response.end('Error while reading asset');
    }

    /**
     * Returns the client-side code
     */
    processRequest() {
        let header;
        let filePath;
        if (this.pathname == '/') {
            filePath = `${this.constructor.basePath}/index.html`;
            header = headers.html;
        } else {
            filePath = `${this.constructor.basePath}/${this.pathname.slice(1, this.pathname.length)}`;
            header = headers[this.pathname.split('.')[1]];
        }
        const fileStream = fs.createReadStream(filePath);
        fileStream.on('open', () => {
            this.response.writeHead(200, header);
            fileStream.pipe(this.response);
        })
        fileStream.on('error', (err) => {
            console.log(err);
            this.response.writeHead(404, headers.text);
            this.response.end('File not found');
        })
    }
}