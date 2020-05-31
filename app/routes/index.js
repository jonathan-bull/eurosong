var fs = require('fs');
var express = require('express');
var router = express.Router();

var Room = require('../models/room');

// Home
router.get( '/', ( req, res ) => {
    res.render( 'pages/index', { 'joinErrors': req.flash('join-error'), 'createErrors': req.flash('create-error') } );        
} );

router.post('/login', ( req, res, next) => {
    // both fields 
    if ( req.body['user-name'] === '' || req.body['user-room'] === '' ) {
        req.flash('join-error', 'Please fill out the required fields');
        res.redirect('/');
    } else {
        if ( req.body['user-room'].length !== 4 ) {
            req.flash('join-error', 'Valid room codes are four characters long');
            res.redirect('/');
        } else {
            // check the room exists
            Room.findOne({"code": req.body['user-room'].toUpperCase() }, (err, room) => {
                if ( err ) {
                    console.log( 'Room fetch error' );
                    console.dir( err );
                }

                if ( room ) {
                    // check the username is unique
                    req.flash('join-success', 'Room found');

                    if ( req.cookies.cookieName ) {
                        console.dir( req.cookies.cookieName );
                    } else {
                        let cookieValue = {
                            room : req.body['user-room'].toUpperCase(),
                            displayName: req.body['user-name'],
                            sessionID: req.session.id
                        };

                        res.cookie('eurosong-session', JSON.stringify( cookieValue ), { maxAge: ( ( (1000 * 60) * 60 ) * 6), httpOnly: true, secure: false });

                        // add to participants list
                        console.dir( room.participants );
                    }

                    res.redirect('/room/' + req.body['user-room'].toUpperCase() );
                } else {
                    req.flash('join-error', 'Room does not exist');
                    res.redirect('/');
                }
            });
        }
    }

});

router.post('/create', ( req, res ) => {
    // all fields entered
    if ( req.body['user-name'] === '' || req.body['user-room'] === '' || req.body['contest-year'] === '' ) {
        req.flash('create-error', 'Room does not exist');
        res.redirect('/');
    } else {
        Room.findOne({"code": req.body['user-room'].toUpperCase() }, (err, room) => {
            if ( err ) {
                console.log( 'Room fetch error' );
                console.dir( err );
            }

            if ( room ) {
                // check the username is unique
                console.dir( room );
                req.flash('create-error', 'Room already exists');
                res.redirect('/');
            } else {
                let roomCredentials = {
                    'code' : req.body['user-room'].toUpperCase(),
                    'owner' : { 'sessionID': req.session.id, 'displayName' : req.body['user-name'] },
                    'year' : req.body['contest-year'],
                    'participants' : [ { 'sessionID': req.session.id, 'displayName' : req.body['user-name'] } ]
                };

                Room.create( roomCredentials , function(err, newRoom){
					if ( err ) {
                        console.log( 'Room create error' );
                        console.dir( err );
                    }

                    if ( req.cookies.cookieName ) {
                        console.dir( req.cookies.cookieName );
                    } else {
                        let cookieValue = {
                            room : req.body['user-room'].toUpperCase(),
                            displayName: req.body['user-name'],
                            sessionID: req.session.id
                        };

                        res.cookie('eurosong-session', JSON.stringify( cookieValue ), { maxAge: ( ( (1000 * 60) * 60 ) * 6), httpOnly: true, secure: false });
                    }

					req.flash('create-success', 'Room created');
                    res.redirect('/room/' + req.body['user-room'].toUpperCase() );
				});
            }
        });
    }
});

router.get('/logout', ( req, res, next ) => {
    res.clearCookie('eurosong-session');
    res.redirect('/');
});


// Room
router.get( '/room/:id', ( req, res, next ) => {
    if ( req.cookies['eurosong-session'] ) { 
        let cookieDecode = JSON.parse( req.cookies['eurosong-session'] );
    
        if ( cookieDecode.room.toUpperCase() === req.params.id.toUpperCase() ) {
            Room.findOne({"code": req.params.id.toUpperCase(), "status" : "open" }, (err, room) => {
                if(err) throw err;
                
                fs.readFile('./public/data/'+ room.year +'.json', 'utf8', (err, jsonString) => {
                    if (err) {
                        res.status(400);
                        res.render('pages/404');
                    } else {
                        let cleanRoom = {
                            'year' : room.year,
                            'code' : room.code,
                            'created' : room.created,
                            'status' : room.status,
                            'owner' : {
                                'displayName' : room.owner.displayName,
                                'sessionID' : room.owner.sessionID,
                            },
                            'participants' : []
                        };

                        console.dir(cookieDecode);

                        let userData = {
                            'displayName' : cookieDecode.displayName,
                            'sessionID' : cookieDecode.sessionID
                        };
        
                        room.participants.forEach( (val) => {
                            cleanRoom.participants.push( { 'displayName' : val.displayName, 'sessionID' : val.sessionID } );
                        });
        
                        res.render( 'pages/year', { 'room' : cleanRoom, 'user' : userData,  'data': JSON.parse(jsonString) } );
                    }
                });
            });
        } else {
            req.flash('join-error', 'Please log in');
            res.redirect('/');    
        }
    } else {
        console.dir( 'cookie not found' );

        req.flash('join-error', 'Please log in');
        res.redirect('/');
    }
});

// Handle 404
router.use(function(req, res) {
    res.status(400);
    res.render('pages/404');
});

module.exports = router;