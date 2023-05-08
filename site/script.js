const MASTER = document.getElementById("fader_master");

var normalFaders = [];
var normalFadersOUT = [];
var sceneFaders = [];
var sceneConfigFaders = [];
var scenes = [];

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

for (let i = 0; i < 10; i++) {
    sceneConfigFaders.push(
        document.getElementById(`CH_CONFIG_SCENES${i}`)
    )
}

for (let i = 0; i < 10; i++) {
    scenes.push([140,0,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
}

function update() {
    //get All Fader Values
    var normalFaderValues = [];
    
    for (let i = 0; i < normalFaders.length ;i++) {
        let range = normalFaders[i];
        normalFaderValues.push(range.value);

        if (i == normalFaders.length -1) {
            //got all Fader Values in "normalFaderValues"

            let sceneValues = getMaxSceneFaderValues();

            finalValues = [];
            for (let i = 0; i < sceneValues.length; i++) {
                finalValues.push(
                    Math.max.apply(Math, [normalFaderValues[i], sceneValues[i]])
                )
            }

            sendFaders(
                finalValues.map(x => Math.round(x * MASTER.value))
            )
        }
    }
}

function getMaxSceneFaderValues() {
    let maxFaderStates = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (let i = 0; i < sceneFaders.length; i++) {
        const multiplier = sceneFaders[i].value;
        for (let j = 0; j < scenes[i].length; j++) {
            const faderValue = scenes[i][j];
            let state = Math.round(faderValue * multiplier);
            if (state > maxFaderStates[j]) {
                maxFaderStates[j] = state;
            }
            if (i == sceneFaders.length-1 && j == scenes[i].length -1){
                return maxFaderStates
            }
        }
    }
}

function sendFaders(state) {
    //socketio shit
    console.log(state);
    for (let i = 0; i < state.length; i++) {
        normalFadersOUT[i].value = state[i];
    }
}


function loadSceneEditorFaders() {
    let selectedScene = scenes[Number(document.getElementById("selectedSceneEdit").value)];
    for (let i = 0; i < sceneConfigFaders.length; i++) {
        sceneConfigFaders[i].value = selectedScene[i]
    }
}


//setInterval(update, 50)