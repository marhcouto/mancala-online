/*
    This module builds a table based on data lists
*/

export class TableFactory {
    constructor(headers, data) {
        this._table = document.createElement('table');
        if (headers != null) {
            this.insertRow(headers.map((elm) => {
                    let headerElm = document.createElement('th');
                    headerElm.innerText = elm;
                    return headerElm;
                })
            );
        }
        for(let i = 0; i < data.length; i++) {
            this.insertRow(this.transformIntoData(data[i]));
        }
    }

    transformIntoData(elements) {
        return elements.map((elm) => {
            let newElm = document.createElement('td');
            newElm.innerText = elm;
            return newElm;
        });
    }

    insertRow(elements) {
        let newRow = document.createElement('tr');
        for (let i = 0; i < elements.length; i++) {
            newRow.appendChild(elements[i].cloneNode(true));
        }
        this._table.appendChild(newRow);
    }

    retrieveTable() {
        return this._table;
    }
}