/**
 * Created with IntelliJ IDEA.
 * User: nchudakov
 * Date: 23.10.13
 * Time: 13:54
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://195.211.101.35/talkwut');

var Schema = mongoose.Schema;
exports.Category = mongoose.model('Category', {
    name: String,
    exchange: String,
    users: [
        { type: Schema.Types.ObjectId, ref: 'User ' }
    ]
});

exports.User = mongoose.model('User', {
    email: String,
    _categories: [
        { type: String, ref: 'Category' }
    ],
    logs: [
        {type: Schema.Types.ObjectId, ref: 'Log'}
    ]
});

exports.Log = mongoose.model('Log', {
    _category: { type: String, ref: 'Category' },
    message: String,
    attachments: [
        {name: String, file: Buffer}
    ],
    _user: { type: String, ref: 'User' }
});