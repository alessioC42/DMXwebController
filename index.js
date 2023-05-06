var express = require('express');
var app = express();


app.use('/css', express.static(__dirname + '/node_modules/bootstrap-dark-5/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));



app.get("/", (_req, res) => {
    res.sendFile(__dirname + "/site/index.html");
});

app.get("/site/*", (req, res) => {
    res.sendFile(__dirname + req.path);
});

var server = app.listen(3000, () => {
   var port = server.address().port
   
   console.log("Example app listening at http://localhost:%s", port)
})
