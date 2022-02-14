/*
    This module handles login, register, menu buttons and constructs new game instances when asked.
*/

"use strict";

import {Game, PvBot, PvP} from './script/game/game_controller.js';
import {GameView} from './script/game/game_view.js';
import {GameModel} from './script/game/game_model.js';
import {$} from './script/utils/utils.js';
import { RemoteRanking } from './script/ranking/remote-ranking.js';
import { LocalRanking } from './script/ranking/local-ranking.js';
import { MessageNotifier } from './script/utils/message-notifier.js';
import { HostData } from './script/utils/conf.js';


class System {
    
    constructor() {
        this.configData = {
            numOfHouses: 6,
            initSeedNumber: 5,
            opponent: Game.Opponent.COMPUTER,
            aiLevel: Game.AILevel.MEDIUM,
            startingPlayer: GameModel.Turn.PLAYER,
        };
        this.localRanking = new LocalRanking();
        this.setupInterfaceEventHandlers();
        this.createGame();
    }



    // ---------------------------------------------Game related methods--------------------------------------------------------

    replay() {
        this.createGame();
    }

    leaveGame() {
        fetch(`${HostData.hostname}/leave`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                nick: this.credentials.nick,
                password: this.credentials.password,
                game: this.credentials.gameKey
            })
        })
        .then((response) => response.json())
        .then((jsonData) => console.log(jsonData))
    }

    createLocalGame() {
        let gameModel = new GameModel(this.configData.numOfHouses, this.configData.initSeedNumber, this.configData.startingPlayer);
        let gameView = new GameView(this.configData.initSeedNumber, gameModel);
        this.game = new PvBot(gameView, gameModel, this.configData.aiLevel, this.localRanking, () => this.replay());
    }

    createRemoteGame() {
        if('credentials' in this && 'nick' in this.credentials && 'password' in this.credentials) {
            fetch(`${HostData.hostname}/join`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    nick: this.credentials.nick,
                    password: this.credentials.password,
                    size: this.configData.numOfHouses,
                    initial: this.configData.initSeedNumber,
                    group: 'QualquerStringServe',
                })
            })
            .then((response) => response.json())
            .then((jsonData) => {
                if('error' in jsonData) {
                    MessageNotifier.addTextMessage(`Ocorreu um erro: ${jsonData.error}`,
                    'Tente novamente',
                    () => this.createGame())
                } else {
                    this.credentials.gameKey = jsonData.game;
                    let gameModel = new GameModel(this.configData.numOfHouses, this.configData.initSeedNumber, this.configData.startingPlayer);
                    let gameView = new GameView(this.configData.initSeedNumber, gameModel);
                    this.game = new PvP(gameView, gameModel, this.credentials, () => this.leaveGame(), () => this.replay());
                    $('game-board').style.display = "inline-flex";
                }
            });
        } else {
            MessageNotifier.addMessageWithAction(
                "Não está autenticado. Autentique-se e ",
                "tente novamente",
                (_) => this.createGame()
            );
        }
    }

    createGame() {
        $("game-board").innerHTML = "";
        $('game-board').style.display = "none";
        $("message-area").innerHTML = "";
        if (this.configData.opponent == Game.Opponent.COMPUTER) {
            this.createLocalGame();
        } else if (this.configData.opponent == Game.Opponent.PLAYER) {
            this.createRemoteGame();
        }
    }






    // ---------------------------------------------Extra Server communications--------------------------------------------------------


    /**
     * Makes a request for the remote ranking
     */
    fetchRanking() {
        $("ranking-body").innerText = "A recuperar dados...";
        let checkedSource = document.querySelector('input[name="ranking-source"]:checked').value;
        if (checkedSource == 'local') {
            this.localRanking.display();
        } else if (checkedSource == 'remote') {
            let dataSource = new RemoteRanking();
            dataSource.display();
        } else {
            $("ranking-body").innerText = "Fonte de dados inválida contacte o desenvolvedor";
        }
    }

    /**
     * Executes login/sign-up (register) in the server
     * 
     * @param {String} username 
     * @param {String} password 
     * @param {Function} observerFunctions 
     */
    submitUserCredentials(username, password, observerFunctions) {
        fetch(`${HostData.hostname}/register`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                nick: username,
                password: password 
            })
        }).then((response) => response.json())
        .then((jsonData) => {
            if ('error' in jsonData) {
                observerFunctions.onError(jsonData['error']);
            } else {
                this.credentials = {
                    nick: username,
                    password: password
                };
                observerFunctions.onSucess();
            }
        })
        .catch((error) => {
            console.log(error);
            observerFunctions.onError('Ocorreu um erro. Verifique a sua ligação com a internet');
        });
    }







    // ---------------------------------------------Window Dynamics--------------------------------------------------------

    /**
     * Hide login button after login is performed
     */
    replaceLoginButton() {
        $('navbar-login-area').innerHTML = "";
        let userGreeting = document.createElement('p');
        userGreeting.innerHTML = `Bem vindo, ${this.credentials.nick}`;
        userGreeting.id = "navbar-user-greeting";
        $('navbar-login-area').appendChild(userGreeting);
    }

    configCloseWindow() {
        $("configs").style.display = "none";
        this.hideComputerSpecificOptions();
    }

    /**
     * Syncs the configuratons with visualization
     */
    syncConfigDataWithWindow() {
        let houseNumber = document.querySelector("select[name=house-number]");
        for (let i = 0; i < houseNumber.children.length; i++) {
            if (houseNumber.children[i].value == this.configData.numOfHouses) {
                houseNumber.selectedIndex = i;
                break;
            }
        }

        let initSeedNumber = document.querySelector("select[name=init-seed-number]");
        for (let i = 0; i < initSeedNumber.children.length; i++) {
            if (initSeedNumber.children[i].value == this.configData.initNumOfSeeds) {
                initSeedNumber.selectedIndex = i;
                break;
            }
        }


        document.querySelector(`input[name=opponent][value=${this.configData.opponent}]`).checked = true;

        if (this.configData.opponent == Game.Opponent.COMPUTER) {
            this.showComputerSpecificOptions();

            document.querySelector(`input[name=ai-level][value=${this.configData.aiLevel}]`).checked = true;
            document.querySelector(`input[name=starting-player][value=${this.configData.startingPlayer}]`).checked = true
        }
    }

    /**
     * Hides the specifications only available for game against CPU in configurations
     */
    hideComputerSpecificOptions() {
        let computerSpecificOptions = document.getElementsByClassName("computer-specific");
        for (let i = 0; i < computerSpecificOptions.length; i++) {
            computerSpecificOptions[i].style.display = "none";
        }
    }

    /**
     * Shows the specifications only available for game against CPU in configurations
     */
    showComputerSpecificOptions() {
        let computerSpecificOptions = document.getElementsByClassName("computer-specific");
        for (let i = 0; i < computerSpecificOptions.length; i++) {
            computerSpecificOptions[i].style.display = "block";
        }
    }





    // ---------------------------------------------Event Listeners--------------------------------------------------------

    /**
     * Executes the update of configurations and starts a new game
     * 
     * @param {*} _ 
     */
     onSubmitTableConfigChanges(_) {
        this.configData = {}

        let hostnameValue = document.querySelector("input[name=server]:checked").value;
        HostData.hostname = hostnameValue

        let houseNumber = document.querySelector("select[name=house-number]").children;
        for (let i = 0; i < houseNumber.length; i++) {
            if (houseNumber[i].selected) {
                this.configData["numOfHouses"] = parseInt(houseNumber[i].value);
            }
        }
        
        let initSeedNumber = document.querySelector("select[name=init-seed-number]").children;
        for (let i = 0; i < initSeedNumber.length; i++) {
            if (initSeedNumber[i].selected) {
                this.configData["initSeedNumber"] = parseInt(initSeedNumber[i].value); 
            }
        }

        let opponentValue = document.querySelector("input[name=opponent]:checked").value;
        this.configData["opponent"] = opponentValue

        if (this.configData["opponent"] == Game.Opponent.COMPUTER) {
            this.configData["aiLevel"] = document.querySelector("input[name=ai-level]:checked").value;
            this.configData["startingPlayer"] = document.querySelector("input[name=starting-player]:checked").value;
        }

        this.configCloseWindow();
        this.createGame();
    }


    /**
     * Sets up event listeners related to rules
     */
    rulesEventHandlers() {
        $("navbar-button-rules").addEventListener("click", (_) => {
            $("rules").style.display = "inline-block";
        });
        $("rules-close-button").addEventListener("click", (_) => {
            $("rules").style.display = "none";
        })
    }


    /**
     * Sets up event listeners related to ranking
     */
    rankingsEventHandlers() {
        $("navbar-button-rankings").addEventListener("click", (_) => {
            $("rankings").style.display = "inline-block";
            $("ranking-body").innerHTML = "";
            this.fetchRanking();
        });
        $("rankings-close-button").addEventListener("click", (_) => $("rankings").style.display = 'none');
        let sourceCheckboxes = document.querySelectorAll('input[name="ranking-source"]');
        for (let i = 0; i < sourceCheckboxes.length; i++) {
            sourceCheckboxes[i].addEventListener("change", () => this.fetchRanking());
        }
    }


    /**
     * Sets up event listeners related to login
     */
    loginEventHandlers() {
        let observerFunctions = {
            onError: (errorString) => $("login-error-area").innerText = errorString,
            onSucess: () => {
                $("login-close-button").click();
                this.replaceLoginButton(); 
            }
        };
        $("navbar-login-button").addEventListener("click", (_) => {
            $("login").style.display = "inline-block";
        });
        $("login-close-button").addEventListener("click", (_) => {
            $("login").style.display = "none";
        });
        $("goto-register-button").addEventListener("click", (_) => {
            $("login").style.display = "none";
            $("register").style.display = "inline-block";
        });
        $("login-button").addEventListener("click", (_) => {
            $("login-error-area").innerText = "";
            let username = $("login-username").value;
            let password = $("login-password").value;
            this.submitUserCredentials(username, password, observerFunctions);
        });
    }

    /**
     * Sets up event listeners related to registration
     */
    registerEventHandlers() {
        let observerFunctions = {
            onError: (errorString) => $("register-error-area").innerText = errorString,
            onSucess: () => {
                $("register-close-button").click() 
                this.replaceLoginButton(); 
            }
        };
        $("register-close-button").addEventListener("click", (_) => {
            $("register").style.display = "none";
        });
        $("goto-login-button").addEventListener("click", (_) => {
            $("register").style.display = "none";
            $("login").style.display = "inline-block";
        });
        $("register-button").addEventListener('click', (_) => {
            let username = $("register-username").value;
            let password = $("register-password").value;
            let passwordConfirmation = $("register-password-confirmation").value;

            if (password != passwordConfirmation) {
                $("register-error-area").innerText = "Confirmação de password falhou";
            } else {
                $("register-error-area").innerText = "";
                this.submitUserCredentials(username, password, observerFunctions);
            }
        });
    }

    /**
     * Sets up event listeners related to configurations
     */
    configEventHandlers() {
        $("navbar-button-config").addEventListener("click", (_) => {
            this.syncConfigDataWithWindow();
            $("configs").style.display = "inline-block";
        });
        $("configs-close-button").addEventListener("click", (_) => this.configCloseWindow())
        $("config-save").addEventListener('click', (_) => this.onSubmitTableConfigChanges())

        let opponentOptions = document.querySelectorAll("input[name=opponent]");
        for (let i = 0; i < opponentOptions.length; i++) {
            opponentOptions[i].addEventListener('change', (e) => {
                if (e.target.value == "Human") {
                    this.hideComputerSpecificOptions();
                } else {
                    this.showComputerSpecificOptions();
                }
            });
        }
    }

    /**
     * Sets up all event listeners
     */
    setupInterfaceEventHandlers() {
        window.addEventListener('resize', () => $("header").style.width = document.body.scrollWidth + "px");

        let submitButtons = document.getElementsByClassName("custom-submit")
        for (let i = 0; i < submitButtons.length; i++) {
            submitButtons[i].addEventListener("click", (e) => e.preventDefault());
        }

        this.rulesEventHandlers();
        this.configEventHandlers();
        this.rankingsEventHandlers();
        this.loginEventHandlers();
        this.registerEventHandlers();

        let windowOpeners = document.getElementsByClassName("window-opener");
        for (let i = 0; i < windowOpeners.length; i++) {
            windowOpeners[i].addEventListener("click", (_) => $("window-background").style.display = "block");
        }

        let closeButtons = document.getElementsByClassName("close-button");
        for (let i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener("click", (_) => $("window-background").style.display = "none");
        }

        $("window-background").addEventListener("click", (_) => {
            let windows = document.getElementsByClassName("window");
            for (let i = 0; i < windows.length; i++) {
                windows[i].style.display = "none";
            }
            $("window-background").style.display = "none";
            this.hideComputerSpecificOptions();
        });
    }
}

new System();
