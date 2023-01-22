// Base controller

module.exports = class {
    constructor(request, response) {
        this.response = response;
        this.request = request;
    }

    /**
     * Processes the request  
     */ 
    processRequest() {
        throw new Error('Absctract method cannot be called.');
    }
}
