const fs = require("fs");
const stringify = require("json-stringify-pretty-compact");
const imdb = require("imdb-api");
const leftPad = require("left-pad");
const fetch = require("node-fetch");

let current = 1;
const max = 7500000;

const id = () => {
    const str = "tt" + leftPad(current, 7, 0);
    return str;
};

const fetchIMDB = () => fetch(`http://www.imdb.com/title/${id()}`)
    .then(res => res.text())
    .then(json => {
        const start = json.indexOf("\">Budget:<");
        const sample = json.slice(start + 14, start + 75).trim().replace(/ \n/g, "");
        const budget = /^[$]\d+(?:[.,]\d+)*/g.exec(sample);
        return budget || "";
    });

const fetchAPI = () => imdb.getById(`${id()}`, {apiKey: "15b45eec"});

function getMovieInfo() {
    Promise.all([
        fetchIMDB(),
        fetchAPI(),
    ]).then(response  => {
        const movie = Object.assign({}, response[1], {budget: response[0]});
        console.log(movie);
        new Promise((resolve,reject)=> {
            fs.writeFile("movies.json", stringify(movie), (err) => {
                if (err) reject(err);
                resolve(movie);
            });
        });
    });   
}

getMovieInfo();