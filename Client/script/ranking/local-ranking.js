/*
    This class provides local ranking using the webstorage API
*/

import { $ } from "../utils/utils.js"
import { TableFactory } from "../utils/table-factory.js";

export class LocalRanking {
    static Winner = Object.freeze({COMPUTER: 'Computador', PLAYER: 'Humano'});

    constructor() {
        if (localStorage.getItem('rankings') == null) {
            this.rankings = [];
        } else {
            this.rankings = JSON.parse(localStorage.getItem('rankings'));
        }
        if (!Array.isArray(this.rankings)) {
            console.log('Found invalid ranking data!', this.rankings);
            this.rankings = [];
        }
        this.backupJobId = window.setInterval(this._backupRankingData, 300000);
        document.addEventListener('visibilitychange', (_) => this._backupRankingData());
        document.addEventListener('beforeunload', (_) => this._backupRankingData());
    }

    /**
     * Save rankings in webstorage
     */
    _backupRankingData() {
        localStorage.setItem('rankings', JSON.stringify(this.rankings))
    }

    /**
     * Inserts entry into rankings
     * 
     * @param {Object} rankingObj 
     */
    insertRanking(rankingObj) {
        let sortFn = (elm1, elm2) => {
            return (elm2.score - elm1.score); 
        }
        if (this.rankings.length < 10) {
            this.rankings.push(rankingObj);
        } else if (rankingObj.score >= this.rankings[this.rankings.length - 1].score) {
            this.rankings.pop();
            this.rankings.push(rankingObj);
        }
        this.rankings.sort(sortFn);
    }


    /** 
     * Displays local rankings
     */
    display() {
        if (this.rankings.length == 0) {
            $('ranking-body').innerHTML = "Não há pontuações, tente jogar um jogo.";
        } else {
            let tableFactory = new TableFactory(['Vencedor', 'Tamanho do Tabuleiro', 'Pontuação'], this.rankings.map((ranking) => {
                return [ranking.winner, ranking.boardSize, ranking.score];
            }));
            $('ranking-body').innerHTML = "";
            $('ranking-body').appendChild(tableFactory.retrieveTable());
        }
    }
}