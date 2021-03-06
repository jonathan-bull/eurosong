var messageModel = require('../db').models.message;

var create = function( data, callback ) {
    var newMessage = new messageModel(data);
    newMessage.save(callback);
}

var find = function (data, callback){
    messageModel.find(data, callback);
}

var findOne = function (data, callback){
	messageModel.findOne(data, callback);
}

var findById = function (id, callback){
	messageModel.findById(id, callback);
}

var findOneAndUpdate = function (lookupData, updateData, options, callback){
	messageModel.findOneAndUpdate(lookupData, updateData, options, callback);
}

module.exports = {
    create,
    find,
    findOne,
    findById,
    findOneAndUpdate
}