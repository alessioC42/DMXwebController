const socket = io();
const bs5Utils = new Bs5Utils();

let statuselem = document.getElementById("onlinestatus");
socket.on('connect', () => {
    socket.emit("register", { "clienttype": "edit" });
    bs5Utils.Snack.show('success', 'connected to server', delay = 1500, dismissible = true);
    statuselem.style.color = "green";
    statuselem.innerHTML = `online &nbsp;<i class="bi bi-ethernet"></i>`;
});

socket.on('disconnect', () => {
    bs5Utils.Snack.show('danger', 'lost connection to server.', delay = 1500, dismissible = true);
    statuselem.style.color = "red";
    statuselem.innerHTML = `offline &nbsp;<i class="bi bi-ethernet"></i>`;
});

socket.on('disabled', () => {
    bs5Utils.Snack.show('warning', 'other user logged in', delay = 1500, dismissible = true);
    statuselem.style.color = "darkorange";
    statuselem.innerHTML = `in quene &nbsp;<i class="bi bi-ethernet"></i>`;
    MASTER.value = 0;
});

socket.on('reenabled', () => {
    bs5Utils.Snack.show('success', 'other user disconnected', delay = 1500, dismissible = true);
    statuselem.style.color = "green";
    statuselem.innerHTML = `online &nbsp;<i class="bi bi-ethernet"></i>`;
});




var lastState = []
function sendFaders(state) {
    var sameArray = (lastState.length == state.length) && lastState.every(function (element, index) {
        return element === state[index];
    });

    if (!(sameArray)) {
        lastState = state.slice();

        socket.emit("newState", {
            "state": state,
        });

        for (let i = 0; i < state.length; i++) {
            normalFadersOUT[i].value = state[i];
        }
    }
}


function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 3));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function openJSONFile(cb) {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            try {
                var content = readerEvent.target.result;
                console.log(content);
                cb(JSON.parse(content));
                console.log(JSON.parse(content))
            } catch (err) {
                console.log(err)
                bs5Utils.Snack.show('danger', 'this is not a JSON file.', delay = 1500, dismissible = true);
            }
        }
    }

    input.click();
}

function getFormattedDate(){
    let d = new Date();
    return d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
}

function exportSettings() {
    downloadObjectAsJson({
        //settings to export

    }, "DMXexport_typeTEMPLATE4_"+getFormattedDate());
}

function importSettings() {
    openJSONFile((object)=>{
        if (!(object.board == "template24")) {
            bs5Utils.Snack.show('danger', 'this file is not compatible', delay = 1500, dismissible = true);
        } else {
            
            try {
                
                //update settings

                bs5Utils.Snack.show('success', 'settings imported', delay = 1500, dismissible = true);
            } catch (err) {
                bs5Utils.Snack.show('danger', 'this file is not compatible', delay = 1500, dismissible = true);
            }
        }
    })
}