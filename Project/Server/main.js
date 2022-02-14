const http = require('http');
const url = require('url');
const RankingController = require('./Controllers/RankingController');
const RouteNotFound = require('./Controllers/RouteNotFound');
const RegisterController = require('./Controllers/RegisterController');
const JoinController = require('./Controllers/JoinController');
const UpdateController = require('./Controllers/UpdateController');
const NotifyController = require('./Controllers/NotifyController');
const LeaveController = require('./Controllers/LeaveController');
const ClientController = require('./Controllers/ClientController');
const GameModel = require('./Models/GameModel');
const RankingModel = require('./Models/RankingModel');
const { headers } = require('./conf');

let gameModel = new GameModel;
let rankingModel = new RankingModel;
UpdateController.factory(rankingModel);

http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true)
    const pathname = parsedUrl.pathname;
    switch(request.method) {
        case 'GET': {
            if (pathname == "/update") {
                new UpdateController(request, response, parsedUrl, gameModel, rankingModel);
            } else {
                new ClientController(request, response, pathname);
            }
            break;
        }
        case 'POST': {
            switch(pathname) {
                case '/ranking': {
                    console.log('Got Ranking POST');
                    new RankingController(request, response, rankingModel);
                    break;
                }
                case '/register': {
                    console.log('Got Register POST');
                    new RegisterController(request, response);
                    break;
                }
                case '/join': {
                    console.log('Got Join POST');
                    new JoinController(request, response, gameModel);
                    break;
                }
                case '/notify': {
                    new NotifyController(request, response, gameModel);
                    break;
                }
                case '/leave': {
                    new LeaveController(request, response, gameModel);
                    break;
                }
                default: {
                    new RouteNotFound(request, response);
                    break;
                }
            }
            break;
        }
        case 'OPTIONS': {
            response.writeHead(204, headers.options);
            response.end();
            break;
        }
    }
}).listen(9006);
