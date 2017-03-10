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
var server = app.listen(8080, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Node Js app listening at http://" + host + port);
});

//-- serves static files
app.use('/', express.static("html"));

app.get('/viewImage', function(request, response) {
    console.log("Request received from : /viewImage");
    //response.setHeader("content-Type", "multipart/x-mixed-replace; boundary=--frame\r\n\r\n");
    response.writeHead(200, {
            'Connection': 'Close',
            'Expires': '-1',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0, false',
            'Pragma': 'no-cache',
            'Content-Type': 'multipart/x-mixed-replace; boundary=frameFRAMEframe'
        });
    response.useChunkedEncodingByDefault = false;
    getRequestTriggered = true;
    requestObject = response;
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
});

wsServer.on('request', function(request) {


    var connection = request.accept('', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('1-Received Message: ' + message.utf8Data);
            if (getRequestTriggered) {
                //requestObject.write("--frame\r\n");
                requestObject.write("\r\n");
                console.log(requestObject.write(message.utf8Data, function() {
                    console.log('Write succesful-header');
                    connection.sendUTF("MERABA");

                }))
            }
            connection.sendUTF("text received");
        } else if (message.type === 'binary') {
            console.log('2-Received Binary Message of ' + message.binaryData.length + ' bytes');
            if (getRequestTriggered) {
                console.log(requestObject.write(message.binaryData, function() {
                    console.log('Write succesful-image');
                }))
            }
        } else {
            console.log("3-Received some data = " + message)
        }


    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});