"use strict"


export function $(id) { return document.getElementById(id); };
export function plural(string, nElem) { return (nElem == 1) ? string : string + 's'; };
export function randSeedPlacement() { return Math.floor(Math.random() * 60) + 20;}