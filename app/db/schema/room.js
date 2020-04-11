var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

/*
* room - an individual quiz event.
* 
* code - used by participants to enter the room. This is unique while the room is open.
* owner - name of the owner of the room/event.
* participants - list of people in the room. Used to pass admin controls around. Array consists of objects containing session IDs, display names and statuses.
* status - whether the room is open or closed. Default is 'open'.
* year - the contest related to this room.
*/

var roomSchema = new Schema({
    code: String,
    owner: {
        displayName: String,
        sessionID: String
    },
    year: Number,
    participants: { type : Array , "default" : [] },
    status: { type: String, default: 'open' },
    created: { type: Date, default: Date.now }
});

var roomModel = Mongoose.model( 'room', roomSchema );

module.exports = roomModel;
