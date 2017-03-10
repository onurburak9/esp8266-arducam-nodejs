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
    response.setHeader("content-Type", "multipart/x-mixed-replace; boundary=frame");
    response.useChunkedEncodingByDefault = false;
    getRequestTriggered = true;
    requestObject = response;
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    var connection = request.accept('', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('1-Received Message: ' + message.utf8Data);
            if (getRequestTriggered) {
                requestObject.write(message.utf8Data, function() {
                    console.log('Write succesful-header');
                });
            }
            connection.sendUTF("text received");
        } else if (message.type === 'binary') {
            console.log('2-Received Binary Message of ' + message.binaryData.length + ' bytes');
            if (getRequestTriggered) {
                requestObject.write(message.binaryData, function() {
                    console.log('Write succesful-image');
                });
            }
        } else {
            console.log("3-Received some data = " + message)
        }

        
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});