var Mongoose = require('mongoose');

// Connect to DB.
Mongoose.connect( "mongodb://localhost/eurosong", { useUnifiedTopology: true, useNewUrlParser: true } );

// For production
// Mongoose.connect( "mongodb://[USER NAME]:[PASSWORD]@localhost:27017/eurosong", { useUnifiedTopology: true, useNewUrlParser: true, authSource:"admin" } );

// Throw error.
Mongoose.connection.on( 'error', (err) => {
    if (err) {
        return console.log('Mongoose error: ' + err);
    }
} );

// Create promise.
Mongoose.Promise = global.Promise;

module.exports = {
    Mongoose,
    models: {
        room: require( './schema/room.js' ),
        message: require( './schema/message.js' ),
    }
};
