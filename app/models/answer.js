var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
    answer: String,
    tips: String,
    question_id: { type: Schema.Types.ObjectId, ref: 'Question' },
    value: Number

});

module.exports = mongoose.model('Answer', AnswerSchema);