/*
    game_controller:
    This module contains all classes and methods related to game logic. Here plays are processed and the end of the game is detected
*/

"use strict"

import { LocalRanking } from '../ranking/local-ranking.js';
import { MessageNotifier } from '../utils/message-notifier.js';
import { $ } from '../utils/utils.js';
import { GameModel } from './game_model.js';
import { RandomEnemyEngine } from '../enemy-engine/random-enemy-engine.js';
import { MediumEnemyEngine } from '../enemy-engine/medium-enemy-engine.js';
import { HardEnemyEngine } from '../enemy-engine/hard-enemy-engine.js';
import { HostData } from '../utils/conf.js';


export class Game {
    static Opponent = Object.freeze({COMPUTER: 'CPU', PLAYER: 'Human'});
    static AILevel = Object.freeze({EASY: 'easy', MEDIUM: 'medium', HARD: 'hard'});

    constructor(gameView, gameModel, replayCallback) {
        this.gameView = gameView;
        this.gameModel = gameModel;
        this.replayCallback = replayCallback;
        this.initGame();
    }

    initGame() {
        this.setEventListeners(this.gameModel.getNumOfHouses());
    }

    disableEventListeners() {
        $('game-board').innerHTML = $('game-board').innerHTML;
    }

    updateView() {
        this.gameView.updateHouses();  
        this.gameView.generateHouseTooltips();      
    }

    /**
     * Sets event listeners for house click (a move)
     * 
     * @param {Int} numOfHouses 
     */
    setEventListeners(numOfHouses) {
        for (let houseIdx = 0; houseIdx < numOfHouses; houseIdx++) {
            $(`seed-house-${(numOfHouses * 2) - (houseIdx + 1)}`).addEventListener('click', (_) => this.onHouseClick((numOfHouses * 2) - (houseIdx + 1)));
            $(`seed-house-${houseIdx}`).addEventListener('click', (_) => this.onHouseClick(houseIdx));
        }
        $('giveup-button').onclick = (_) => {
            this.disableEventListeners();
            MessageNotifier.addMessageWithAction('Desistiu! ', 'Jogar Novamente', this.replayCallback);
        }
    }

    registerWinner() {
        throw new Error("Abstract method can't be called!");
    }

}

export class PvP extends Game {
    constructor(gameView, gameModel, credentials, leaveCallback, replayCallback) {
        super(gameView, gameModel, replayCallback);
        this.leaveCallback = leaveCallback;
        this.credentials = credentials;
        this.openEvents();
        $('giveup-button').onclick = (_) => {
            this.disableEventListeners();
            MessageNotifier.addTextMessage('Desistiu!');
            this.leaveCallback();
        }
        this.gameTimeout = window.setTimeout(() => {
            console.log('Timed out');
            this.disableEventListeners();
            this.leaveCallback();
        }, 120000);
    }

    /**
     * Request server sent events
     */
    openEvents() {
        let uri = `${HostData.hostname}/update?game=${this.credentials.gameKey}&nick=${this.credentials.nick}`;
        this.serverConnection = new EventSource(encodeURI(uri));
        this.serverConnection.onmessage = (message) => (this.processServerMessage(JSON.parse(message.data)));
        this.serverConnection.onerror = (m) => console.log(m);
        this.serverConnection.onopen = (m) => console.log(m);
    }

    /**
     * Parses update message and acts uppon its contents, updating the game
     * 
     * @param {Object} jsonMessage 
     */
    processServerMessage(jsonMessage) {
        if ('turn' in jsonMessage) {
            MessageNotifier.addTextMessage(`É a vez de ${jsonMessage.turn} jogar.`);
        }
        if ('board' in jsonMessage) {
            this.updateModel(this.credentials.nick, jsonMessage.board);
            this.updateView();
            MessageNotifier.addTextMessage(`É a vez de ${jsonMessage.board.turn} jogar.`);
        }
        if ('winner' in jsonMessage && jsonMessage.winner != null) {
            this.disableEventListeners()
            MessageNotifier.addMessageWithAction(`O jogador ${jsonMessage.winner} ganhou. `, "Jogar novamente", this.replayCallback);
            this.serverConnection.close();
        }
        if ('error' in jsonMessage) {
            MessageNotifier.addTextMessage(jsonMessage.error);
        }
    }

    /**
     * Updates local game model with the model sent by the server
     * 
     * @param {String} localNickName 
     * @param {ServerModel} serverModel 
     */
    updateModel(localNickName, serverModel) {
        let sideData = serverModel.sides;
        for (let objectName in sideData) {
            if (localNickName == objectName) {
                this.gameModel.setSeeds('seed-capture-house-right', sideData[objectName].store);
                for(let i = 0; i < sideData[objectName].pits.length; i++) {
                    this.gameModel.setSeeds(`seed-house-${i}`, sideData[objectName].pits[i]);
                }
            } else {
                this.gameModel.setSeeds('seed-capture-house-left', sideData[objectName].store);
                for(let i = sideData[objectName].pits.length; i < sideData[objectName].pits.length * 2; i++) {
                    this.gameModel.setSeeds(`seed-house-${i}`, sideData[objectName].pits[i - sideData[objectName].pits.length]);
                }
            }
        }
    }

    /**
     * Stops game in 120 seconds
     */
    resetTimeout() {
        window.clearTimeout(this.gameTimeout);
        this.gameTimeout = window.setTimeout(() => {
            this.disableEventListeners();
            this.leaveCallback();
        }, 120000);
    }

    /**
     * Sends a notification request, which registers the player's move
     * 
     * @param {Int} idx 
     */
    onHouseClick(idx) {
        fetch(`${HostData.hostname}/notify`,{
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                nick: this.credentials.nick,
                password: this.credentials.password,
                game: this.credentials.gameKey,
                move: idx
            })
        })
        .then((response) => response.json())
        .then((jsonData) => {
            if('error' in jsonData) {
                MessageNotifier.addTextMessage(jsonData.error);
            }
        })
        .catch((_) => MessageNotifier.addTextMessage('Ocorreu um erro ao contactar o servidor. Verifique a sua ligaçao à internet'));
    }
}

export class PvBot extends Game {

    constructor(gameView, gameModel, aiLevel, rankingModel, replayCallback) {
        super(gameView, gameModel, replayCallback);
        this.aiLevel = aiLevel;
        this.rankingModel = rankingModel;
        this.playEngine = this.createPlayEngine(aiLevel, gameModel);
        if (this.gameModel.getPlayerTurn() == GameModel.Turn.ENEMY) {
            this.makeEnemyPlay();
        }
    }

    /**
     * Decides bot difficulty
     * 
     * @param {Game.AILevel} aiLevel 
     * @param {GameModel} gameModel 
     * @returns 
     */
    createPlayEngine(aiLevel, gameModel) {
        if (aiLevel == Game.AILevel.MEDIUM) return new MediumEnemyEngine(gameModel);
        else if (aiLevel == Game.AILevel.EASY) return new RandomEnemyEngine(gameModel);
        else if (aiLevel == Game.AILevel.HARD) return new HardEnemyEngine(gameModel);
        else throw new Error('Unexpected AILevel');
    }

    sendTurnMessage(playerTurn) {
        if (playerTurn == 'Human') {
            MessageNotifier.addTextMessage("É o seu turno");
        } else if (playerTurn == 'CPU') {
            MessageNotifier.addTextMessage("É o turno do inimigo");
        }
    }

    initGame() {
        super.initGame();
        this.sendTurnMessage(this.gameModel.getPlayerTurn());
    }

    /**
     * Processes a given play in idx on the game model
     * 
     * @param {Int} idx 
     * @param {GameModel} gameModel 
     */
    static processPlay(idx, gameModel) {
        let turn = gameModel.getPlayerTurn();
        let seeds = gameModel.getNumSeeds('seed-house-' + idx);
        let totalNumberOfHouses = gameModel.getNumOfHouses() * 2;
        let curSeedHouse = (idx + 1) % totalNumberOfHouses;
        let lastStorage = false;

        gameModel.setSeeds('seed-house-' + idx, 0);

        while(seeds > 0) {
            curSeedHouse %= totalNumberOfHouses; 

            // Capture
            if (curSeedHouse == 0 && seeds > 0 && turn == GameModel.Turn.ENEMY) {
                gameModel.addSeeds('seed-capture-house-left', 1);
                lastStorage = true;
                seeds--;
            } else if (curSeedHouse == gameModel.getNumOfHouses() && turn == GameModel.Turn.PLAYER) {
                gameModel.addSeeds('seed-capture-house-right', 1);
                lastStorage = true;
                seeds--;
            }
            if (seeds > 0) {
                gameModel.addSeeds('seed-house-' + curSeedHouse, 1);
                lastStorage = false;
                seeds--;
            }
            curSeedHouse++;
        }

        // Only when turns change
        if (!lastStorage) {
            gameModel.captureSeeds(curSeedHouse - 1); 
            gameModel.switchPlayerTurn();
        } 
    }

    /**
     * Decides on message for invalid play and returns boolean ilustrating
     * the validity of the move
     * 
     * @param {Int} idx 
     * @returns 
     */
    checkPlay(idx) {
        let res = this.gameModel.validPlay(idx);
        switch (res) {
            case 0: {
                return true;
            }
            case 1: {
                MessageNotifier.addTextMessage("Jogada inválida. Casa tem 0 sementes!");
                return false;
            }
            case 2: {
                MessageNotifier.addTextMessage('Jogada inválida. Tentou jogar nas casas do adversário.');
                return false;
            }
        }
    }

    /**
     * Executes a play and all the verificatrions and updates required 
     * 
     * @param {Int} idx 
     */
    play(idx) {
        // Play
        if (this.checkPlay(idx)) {
            MessageNotifier.addTextMessage(`${this.gameModel.getPlayerTurn() == GameModel.Turn.ENEMY ? "O inimigo jogou na casa" : "Jogou na casa"} ${idx}`);
            PvBot.processPlay(idx, this.gameModel);
        }
        this.sendTurnMessage(this.gameModel.getPlayerTurn());

        // GameOver
        if (this.gameModel.isGameOver()) {
            this.gameModel.collectAll();
            this.disableEventListeners();
            this.registerWinner();
            this.sendWinnerMessage(this.gameModel.winner());
        }
        this.updateView();
    }

    /**
     * Enemy play
     */
    makeEnemyPlay() {
        setTimeout(() => { 
            while (this.gameModel.getPlayerTurn() == GameModel.Turn.ENEMY && !this.gameModel.hasEnded) {
                this.play(this.playEngine.getPlay(), this.gameModel.getPlayerTurn());
            }
        }, 1000); // Delay to let user see his play
    }

    /**
     * Event handler for seed house click, starts a move
     * 
     * @param {Int} idx 
     */
    onHouseClick(idx) {
        this.play(idx);
        this.makeEnemyPlay();
    }

    createWinnerMessage(winner) {
        if (winner == GameModel.Turn.PLAYER) return "Ganhou!";
        else if (winner == GameModel.Turn.ENEMY) return "Perdeu!";
        else return "It's a draw";
    }

    /**
     * Registers the winner in the local ranking
     */
    registerWinner() {
        let enemySeeds = parseInt(this.gameModel.getNumSeeds('seed-capture-house-left'));
        let ourSeeds = parseInt(this.gameModel.getNumSeeds('seed-capture-house-right'));
        this.rankingModel.insertRanking({
            winner: enemySeeds > ourSeeds ? LocalRanking.Winner.COMPUTER : LocalRanking.Winner.PLAYER,
            boardSize: `${this.gameModel.getNumOfHouses()}x${this.gameModel.getNumOfHouses()}`,
            score: enemySeeds > ourSeeds ? enemySeeds : ourSeeds
        });
    }

    sendWinnerMessage(winner) {
        MessageNotifier.addMessageWithAction(
            this.createWinnerMessage(winner),
            "Jogar de novo!",
            (_) => this.replayCallback()
        );
    }
}
