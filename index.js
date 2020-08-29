//requires
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 3000;

// signaling
io.on('connection', function (socket) {
    console.log('a user connected to websocket');
});

// listener
http.listen(port);