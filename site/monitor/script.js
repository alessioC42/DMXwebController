const socket = io();
const bs5Utils = new Bs5Utils();

let statuselem = document.getElementById("onlinestatus");
createFaders();
socket.on('connect', () => {
    socket.emit("register", {"clienttype":"monitor"});
    bs5Utils.Snack.show('success', 'connected to server', delay = 1500, dismissible = true);
    statuselem.style.color = "green";
    statuselem.innerHTML = `online &nbsp;<i class="bi bi-ethernet"></i>`;
});

socket.on('disconnect', () => {
    bs5Utils.Snack.show('danger', 'lost connection to server.', delay = 1500, dismissible = true);
    statuselem.style.color = "red";
    statuselem.innerHTML = `offline &nbsp;<i class="bi bi-ethernet"></i>`;
});


socket.on('newState', (data) => {
    for (let i = 0; i < data.length; i++) {
        let percentage = Math.round((data[i] / 255) * 100);
        let paddedPercentage = String(percentage).padStart(3, '0');
        document.getElementById("fader" + i).value = data[i];
        document.getElementById("percentage" + i).innerHTML = paddedPercentage + "%";
    }
});

function createFaders() {
    let tablerow = document.getElementById("tablerow");
    let percentrow = document.getElementById("percentrow");

    for (let i = 0; i < 24; i++) {
        tablerow.innerHTML += '<td><input type="range" orient="vertical" min="0" max="255" value="0" id="fader'+i+'" disabled></td>';
        percentrow.innerHTML+='<td id="percentage'+i+'">##%</td>';
    }
}
