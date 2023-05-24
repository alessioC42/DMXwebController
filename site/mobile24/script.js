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
