const hapi = require('hapi');
const search = require('./routes/search');

// Create a server with a host and port
const server = new hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

// Add the routes
server.route({
    method: 'GET',
    path: '/search',
    handler: search.get
});

// Start the server
server.start((err) => {
    if (err) { throw err; }
    console.log(`Server running at: ${server.info.uri}`);
});
