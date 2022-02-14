import { TableFactory } from "../utils/table-factory.js";
import { $ } from "../utils/utils.js";
import { HostData } from "../utils/conf.js";

export class RemoteRanking {
    constructor() {
        let rankingBody = $('ranking-body');
        rankingBody.style.textAlign = 'center'
        rankingBody.innerHTML = "A carregar";
    }

    fetchData() {
        fetch(`${HostData.hostname}/ranking`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then((response) => response.json())
        .then((jsonData) => this.updateUI(jsonData))
        .catch((error) => {
            $('ranking-body').innerText = "Ocorreu um erro na consulta ao servidor. Verifique a ligação à intenet";
            console.log(error);
        });
    }

    transformJSON(jsonData) {
        let dataArray = [];
        let ranking = jsonData.ranking;
        for (let i = 0; i < ranking.length; i++) {
            let curRanking = ranking[i];
            dataArray.push([curRanking.nick, curRanking.victories, curRanking.games]);
        }
        return dataArray;
    }

    updateUI(jsonData) {
        console.log(jsonData)
        let tableFactory = new TableFactory(['Utilizador', 'Vitorias', 'Jogos'], this.transformJSON(jsonData));
        $('ranking-body').innerHTML = "";
        $('ranking-body').appendChild(tableFactory.retrieveTable());
    }

    display() {
        this.fetchData();
    }
}