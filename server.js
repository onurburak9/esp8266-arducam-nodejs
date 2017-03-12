var WebSocketServer = require('websocket').server;
var http = require('http');
//require the express nodejs module
var express = require('express');
//set an instance of exress
var app = express();

var viewImageResponseObject;
var firstFrameHeaderSent = false;
var getRequestTriggered = false;
var requestObject;

/*
 *   start server
 */
var server = app.listen(8081, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Node Js app listening at http://" + host + port);
});

//-- serves static files
app.use('/', express.static("html"));

app.get('/viewImage', function(request, response) {
    console.log("Request received from : /viewImage");
    response.setHeader("content-Type", "multipart/x-mixed-replace; boundary=frameFRAMEframe\r\n\r\n");
    response.useChunkedEncodingByDefault = false;
    getRequestTriggered = true;
    requestObject = response;
});
app.get('/getValues', function(req, res) {
    if (isWorking)
        res.send({
            left: left,
            right: right
        });
    else
        res.send({
            left: 0,
            right: 0
        });
});
app.get('/reset', function(req, res) {
            left = 0;
            right = 0;

            res.send({
                code: 200,
                message: 'SUCCESS'
            });
        });

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
var clients = [];
wsServer.on('request', function(request) {


    var connection = request.accept('', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    if (request.origin == "http://rcteer.swastibhat.com")
        clients.push(connection);
    connection.on('message', function(message) {
        var msg = JSON.parse(message);
        console.log(msg);
        if (message.type === 'utf8') {
            // console.log('1-Received Message: ' + message.utf8Data);
            //requestObject.write("--frame\r\n");
            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(message.utf8Data);
            }

            connection.sendUTF("text received");
        } else if (message.type === 'binary') {
            //console.log('2-Received Binary Message of ' + message.binaryData.length + ' bytes');

            for (var i = 0; i < clients.length; i++) {
                clients[i].sendBytes(message.binaryData);
            }

        } else {
            console.log("3-Received some data = " + message)
        }


    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});