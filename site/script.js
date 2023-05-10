var socket = io();

socket.on('connect', () => {
    console.log("conected to socketio")
});

socket.on('disconnect', () => {
    console.log("disconnected from socketio")
});

socket.on("updateAllStates", (data) => {
    for (let i = 0; i < normalFadersOUT.length; i++) {
        normalFadersOUT[i].value = data.state[i]
    }
    for (let i = 0; i < normalFaders.length; i++) {
        normalFaders[i].value = data.faderValues[i];
    }
    scenes = data.scenes.slice();
    MASTER.value = data.master;
});

const MASTER = document.getElementById("fader_master");

var normalFaders = [];
var normalFadersOUT = [];
var sceneFaders = [];
var sceneConfigFaders = [];
var scenes = [];
var state_blackout = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var state_flash = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];

for (let i = 0; i < 24; i++) {
    normalFaders.push(
        document.getElementById(`CH${i}`)
    )
}

for (let i = 0; i < 24; i++) {
    normalFadersOUT.push(
        document.getElementById(`CH_OUT${i}`)
    )
}

for (let i = 0; i < 10; i++) {
    sceneFaders.push(
        document.getElementById(`SCENE${i}`)
    )
}

for (let i = 0; i < 24; i++) {
    sceneConfigFaders.push(
        document.getElementById(`CH_CONFIG_SCENES${i}`)
    )
}

for (let i = 0; i < 10; i++) {
    scenes.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
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
    let maxFaderStates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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

function sendFaders(state, normalFaderValues) {

    var sameArray = (lastState.length == state.length) && lastState.every(function (element, index) {
        return element === state[index];
    });

    if (!(sameArray)) {
        lastState = state.slice();

        socket.emit("newState", {
            "state": state,
            "scenes": scenes,
            "faderValues": normalFaderValues,
            "master": MASTER.value
        });

        console.log(state);
        for (let i = 0; i < state.length; i++) {
            normalFadersOUT[i].value = state[i];
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

$('#sceneEditModal').on('hide.bs.modal', (e) => {
    document.getElementById("instantApplySceneConfig").checked = false;
    update();
})

$('#sceneEditModal').on('show.bs.modal', (e) => {
    document.getElementById("instantApplySceneConfig").checked = false;
    update();
});