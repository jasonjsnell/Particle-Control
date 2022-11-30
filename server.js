//setup
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//create http server (needed for socket)
let http = require('http');
let server = http.createServer(app);

//enviroment port or 3000 port
let port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("Server is listening at localhost:", + port);
});

//socket
let io = require('socket.io');
io = new io.Server(server); //redefine same var as IO server

//socket listner
//same as io.sockets.on
io.on('connection', (socket) => {
    
    console.log("new socket id", socket.id, "total num", io.engine.clientsCount);

    //listen for data coming in...
    socket.on('changeFreqSlider', (data) => {
        //send to everyone EXCEPT this client
        socket.broadcast.emit('changeFreqSlider', data);
    });

    socket.on('changeAmpSlider', (data) => {
        //send to everyone EXCEPT this client
        socket.broadcast.emit('changeAmpSlider', data);
    });

    socket.on('disconnect', () => {
        console.log("socket disconected", socket.id);
    })

});