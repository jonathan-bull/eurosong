var cookie = require('cookie');

var Room = require('../models/room');
var Message = require('../models/message');

var ioEvents = function (io) {
    io.on('connection', function(socket) {
        console.log( 'Hello there ' + socket.id );
        console.log( socket.request.session.id );
        
        console.log( 'There are ' + io.engine.clientsCount + ' current connections' );
        console.log();

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
                    songID: fullData.songID
                };

                // console.dir( fullData );

                Message.findOneAndUpdate( checkData, updateData, { new: true, upsert: true }, (err, message) => {
                    if ( err ) {
                        console.log( 'Message input error' );
                        console.dir( err );
                    }

                    if ( message ) {
                        // console.dir( message );

                        // nailed it

                        // send out the updated score
                    }

                } );
            } else {
                console.dir('Error: room code not set');
            }
        });

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