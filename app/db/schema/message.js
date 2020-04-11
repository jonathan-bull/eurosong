var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

/*
* message - an individual message.
* 
* room - used by participants to enter the room. This is unique while the room is open.
* user - session ID and display name of the participant who entered this message.
* field - identifier of the field this data belongs to.
* value - value of the data.
* songID - song the field and value relates to.
* created - when the message was added.
*/

var messageSchema = new Schema({
    room: String,
    user: {
        displayName: String,
        sessionID: String
    },
    field: String,
    value: String,
    songID: String,
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
});

var messageModel = Mongoose.model( 'message', messageSchema );

module.exports = messageModel;
