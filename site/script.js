var faders = {}

function createFaders() {
    let fadercontainer = document.getElementById("faders")
    for (let i = 0; i < 24; i++) {
        
        let input = document.createElement("input");
        input.setAttribute("type", "range");
        input.setAttribute("class", "input-range");
        input.setAttribute("orient", "vertical");
        input.setAttribute("min", "0");
        input.setAttribute("max", "255");
        input.setAttribute("value", "0");
        input.setAttribute("id", `s${i}`);
        fadercontainer.appendChild(input);
        let label = document.createElement("label");
        label.setAttribute("for", `s${i}`);
        label.innerHTML = (i+1)+"<br>"
        let labelLink = document.createElement("a");
        labelLink.setAttribute("href", "#");
        labelLink.setAttribute("star", "empty");
        labelLink.innerHTML = '<i class="bi bi-star"></i>'
        labelLink.onclick = (ev) => {
            if  (labelLink.getAttribute("star") == "empty") {
                labelLink.innerHTML = '<i class="bi bi-star-half"></i>';
                labelLink.setAttribute("star", "half");
            }   else if (labelLink.getAttribute("star") == "half") {
                labelLink.innerHTML = '<i class="bi bi-star-fill"></i>';
                labelLink.setAttribute("star", "full");
            }   else  {
                labelLink.innerHTML = '<i class="bi bi-star"></i>';
                labelLink.setAttribute("star", "empty");
            }
        }
        label.appendChild(labelLink);
        fadercontainer.appendChild(label);
    }
}
createFaders();

