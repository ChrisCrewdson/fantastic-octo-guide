const async = require('async');
const bottleneck = require("bottleneck");
const request = require('request-promise');

exports.get = function (req, res) {
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

const getItem = function(itemId, term, callback) {
    return request({uri: upstreamUri(itemId), json: true})
    .then(function (json) {
        // console.log(`got item id ${itemId}`);
        // console.log(`shortDescription: ${json.shortDescription.toLowerCase()}`);
        if (json.shortDescription.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
            json.longDescription.toLowerCase().indexOf(term.toLowerCase()) > -1
        ) {
            //console.log('found match');
            callback(null, itemId);
        } else {
            callback();
        }
    })
    .catch(function (err) {
        console.log(`failure getting item id ${itemId}: ${err}`);
        callback(); // Don't shortcut getting a partial search result
    });
}

const upstreamUri = function(itemId) {
    return `http://api.walmartlabs.com/v1/items/${itemId}?format=json&apiKey=kjybrqfdgp3u4yv2qzcnjndj`
}

const itemIds = [
    12662817,
    14225185,
    14225186,
    14225187,
    14225188,
    19716431,
    23117408,
    30146244,
    34890820,
    35613901,
    35813552,
    36248492,
    39082884,
    40611708,
    40611825,
    42248076,
    42391766,
    44109840
];
