/*
COMMANDS:


SCENE SCENE_NAME [9,34,123, 234]
SLEEP 10
LOADSCENE SCENE_NAME 100%
CHSET 1 255

*/

var scenes = {}

function handleLine(line, cb) {
    let lineparams = line.split(" ");


    if (lineparams[0] == "SCENE") {
        if (lineparams.lenght == 3) {
            scenes[lineparams[1]] = JSON.parse(lineparams[2])
            cb("saved scene")
        }   else {
            cb("error: the scene definition can not contain whitespaces");
        }
    }   else if (lineparams[0] == "SLEEP") {

    }   else if (lineparams[0] == "LOADSCENE") {

    }   else if (lineparams[0] == "CHSET" || lineparams[0] == "CHANNELSET") {

    }   else  {
        cb("error")
    }
}



function writeFrame(frame) {
    let framestring = JSON.stringify(frame);
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", "api/light/set?q="+framestring);
    xhttp.send();
}