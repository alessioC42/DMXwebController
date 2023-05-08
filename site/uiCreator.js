function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().then(() => {
                document.documentElement.style.zoom = '125%';
            });
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                document.documentElement.style.zoom = '100%';
            });
        }
    }
}

function exitFullScreen() {
    
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.documentElement.style.zoom = '100%';
    }
});

function createCHFaders() {
    let fadercontainer = document.getElementById("faders")
    for (let i = 0; i < 24; i++) {

        let output = document.createElement("input");
        output.setAttribute("type", "range");
        output.setAttribute("orient", "vertical");
        output.setAttribute("min", "0");
        output.setAttribute("max", "255");
        output.setAttribute("value", "0");
        output.setAttribute("disabled", "true");
        output.setAttribute("id", `CH_OUT${i}`);
        output.style.marginLeft = "5px";
        fadercontainer.appendChild(output);

        let input = document.createElement("input");
        input.setAttribute("type", "range");
        input.setAttribute("orient", "vertical");
        input.setAttribute("min", "0");
        input.setAttribute("max", "255");
        input.setAttribute("value", "0");
        input.setAttribute("id", `CH${i}`);
        input.style.marginLeft = "3px"
        input.style.marginRight = "5px"
        input.addEventListener("input", (_ev) => {
            update();
        });
        fadercontainer.appendChild(input);

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

function createSCENEFaders() {
    let fadercontainer = document.getElementById("faders_scenes")
    for (let i = 0; i < 10; i++) {

        let input = document.createElement("input");
        input.setAttribute("type", "range");
        input.setAttribute("orient", "vertical");
        input.setAttribute("min", "0");
        input.setAttribute("max", "1");
        input.setAttribute("step", "0.01");
        input.setAttribute("value", "0");
        input.setAttribute("id", `SCENE${i}`);

        input.addEventListener("input", (_ev) => {
            update();
        });

        input.style.marginRight = "7px";
        input.style.marginLeft = "10px";
        input.style.marginBottom = "3px"

        fadercontainer.appendChild(input);
        let label = document.createElement("label");
        label.setAttribute("for", `SCENE${i}`);
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

function createSCENEconfigFaders() {
    let fadercontainer = document.getElementById("sceneConfig_Faders")
    for (let i = 0; i < 24; i++) {
        let output = document.createElement("input");

        output.setAttribute("type", "range");
        output.setAttribute("orient", "vertical");
        output.setAttribute("min", "0");
        output.setAttribute("max", "255");
        output.setAttribute("value", "0");

        output.addEventListener("input", (_ev) => {
            updateSceneConfiguration();
            update();
        });

        output.setAttribute("id", `CH_CONFIG_SCENES${i}`);
        output.style.marginLeft = "14px";
        output.style.marginRight = "4px";
        fadercontainer.appendChild(output);

        let label = document.createElement("label");
        label.setAttribute("for", `CH_CONFIG_SCENES${i}`);
        label.innerHTML = String(i + 1) + '<br><i class="bi bi-disc"></i>';
        fadercontainer.appendChild(label)

    }
}

createCHFaders();
createSCENEFaders();
createSCENEconfigFaders();

document.getElementById("fader_master").addEventListener("input", (_ev) => {
    update();
});