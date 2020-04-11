var roomModel = require('../db').models.room;

var create = function( data, callback ) {
    var newRoom = new roomModel(data);
    newRoom.save(callback);
}

var find = function (data, callback){
    roomModel.find(data, callback);
}

var findOne = function (data, callback){
	roomModel.findOne(data, callback);
}

var findById = function (id, callback){
	roomModel.findById(id, callback);
}

var findOneAndUpdate = function (lookupData, updateData, options, callback){
	roomModel.findOneAndUpdate(lookupData, updateData, options, callback);
}

module.exports = {
    create,
    find,
    findOne,
    findById,
    findOneAndUpdate
}