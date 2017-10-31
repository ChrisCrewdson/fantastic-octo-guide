const async = require('async');
const bottleneck = require("bottleneck");
const request = require('request-promise');

exports.get = function (req, res) {
    var limiter = new bottleneck(1, 1000);

    return getItem(1, req.query.title, function (json) {
        //pull out additional pages

        var page_numbers = Array.apply(null, Array(json.total_pages)).map(function (_, i) {return i;});

        async.mapSeries(page_numbers, function(page, title, callback) {
            limiter.schedule(getItem, page, title, callback);
        },
        function(err, mapRes) {
            if (err) {
                console.log(err);
            }
            return res(mapRes);
        })
    });
}

const getItem = function(page, title, callback) {
    return request({uri: upstreamUri(title, page), json: true})
    .then(function (json) {
        var results = [];
        // console.log(`got item id ${itemId}`);
        json.data.forEach((movie) => {
            results.push(movie.Title);
        });
        callback(null, results);
    })
    .catch(function (err) {
        console.log(`failure getting page ${page}: ${err}`);
        callback(); // Don't shortcut getting a partial search result
    });
}

const upstreamUri = function(title, page) {
    return `https://jsonmock.hackerrank.com/api/movies/search?title=${title}&page=${page}`
}
