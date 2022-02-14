import { PvBot } from '../game/game_controller.js';
import { GameModel } from '../game/game_model.js';


export class PlayMaker {


    /**
     * Evaluates a certain board in the means 
     * taking into account the bot's position
     * to win the game
     * 
     * @param {Map} board 
     * @return {Int} score
     */
    static _boardEvaluator(gameModel) {
        let board = gameModel.getBoardMap();
        let score = 0;
        let numHouses = gameModel.getNumOfHouses();
        score += board.get('seed-capture-house-left') - board.get('seed-capture-house-right');

        
        let numEmptyHouses = 0;

        for (let i = 0; i < numHouses; i ++) {
            if (board.get('seed-house-' + i) == 0) numEmptyHouses++;
            if (board.get('seed-house-' + (numHouses - i)) == 0) numEmptyHouses--;
        }

        score += numEmptyHouses;

        return score;
    }


    static minimax(gameModel, depth) {
        
        return PlayMaker._minimaxAux(gameModel, depth, depth);
    }

    static _minimaxAux(gameModel, depth, initialDepth) {

        let bestPlay = 0;
        let bestScore = gameModel.getPlayerTurn() == GameModel.Turn.ENEMY ? -9999999 : 9999999;
        let numHouses = gameModel.getNumOfHouses();

        for (let i = 0; i < numHouses; i++) {
            let tempGameModel = new GameModel(0,0,GameModel.Turn.ENEMY);
            let newDepth = depth;
            tempGameModel.copy(gameModel);
            let initialTurn = tempGameModel.getPlayerTurn();
            let house = initialTurn == GameModel.Turn.ENEMY ? i + numHouses : i;

            if (tempGameModel.validPlay(house) != 0) continue;

            if (initialTurn == GameModel.Turn.ENEMY) {
                PvBot.processPlay(house, tempGameModel);
            } else {
                PvBot.processPlay(house, tempGameModel);
            }
            if (initialTurn != tempGameModel.getPlayerTurn()) { // Changed turn
                newDepth--;
            }
            
            let boardScore = newDepth >= 0 ? PlayMaker._minimaxAux(tempGameModel, newDepth) : PlayMaker._boardEvaluator(tempGameModel);
            if ((bestScore < boardScore && gameModel.getPlayerTurn() == GameModel.Turn.ENEMY) || (bestScore > boardScore && gameModel.getPlayerTurn() == 'Human')) {
                bestScore = boardScore;
                bestPlay = house;
            }
        }

        return depth == initialDepth ? bestPlay : bestScore;
    }
}