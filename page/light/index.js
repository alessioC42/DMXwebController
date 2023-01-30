var values = JSON.stringify([255, 255, 255, 4])

var xhttp = new XMLHttpRequest()
xhttp.open("GET", "/api/light/set?q="+values)
xhttp.send()