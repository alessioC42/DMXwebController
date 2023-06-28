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
    update();
});

const MASTER = document.getElementById("fader_master");

var normalFaders = [];
var normalFadersOUT = [];
var sceneFaders = [];
var sceneConfigFaders = [];
var scenes = [];
var state_blackout = Array(128).fill(0);
var state_flash = Array(128).fill(255);

for (let i = 0; i < 128; i++) {
    normalFaders.push(
        document.getElementById(`CH${i}`)
    )
}

for (let i = 0; i < 128; i++) {
    normalFadersOUT.push(
        document.getElementById(`CH_OUT${i}`)
    )
}

for (let i = 0; i < 25; i++) {
    sceneFaders.push(
        document.getElementById(`SCENE${i}`)
    )
}

for (let i = 0; i < 128; i++) {
    sceneConfigFaders.push(
        document.getElementById(`CH_CONFIG_SCENES${i}`)
    )
}

for (let i = 0; i < 25; i++) {
    scenes.push(Array(128).fill(0));
}

function update() {
    if (document.getElementById("instantApplySceneConfig").checked) {
        let selectedScene = scenes[Number(document.getElementById("selectedSceneEdit").value)];
        sendFaders(selectedScene);
    } else {
        var normalFaderValues = [];
        for (let i = 0; i < normalFaders.length; i++) {
            let range = normalFaders[i];
            normalFaderValues.push(Number(range.value));
            if (i == normalFaders.length - 1) {
                switch (document.querySelector("input[type='radio'][name='specialmode']:checked").value) {
                    case "none":
                        let sceneValues = getMaxSceneFaderValues();
                        finalValues = [];
                        for (let i = 0; i < sceneValues.length; i++) {
                            finalValues.push(
                                Math.max.apply(Math, [normalFaderValues[i], sceneValues[i]])
                            )
                        }

                        sendFaders(
                            finalValues.map(x => Math.round(x * MASTER.value)),
                            normalFaderValues
                        )
                        break;
                    case "BLACKOUT":
                        sendFaders(state_blackout, normalFaderValues);
                        break;
                    case "FLASH":
                        sendFaders(state_flash, normalFaderValues);
                        break;
                }
            }
        }
    }
}

function getMaxSceneFaderValues() {
    let maxFaderStates = Array(128).fill(0);
    for (let i = 0; i < sceneFaders.length; i++) {
        const multiplier = sceneFaders[i].value;
        for (let j = 0; j < scenes[i].length; j++) {
            const faderValue = scenes[i][j];
            let state = Math.round(faderValue * multiplier);
            if (state > maxFaderStates[j]) {
                maxFaderStates[j] = state;
            }
            if (i == sceneFaders.length - 1 && j == scenes[i].length - 1) {
                return maxFaderStates
            }
        }
    }
}



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
            bs5Utils.Snack.show('info', 'use CTRL +/- to adjust the UI', delay = 1500, dismissible = true);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            bs5Utils.Snack.show('info', 'use CTRL+ to adjust the UI', delay = 1500, dismissible = true);
        }
    }
}

function loadSceneEditorFaders() {
    let selectedScene = scenes[Number(document.getElementById("selectedSceneEdit").value)];
    for (let i = 0; i < sceneConfigFaders.length; i++) {
        sceneConfigFaders[i].value = selectedScene[i];
    }
}

function updateSceneConfiguration() {
    let selectedScene = Number(document.getElementById("selectedSceneEdit").value);
    for (let i = 0; i < sceneConfigFaders.length; i++) {
        scenes[selectedScene][i] = Number(sceneConfigFaders[i].value);
    }
}

let rangeInProgress = false;
function masterToValueInXSecs(secs, value) {
    if (rangeInProgress) return;

    rangeInProgress = true;

    let rangeValue = parseFloat(MASTER.value);
    let framecount = 42 * secs;
    let singleFrameDuration = (1000 * secs) / framecount;
    let frameSubtract = (rangeValue - value) / framecount;

    let a = setInterval(() => {
        rangeValue -= frameSubtract;
        MASTER.value = rangeValue.toFixed(2);

        if (Math.abs(rangeValue - value) <= 0.01) {
            rangeInProgress = false;
            MASTER.value = value;
            clearInterval(a);
        }
        update();
    }, singleFrameDuration);
}


let sceneFaderRangesInProgress = {};

function crossRangeToValuesInXSecs(rangeID_a, rangeID_b, value_a, value_b, secs) {
    if (rangeID_a == rangeID_b) {
        bs5Utils.Snack.show('danger', 'error while sliding two faders', delay = 1500, dismissible = true);
        return;
    }
    if (sceneFaderRangesInProgress[rangeID_a] || sceneFaderRangesInProgress[rangeID_b]) return;

    sceneFaderRangesInProgress[rangeID_a] = true;
    sceneFaderRangesInProgress[rangeID_b] = true;

    let range_a = document.getElementById(rangeID_a);
    let range_b = document.getElementById(rangeID_b);

    let rangeValue_a = parseFloat(range_a.value);
    let rangeValue_b = parseFloat(range_b.value);

    let framecount = 42 * secs;
    let singleFrameDuration = (1000 * secs) / framecount;

    let frameSubtract_a = (rangeValue_a - value_a) / framecount;
    let frameSubtract_b = (rangeValue_b - value_b) / framecount;

    let a = setInterval(() => {
        rangeValue_a -= frameSubtract_a;
        rangeValue_b -= frameSubtract_b;

        range_a.value = rangeValue_a.toFixed(2);
        range_b.value = rangeValue_b.toFixed(2);

        if (Math.abs(rangeValue_a - value_a) <= 0.01 && Math.abs(rangeValue_b - value_b) <= 0.01) {
            sceneFaderRangesInProgress[rangeID_a] = false;
            sceneFaderRangesInProgress[rangeID_b] = false;
            range_a.value = value_a;
            range_b.value = value_b;
            clearInterval(a);
        }
        update();
    }, singleFrameDuration);
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
                bs5Utils.Snack.show('danger', 'this file is not compatible', delay = 1500, dismissible = true);
            }
        }
    }

    input.click();
}

function getFormattedDate() {
    let d = new Date();
    return d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
}

function exportSettings() {
    downloadObjectAsJson({
        board: "easy128",
        master: Number(MASTER.value),
        sceneFaders: sceneFaders.map(x => Number(x.value)),
        normalFaders: normalFaders.map(x => Number(x.value)),
        scenes: scenes

    }, "DMXexport_typeeasy128_" + getFormattedDate());
}

function importSettings() {
    openJSONFile((object) => {
        if (!(object.board == "easy128")) {
            bs5Utils.Snack.show('danger', 'this file is not compatible', delay = 1500, dismissible = true);
        } else {

            try {
                MASTER.value = object.master;
                for (let i = 0; i < object.sceneFaders.length; i++) {
                    sceneFaders[i].value = object.sceneFaders[i];
                }
                for (let i = 0; i < object.normalFaders.length; i++) {
                    normalFaders[i].value = object.normalFaders[i];
                }
                scenes = object.scenes;
                update();
                bs5Utils.Snack.show('success', 'settings imported', delay = 1500, dismissible = true);
            } catch (err) {
                bs5Utils.Snack.show('danger', 'this file is not compatible', delay = 1500, dismissible = true);
            }
        }
    })
}

document.getElementById("fade_out_button").addEventListener("click", () => {
    masterToValueInXSecs(
        Number(document.getElementById("fade_out_secs").value),
        0
    );
    update();
});
document.getElementById("fade_in_button").addEventListener("click", () => {
    masterToValueInXSecs(
        Number(document.getElementById("fade_in_secs").value),
        Number(document.getElementById("fade_in_percentage").value / 100)
    );
    update();
})
document.getElementById("fast_change_0_button").addEventListener("click", () => {
    MASTER.value = document.getElementById("fast_change_0_percentage").value / 100;
    update();
});
document.getElementById("fast_change_1_button").addEventListener("click", () => {
    MASTER.value = document.getElementById("fast_change_1_percentage").value / 100;
    update();
})
document.getElementById("fast_change_random_button").addEventListener("click", () => {
    MASTER.value = Math.random().toFixed(2);
    update();
});

document.getElementById("cross_fade_button").addEventListener("click", () => {
    crossRangeToValuesInXSecs(
        `SCENE${document.getElementById("cross_fade_scene_a").value}`,
        `SCENE${document.getElementById("cross_fade_scene_b").value}`,
        document.getElementById("cross_fade_value_scene_a").value / 100,
        document.getElementById("cross_fade_value_scene_b").value / 100,
        document.getElementById("cross_fade_secs").value
    )
})

var flicker_active = false;
var flicker_init_value = null;
var flicker_intervall = null;
var button_flicker_toggle = document.getElementById("button_flicker_toggle")
button_flicker_toggle.addEventListener("click", () => {
    if (flicker_active) {
        clearInterval(flicker_intervall);
        MASTER.value = flicker_init_value;
        flicker_init_value = 0;
        flicker_active = false;
        button_flicker_toggle.innerText = "FLICKER: OFF";
        update();
    } else {
        flicker_init_value = MASTER.value;
        flicker_intervall = setInterval(
            () => {
                setTimeout(()=> {MASTER.value = Math.random()},Math.random() * 100);
                update();
            }
            , 100);
        flicker_active = true;
        button_flicker_toggle.innerText = "FLICKER: ON"
    }
});

$('#sceneEditModal').on('hide.bs.modal', (e) => {
    document.getElementById("instantApplySceneConfig").checked = false;
    update();
});

$('#sceneEditModal').on('show.bs.modal', (e) => {
    document.getElementById("instantApplySceneConfig").checked = false;
    update();
});