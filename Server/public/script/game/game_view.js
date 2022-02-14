"use strict"

import {$, plural} from '../utils/utils.js';
import { MessageNotifier } from '../utils/message-notifier.js';

export class GameView {

    constructor(initNumOfSeeds, gameModel) {
        this.gameModel = gameModel
        this.buildBoard(initNumOfSeeds);
    }

    placeSeedRandomly(seedHouse, seed) {
        seed.style.position = 'absolute';
        seed.style.top = (Math.floor(Math.random() * 60) + 20)+ '%';
        seed.style.left = (Math.floor(Math.random() * 60) + 20) + '%';
        seed.style.transform = 'rotate(' + Math.floor(Math.random() * 90) + 'deg)';
        seedHouse.appendChild(seed);
    }

    updateHouses() {
        const seed = document.createElement('div');
        seed.className = 'seed';

        for (let houseIdx = 0; houseIdx < this.gameModel.getNumOfHouses(); houseIdx++) {
            let seedHouseTopID = `seed-house-${(this.gameModel.getNumOfHouses() * 2) - (houseIdx + 1)}`;
            let seedHouseBottomID = `seed-house-${houseIdx}`;
            let seedHouseTop = $(seedHouseTopID);
            let seedHouseBottom = $(seedHouseBottomID);
            let houseTopSeeds = seedHouseTop.childElementCount;
            let houseBottomSeeds = seedHouseBottom.childElementCount;
            let newHouseTopSeeds = this.gameModel.getNumSeeds(seedHouseTopID);
            let newHouseBottomSeeds = this.gameModel.getNumSeeds(seedHouseBottomID);

            let start1 = 0;
            if (houseTopSeeds <= newHouseTopSeeds) {
                start1 = houseTopSeeds;
            } else {
                seedHouseTop.innerHTML = '';
            }
            for (let i = start1; i < newHouseTopSeeds; i++)
                this.placeSeedRandomly(seedHouseTop, seed.cloneNode(true));
            
            let start2 = 0;
            if (houseBottomSeeds <= newHouseBottomSeeds) {
                start2 = houseBottomSeeds;
            } else {
                seedHouseBottom.innerHTML = '';
            }
            
            for (let i = start2; i < newHouseBottomSeeds; i++)
                this.placeSeedRandomly(seedHouseBottom, seed.cloneNode(true));
        }

        let captureHouseLeft = $(`seed-capture-house-left`);
        let captureHouseRight = $(`seed-capture-house-right`);
        let houseLeftSeeds = captureHouseLeft.childElementCount;
        let houseRightSeeds = captureHouseRight.childElementCount;
        let newHouseLeftSeeds = this.gameModel.getNumSeeds('seed-capture-house-left');
        let newHouseRightSeeds = this.gameModel.getNumSeeds('seed-capture-house-right');

        let start1 = 0;
        if (houseLeftSeeds <= newHouseLeftSeeds) {
            start1 = houseLeftSeeds;
        } else {
            captureHouseLeft.innerHTML = '';
        }
        for (let i = start1; i < newHouseLeftSeeds; i++)
                this.placeSeedRandomly(captureHouseLeft, seed.cloneNode(true));

        let start2 = 0;
        if (houseRightSeeds <= newHouseRightSeeds) {
            start2 = houseRightSeeds;
        } else {
            captureHouseRight.innerHTML = '';
        }
        for (let i = start2; i < newHouseRightSeeds; i++)
            this.placeSeedRandomly(captureHouseRight, seed.cloneNode(true));
    }

    generateHouseTooltips() {
        for (let i = 0; i < (this.gameModel.getNumOfHouses() * 2); i++) {
            let houseID = `seed-house-${i}`;
            let nSeeds = this.gameModel.getNumSeeds(houseID);
            $(houseID).title = `${nSeeds} ${plural("semente", nSeeds)}`;
        }
        let leftCaptureHouseSeeds = this.gameModel.getNumSeeds('seed-capture-house-left');
        let rightCaptureHouseSeeds = this.gameModel.getNumSeeds('seed-capture-house-right');
        $('seed-capture-house-left').title = `${leftCaptureHouseSeeds} ${plural('semente', leftCaptureHouseSeeds)}`;
        $('seed-capture-house-right').title = `${rightCaptureHouseSeeds} ${plural('semente', rightCaptureHouseSeeds)}`;
    }

    createSeedHouse(nSeeds) {
        const seedHouse = document.createElement('div');
        seedHouse.className = "seed-house";

        const seed = document.createElement('div');
        seed.className = 'seed';

        for (let seedIdx = 0; seedIdx < nSeeds; seedIdx++) {
            this.placeSeedRandomly(seedHouse,seed.cloneNode(true));
        }

        return seedHouse;
    }

    buildBoard(initNumOfSeeds) {
        this.buildStaticBoard();
        this.buildDynamicBoard(initNumOfSeeds);
        this.generateHouseTooltips();
    }

    buildStaticBoard() {
        let boardDiv = $("game-board");
        boardDiv.style.display = "inline-flex";

        let captureHouse = document.createElement('div');
        captureHouse.className = "seed-capture-house";

        let playableHousesDiv = document.createElement('div');
        playableHousesDiv.className = "seed-playable-houses";

        let houseRow = document.createElement('div');
        houseRow.className = "seed-house-row";

        captureHouse.id = "seed-capture-house-left";
        boardDiv.appendChild(captureHouse.cloneNode(true));
        
        houseRow.id = "seed-house-row-top";
        playableHousesDiv.appendChild(houseRow.cloneNode(true));

        houseRow.id = "seed-house-row-bottom"
        playableHousesDiv.appendChild(houseRow.cloneNode(true));

        boardDiv.appendChild(playableHousesDiv);

        captureHouse.id = "seed-capture-house-right";
        boardDiv.appendChild(captureHouse.cloneNode(true));
    }

    buildDynamicBoard(initNumOfSeeds) {

        for (let houseIdx = 0; houseIdx < this.gameModel.getNumOfHouses(); houseIdx++) {
            let playableHouseTop = this.createSeedHouse(initNumOfSeeds);
            playableHouseTop.id = `seed-house-${(this.gameModel.getNumOfHouses() * 2) - (houseIdx + 1)}`;
            $("seed-house-row-top").appendChild(playableHouseTop);
            let playableHouseBottom = this.createSeedHouse(initNumOfSeeds);
            playableHouseBottom.id = `seed-house-${houseIdx}`;
            $("seed-house-row-bottom").appendChild(playableHouseBottom);
        }
    }
    
}