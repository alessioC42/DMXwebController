var express = require('express');
var app = express();

var server = require('http').createServer(app);

var io = require('socket.io')(server);

var sockets = []

io.on('connection', (socket) => {
    sockets.push(socket);

    socket.on('newState', (data) => {
        //Thinkerforge API connection
        //send Configuration to other clients
        for (let i = 0; i < sockets.length; i++) {
            const otherClient = sockets[i];
            if (otherClient != socket) {
                otherClient.emit("updateAllStates", data);
                console.log("send something to socket!")
            }
        }
    });

    socket.on("disconnect", () => {
        sockets.pop(sockets.indexOf(socket));
        console.log("client disconnected!");
    });
});


app.use('/css', express.static(__dirname + '/node_modules/bootstrap-dark-5/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js-dark', express.static(__dirname + '/node_modules/bootstrap-dark-5/dist/js'));
app.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use('/socketio', express.static(__dirname + '/node_modules/socket.io-client/dist'))

app.get("/", (_req, res) => {
    res.sendFile(__dirname + "/site/index.html");
});

app.get("/site/*", (req, res) => {
    res.sendFile(__dirname + req.path);
});

server.listen(3000);
console.log("running at: http://localhost:3000/")