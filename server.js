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

var left = 0
var right = 0
var isWorking = false;
var espClient;
var browserClient;
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
    if (request.origin == "http://rcteer.swastibhat.com") {
        clients.push(connection);
        browserClient = connection;
    } else {
        espClient = connection;
    }

    browserClient.on('message', function(message) {
        console.log(message);
        if (message.type === 'utf8') {
            var msg = JSON.parse(message.utf8Data);
            if (msg.cmd == "start") {
                isWorking = true;
            } else if (msg.cmd == "stop") {
                isWorking = false;
            } else {
                if (msg.type == "engineValue") {
                    left = Math.round(msg.left);
                    right = Math.round(msg.right);
                }
            }
        } else {
            console.log("Received some data = " + message)
        }


    });
    espClient.on('message', function(message) {
        console.log(message);
        if (message.type === 'utf8') {

            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(message.utf8Data);
            }


        } else if (message.type === 'binary') {

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