var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
	_id: Schema.Types.ObjectId,
    question: String
});

module.exports = mongoose.model('Question', QuestionSchema);