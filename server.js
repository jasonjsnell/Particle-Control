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
    
    console.log("new socket id", socket.id, "total numer", io.engine.clientsCount);


    //listen for data coming in 
    // socket.on('mouseDrawData', (data) => {
       
    //     //then send it back out
    //     console.log("mouse draw data", data.x, data.y);
        
    //     //send to everyone, including us by targetting global object
    //     io.emit('mouseDrawData', data);

    //     //send to everyone EXCEPT this client
    //     //socket.broadcast.emit('mouseDrawData', data);

    //     //send to us only
    //     //socket.emit('mouseDrawData', data);
    // });

    socket.on('disconnect', () => {
        console.log("socket disconected", socket.id);
    })

});