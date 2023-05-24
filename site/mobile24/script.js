const socket = io();
const bs5Utils = new Bs5Utils();

const MASTER = document.getElementById("master")

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


MASTER.addEventListener("input", () => {
    update();
})


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

var chFaderList = [];

function createCHFaders() {
    let fadercontainer = document.getElementById("faders")
    for (let i = 0; i < 24; i++) {

        let input = document.createElement("input");
        input.setAttribute("type", "range");
        input.setAttribute("orient", "vertical");
        input.setAttribute("min", "0");
        input.setAttribute("max", "255");
        input.setAttribute("value", "0");
        input.setAttribute("id", `CH${i}`);
        input.style.marginLeft = "12px"
        input.style.marginRight = "12px"
        input.style.marginTop = "12px";
        input.addEventListener("input", (_ev) => {
            update();
        });
        fadercontainer.appendChild(input);
        chFaderList.push(input);

        let label = document.createElement("label");
        label.setAttribute("for", `CH${i}`);
        label.innerHTML = (i + 1) + "<br>"
        let labelLink = document.createElement("a");
        labelLink.setAttribute("href", "#");
        labelLink.setAttribute("star", "empty");
        labelLink.innerHTML = '<i class="bi bi-star"></i>'
        labelLink.onclick = (ev) => {
            if (labelLink.getAttribute("star") == "empty") {
                labelLink.innerHTML = '<i class="bi bi-star-half"></i>';
                labelLink.setAttribute("star", "half");
            } else if (labelLink.getAttribute("star") == "half") {
                labelLink.innerHTML = '<i class="bi bi-star-fill"></i>';
                labelLink.setAttribute("star", "full");
            } else {
                labelLink.innerHTML = '<i class="bi bi-star"></i>';
                labelLink.setAttribute("star", "empty");
            }
        }
        label.appendChild(labelLink);
        fadercontainer.appendChild(label);
    }
}

function update() {
    let master = MASTER.value;
    sendFaders(
        chFaderList.map(x => Math.round(x.value * master))
    )
}

createCHFaders()