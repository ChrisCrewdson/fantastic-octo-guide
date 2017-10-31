const async = require('async');
const request = require('request-promise');
const _ = require('lodash');

exports.get = function (req, res) {
    return request({uri: upstreamUri(req.query.title, 1), json: true})
    .then(function (json) {
        
        var results = [];
        json.data.forEach((movie) => {
            results.push(movie.Title);
        });

        if (json.total_pages <= 1) {
            return res(results)
        } else {
            console.log(`will get ${json.total_pages} pages`)
            var page_numbers = _.range(2, json.total_pages + 1)

            async.map(
                page_numbers,
                function(page, callback) {
                    return request({uri: upstreamUri(req.query.title, page), json: true})
                    .then(function (json) {
                        var results = [];

                        json.data.forEach((movie) => {
                            results.push(movie.Title);
                        });
                        callback(null, results);
                    })
                },
                function(err, mapRes) {
                    if (err) {
                        console.log(err);
                    }
                    mapRes.forEach((pageResult)=> {
                        pageResult.forEach((title) => {
                            results.push(title);
                        });
                    });

                    return res([...new Set(results)].sort());
                }
            );
        }
    });
}

const upstreamUri = function(title, page) {
    return `https://jsonmock.hackerrank.com/api/movies/search?title=${title}&page=${page}`
}
