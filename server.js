'use strict';

const async = require('async');
const bottleneck = require("bottleneck");
const hapi = require('hapi');
const request = require('request-promise');

const upstreamUri = function(itemId) {
    return `http://api.walmartlabs.com/v1/items/${itemId}?format=json&apiKey=kjybrqfdgp3u4yv2qzcnjndj`
}

const itemIds = [
    14225185,
    14225186,
    14225188,
    14225187,
    39082884,
    30146244,
    12662817,
    34890820,
    19716431,
    42391766,
    35813552,
    40611708,
    40611825,
    36248492,
    44109840,
    23117408,
    35613901,
    42248076
];

const getItem = function(itemId, term, callback) {
    return request({uri: upstreamUri(itemId), json: true})
    .then(function (json) {
        console.log('got item id ' + itemId);
        if (json.shortDescription.indexOf(term) > -1){
            console.log('found match');
            callback(null, itemId);
        } else {
            callback();
        }
    })
    .catch(function (err) {
        console.log('failure getting item id ' + itemId + ' ' + err);
        callback(); // Don't shortcut getting a partial search result
    });
}

// Create a server with a host and port
const server = new hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

// Add the route
server.route({
    method: 'GET',
    path:'/search',
    handler: function (req, res) {
        var limiter = new bottleneck(1, 1000);

        async.mapSeries(itemIds, function(itemId, callback) {
            limiter.schedule(getItem, itemId, req.query.term, callback);
        },
        function(err, mapRes) {
            if (err) {
                console.log(err);
            }
            return res(mapRes.filter(function(current){
                return current != null;
            }));
        })
    }
});

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});