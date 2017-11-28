const fs = require("fs");
const stringify = require("json-stringify-pretty-compact");
const imdb = require("imdb-api");
const leftPad = require("left-pad");
const fetch = require("node-fetch");

let current = 1;
const max = 7500000;

const id = (i) => {
    const str = "tt" + leftPad(i, 7, 0);
    return str;
};

const fetchIMDB = (index) => {
    return fetch(`http://www.imdb.com/title/${id(index)}`)
        .then(res => res.text())
        .then(json => {
            const start = json.indexOf("\">Budget:<");
            const sample = json.slice(start + 14, start + 75).trim().replace(/ \n/g, "");
            const budget = /^[$]\d+(?:[.,]\d+)*/g.exec(sample);
            return budget || "";
        });
};

const fetchAPI = (index) => {
    return imdb.getById(`${id(index)}`, {apiKey: "15b45eec"});
};

function getMovieInfo(i) {
    console.log(id(i));
    return Promise.all([
        fetchIMDB(i),
        fetchAPI(i),
    ]).then(response  => {
        const movie = Object.assign({}, response[1], {budget: response[0]});
        new Promise((resolve,reject)=> {
            fs.writeFile(`movies${i}.json`, stringify(movie), (err) => {
                if (err) reject(err);
                resolve(movie);
            });
        });
        getMovieInfo(i + 1);
    });   
}

getMovieInfo(14);