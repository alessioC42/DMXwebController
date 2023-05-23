const express = require('express');
const fs = require("fs");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const basicAuth = require("express-basic-auth");
const Tinkerforge = require('tinkerforge');

const config = JSON.parse(fs.readFileSync("config.json"))

var writeFrame = (frame) => {
    console.log( "NO OUT: \n"+
        translateFader(frame)
    )
}

var ipcon = new Tinkerforge.IPConnection();
var dmx = new Tinkerforge.BrickletDMX(config.tinkerforge.uid, ipcon);

ipcon.connect(config.tinkerforge.host, config.tinkerforge.port,
    (err) => {
        console.error('Tinkerforge error: ' + err);
    }
);

function translateFader(frame) {
    let newFrame = [];
    for (let i = 0; i < frame.length; i++) {
        
        let newindex = config.translate[String(i)];
        if (newindex < frame.length) {
            newFrame.push(frame[newindex]);
        } else {
            newFrame.push(frame[i]);
        }
        
        if(i == frame.length-1) {
            console.log(i)
            return newFrame
        }
    }
}

// based on Tinkerforge example at https://www.tinkerforge.com/en/doc/Software/IPConnection_JavaScript.html
if (config.tinkerforge.secret.use_secret) {
    ipcon.setAutoReconnect(false);

    ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
        (connectReason) => {
            switch (connectReason) {
                case Tinkerforge.IPConnection.CONNECT_REASON_REQUEST:
                    console.log('Tinkerforge: Connected by request');
                    dmx.setDMXMode(Tinkerforge.BrickletDMX.DMX_MODE_MASTER);
                    writeFrame = (frame) => {
                        dmx.writeFrame(translateFader(frame));
                        dmx.setStatusLEDConfig(2, (_err) => { });
                    }

                    break;
                case Tinkerforge.IPConnection.CONNECT_REASON_AUTO_RECONNECT:
                    console.log('Tinkerforge: Auto-Reconnected');
                    writeFrame = (frame) => {
                        dmx.writeFrame(translateFader(frame));
                        dmx.setStatusLEDConfig(2, (_err) => { });
                    }
                    break;
            }
            ipcon.authenticate(config.tinkerforge.secret.secret,
                function () {
                    console.log('Tinkerforge: Authentication succeeded');

                    ipcon.setAutoReconnect(true);

                    ipcon.enumerate();
                },
                function (error) {
                    console.log('Tinkerforge: Could not authenticate: ' + error);
                }
            );
        }
    );

} else {
    ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
        (_connectReason) => {
            dmx.setDMXMode(Tinkerforge.BrickletDMX.DMX_MODE_MASTER);

            writeFrame = (frame) => {
                dmx.writeFrame(frame);
            }
        }
    );
}



var sockets = [];
var monitors = [];

io.on('connection', (socket) => {
    socket.on("register", (data) => {
        if (data.clienttype == "edit") {
            sockets.push(socket);
            if (sockets.indexOf(socket) != 0) {
                socket.emit("disabled");
            }

            socket.on('newState', (data) => {
                if (sockets[0] == socket) {
                    writeFrame(data.state);

                    monitors.map(x => x.emit("newState", data.state));
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
        } else if (data.clienttype == "monitor") {
            monitors.push(socket);
            socket.on("disconnect", () => {
                monitors.splice(monitors.indexOf(socket), 1);
            });
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
if (config.webserver.usepwd) {
    app.use(basicAuth({
        users: config.webserver.logins,
        challenge: true,
        unauthorizedResponse: "<body bgcolor='black' style='color:white'><h1 >DMXwebController</h1><p>Wrong Password!\nYou cannot connect to this site</p><a href='https://github.com/alessioC42/DMXwebController'>github project</a></body>"
    }))
}



app.get("/", (_req, res) => {
    res.sendFile(__dirname + "/site/easy24/index.html");
});

app.get("/site/*", (req, res) => {
    res.sendFile(__dirname + req.path);
});

server.listen(config.webserver.port);
console.log("running at: http://localhost:" + config.webserver.port + "/");


process.on('SIGINT', function () {
    console.log('Exit...');
    server.close();
    ipcon.disconnect();
    process.exit();
});