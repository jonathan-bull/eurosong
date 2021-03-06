var cookie = require('cookie');

var Room = require('../models/room');
var Message = require('../models/message');

var ioEvents = function (io) {
    const login = io.of('/login');
    const room = io.of('/room');

    login.on('connection', (socket) => {
        console.log( 'Home page visited: ' + socket.id );
        console.log( socket.request.session.id );
    });

    room.on('connection', (socket) => {
        console.log( 'Room visited: ' + socket.id );
        console.log( socket.request.session.id );

        let decodedCookie = cookie.parse( socket.request.headers.cookie );
        if ( decodedCookie && decodedCookie['eurosong-session'] ) {
            let decodeCookieValue = JSON.parse( decodedCookie['eurosong-session'] );
            socket.join('room-' + decodeCookieValue.room, () => {
                console.log( 'Joined room-' + decodeCookieValue.room );

                // Get all the user's scores
                scoreSearch = {
                    room: decodeCookieValue.room,
                    "user.displayName" : decodeCookieValue.displayName
                }

                console.dir( scoreSearch );
                // Send to the page
                Message.find( scoreSearch, function( err, message ) {
                    if ( message ) {
                        console.dir('Scores found');
                        room.to('room-' + decodeCookieValue.room).emit('initial-scores', message);
                    }
                });

                // Get all the notes
                noteSearch = {
                    field: "Note",
                    room: decodeCookieValue.room
                };

                Message.find( noteSearch, function( err, message ) {
                    // Send to the page
                    if ( message ) {
                        console.dir('Messages found');
                        room.to('room-' + decodeCookieValue.room ).emit('new-notes', message);
                        // socket.emit('new-notes', message);
                    }
                } );
            } );

            
        }

        socket.on('score-change', function( data ) {
            // create or update a new message
            let fullData = data;
            let decodedCookie = cookie.parse( socket.request.headers.cookie );

            fullData.user = { 'sessionID': socket.request.session.id, 'displayName' : '' };
            fullData.room = 'XXXX';

            if ( decodedCookie && decodedCookie['eurosong-session'] ) {
                let decodeCookieValue = JSON.parse( decodedCookie['eurosong-session'] );
                fullData.user = { 'sessionID': decodeCookieValue.sessionID, 'displayName' : decodeCookieValue.displayName };
                fullData.room = decodeCookieValue.room;
            }

            if ( fullData.room !== 'XXXX' ) {
                let updateData = {
                    value : fullData.value,
                    modified: Date.now()
                };

                let checkData = {
                    field: fullData.field,
                    user: fullData.user,
                    room: fullData.room,
                    songID: fullData.songID,
                    count : fullData.count
                };

                // console.dir( fullData );

                Message.findOneAndUpdate( checkData, updateData, { new: true, upsert: true, useFindAndModify: false }, (err, message) => {
                    if ( err ) {
                        console.log( 'Message input error' );
                        console.dir( err );
                    }

                    if ( message ) {
                        // send out the updated score
                        console.log('Score update sent');
                        room.to('room-' + fullData.room ).emit('new-scores', fullData);
                    }

                } );
            } else {
                console.dir('Error: room code not set');
            }
        });
    });

    io.on('connection', function(socket) {
        console.log( 'There are ' + io.engine.clientsCount + ' current connections' );
        console.log();

        socket.on('disconnect', function(data){
            console.log('Goodbye friend');
            //console.log( data.request.session.id );
            console.log();
        });
    });
}

var init = function(app, sessionMiddleware) {
    var server = require('http').Server(app);
    var io = require('socket.io')(server);

    io.use(function(socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    ioEvents(io);

    console.log('Listening');

    return server;
};

module.exports = init;