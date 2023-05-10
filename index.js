const express = require('express');
const fs = require("fs");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const basicAuth = require("express-basic-auth");
const Tinkerforge = require('tinkerforge');

const config = JSON.parse(fs.readFileSync("config.json"))
console.log(config)
var writeFrame = () => { }

var ipcon = new Tinkerforge.IPConnection();
var dmx = new Tinkerforge.BrickletDMX(config.tinkerforge.uid, ipcon);

ipcon.connect(config.tinkerforge.host, config.tinkerforge.port,
    (err) => {
        console.error('Tinkerforge error: ' + err);
    }
);

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    (_connectReason) => {
        dmx.setDMXMode(Tinkerforge.BrickletDMX.DMX_MODE_MASTER);

        writeFrame = (frame) => {
            dmx.writeFrame(frame);
        }
    }
);

var sockets = []

io.on('connection', (socket) => {
    sockets.push(socket);
    if (sockets.indexOf(socket) != 0) {
        socket.emit("disabled");
    }

    socket.on('newState', (data) => {
        if (sockets[0] == socket) {
            writeFrame(data.state);
            //mb send configs to clients in quene?
        }
    });

    socket.on("disconnect", () => {
        let index = sockets.indexOf(socket);
        sockets.splice(index, 1);
        if (index == 0) {
            if (sockets[0]) {
                sockets[0].emit("reenabled");
            }
        }
    });
});


app.use('/css', express.static(__dirname + '/node_modules/bootstrap-dark-5/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js-dark', express.static(__dirname + '/node_modules/bootstrap-dark-5/dist/js'));
app.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/socketio', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/bs5utils', express.static(__dirname + '/node_modules/bs5-utils/dist/js/'));
if (config.usepwd) {
    app.use(basicAuth({
        users: config.logins,
        challenge: true,
        unauthorizedResponse: "<body bgcolor='black' style='color:white'><h1 >DMXwebController</h1><p>Wrong Password!\nYou cannot connect to this site</p><a href='https://github.com/alessioC42/DMXwebController'>github project</a></body>"
    }))
}



app.get("/", (_req, res) => {
    res.sendFile(__dirname + "/site/index.html");
});

app.get("/site/*", (req, res) => {
    res.sendFile(__dirname + req.path);
});

server.listen(3000);
console.log("running at: http://localhost:3000/");


process.on('SIGINT', function () {
    console.log('Exit...');
    server.close();
    ipcon.disconnect();
    process.exit();
});