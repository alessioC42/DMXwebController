const express = require('express');
const tinkerforge = require("tinkerforge");
const fs = require("fs");
const app = express();
const basicAuth = require('express-basic-auth');
const SETTINGS = require("./SETTINGS.json");


var dmxChannels = [];
var blackout = false;
var ipcon = new tinkerforge.IPConnection(); // Create IP connection
var dmx = new tinkerforge.BrickletDMX(SETTINGS.TINKERFORGE.UID, ipcon); // Create device object

ipcon.connect(SETTINGS.TINKERFORGE.IP, SETTINGS.TINKERFORGE.PORT,
    function (error) {
        console.log('Tinkerforge Error: ' + error);
    }
);

ipcon.on(tinkerforge.IPConnection.CALLBACK_CONNECTED, () => {
        dmx.setDMXMode(tinkerforge.BrickletDMX.DMX_MODE_MASTER);

        dmx.writeFrame([0]);
    }
);

app.use(basicAuth({
    users: SETTINGS.USER_LOGIN,
    challenge: true
}));

app.use('/page', express.static(__dirname + '/page'));


app.get("/", (_req, res) => {
    res.sendFile(__dirname + "/page/index/index.html", (_err)=>{
        res.end()
    })
})

app.get("/api/light/set", (req, res) => {
    try {
        let  values = JSON.parse(req.query.q);
        if(values.every((elem) => elem <= 255 && 0 <= elem)) {
            if(values.length <= 512) {
                dmx.writeFrame(values, ()=>{
                    dmxChannels = values;
                    res.end("set frame.");
                });
            }   else    {
                res.end("error. The maximum amout of channels is 512.");
            }
        }   else    {
            res.end("error. The accepted range for values is 0 - 255.");
        }
    }
    catch (error){
        res.end("error. \n"+String(error))
    }
});

app.get("/api/light/get", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(dmxChannels));
});

app.get("/api/light/blackout", (req, res)=> {
    try {
        let calcNewState = (q) => {
            if (q == "true") {
                return true;
            }   else if (q == "false") {
                return false;
            }   else {
                throw Error("the submitted value has to be 'true' or 'false'")
            }
        }
        let newstate = calcNewState(req.query.q) 
        if (newstate) {
            dmx.writeFrame([])
        }   else {
            dmx.writeFrame(dmxChannels)
        }
        blackout = newstate;
        res.end(String(blackout))
        
    }   catch (error) {
        res.end(String(blackout))
    }
});


app.get("/exit", (req, res) => {
    console.log("exit...");
    ipcon.disconnect();
    process.exit(0);
});

app.listen(SETTINGS.PORT);
console.log("Running on Port " + String(SETTINGS.PORT));
