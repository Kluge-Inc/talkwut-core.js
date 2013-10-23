/**
 * Created with IntelliJ IDEA.
 * User: nchudakov
 * Date: 23.10.13
 * Time: 14:22
 * To change this template use File | Settings | File Templates.
 */
var model = require('./../model.js')

var rtnri = new model.Category({name: "RTNRI"});
rtnri.save(function (err) {
    if (err) {
        console.log(err.message);
    }
    var user = new model.User({name: "giko", email: "sad@dw.ry", _categories: [rtnri.id]})
    user.save(function (err) {
        if (err) {
            console.log(err.message);
        }
    })
});