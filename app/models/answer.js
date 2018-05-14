var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
    name: String
});

module.exports = mongoose.model('Answer', AnswerSchema);