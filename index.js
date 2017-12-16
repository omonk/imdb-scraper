const fs = require("fs");
const stringify = require("json-stringify-pretty-compact");
const imdb = require("imdb-api");
const leftPad = require("left-pad");
const fetch = require("node-fetch");

let current = 1;
const max = 7500000;
const range = 100;
const timeoutLimit = 1000;

// const fetchIMDB = (index) => {
//     return fetch(`http://www.imdb.com/title/${id(index)}`)
//         .then(res => res.text())
//         .then(json => {
//             const start = json.indexOf("\">Budget:<");
//             const sample = json.slice(start + 14, start + 75).trim().replace(/ \n/g, "");
//             const budget = /^[$]\d+(?:[.,]\d+)*/g.exec(sample);
//             return budget || "";
//         });
// };

const id = (i) => {
    const str = "tt" + leftPad(i, 7, 0);
    return str;
};


const fetchAPI = (index) => {
    console.time(`${index}`);
    return imdb.getReq({
        id: `${id(index)}`,
        opts: {
            apiKey: "f8b951c9",
            timeout: timeoutLimit
        }
    }).then((res) => {
        console.timeEnd(`${index}`);
        return res;
    }).catch(err => {
        console.log(`REQEUST TIMEOUT: ${index}`);
        fs.appendFileSync("error.txt", `${index}\n`);
        return {
            id: index,
            message: "timeout",
        };
    });
};

function getMovieInfo(index) {
    return Promise.all(
        Array.from({ length: range }).map((v, i) => fetchAPI(i + index))
    )
        .then(response  => {
            const movie = response;
            new Promise((resolve,reject)=> {
                fs.writeFile(`movies${index}.json`, stringify(movie), (err) => {
                    if (err) reject(err);
                    if (index % 1000 - 1 === 0) {
                        console.log(`
                        
                        
                        THOUSAND
                        
                        
                        `);
                        console.timeEnd("thousand timer");
                    }
                    resolve(movie);
                });
            });
            console.time("thousand timer");
            getMovieInfo(index + range);
        }).catch(err => console.log(err));
}

console.time("thousand timer");
getMovieInfo(current);

// function requestLogger(httpModule){
//     var original = httpModule.request;
//     httpModule.request = function(options, callback){
//         console.log(options.href||options.proto+"://"+options.host+options.path, options.method);
//         return original(options, callback);
//     };
// }

// requestLogger(require("http"));
