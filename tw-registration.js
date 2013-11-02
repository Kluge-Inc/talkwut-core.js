/**
 * Created with IntelliJ IDEA.
 * User: nchudakov
 * Date: 21.10.13
 * Time: 16:07
 * To change this template use File | Settings | File Templates.
 */

var
    amqp = require('amqp'),
    model = require('./talkwut-model/model.js');

var ProtoBuf = require("protobufjs");

var Notificator = ProtoBuf.protoFromFile("talkwut-protocol/notifier/protocol.proto").build();
var TalkwutCoreProtocol = ProtoBuf.protoFromFile("talkwut-protocol/core/registration.proto").build("talkwut.core");


// Configuration params
var
    amqpHost = 'localhost',
    twIncomingQueue = 'talkwut-global',
    twUserRegistrationQueue = 'talkwut-register';

// Open amqp connection
var amqpConnection = amqp.createConnection({host: amqpHost});


amqpConnection.on('ready', function () {
    console.log(' [*] Waiting for messages. To exit press CTRL+C');

    responseExchange = amqpConnection.exchange('', {type: 'fanout', autoDelete: false});

    regQueue = amqpConnection.queue(twUserRegistrationQueue, {durable: true});  
    regQueue.subscribe(function (msg) {

        var registration = TalkwutCoreProtocol.RegistrationRequest.decode(msg.data);
        console.log(" [r] Request received: %s on personal queue %s", registration.user, registration.queue)

        // Fetch user categories from Mongo and bind received queue
        model.User.findOne({ 'name': registration.user}).
            populate('_categories').exec(function (err, user) {
                if (err) console.log(err);
                user._categories.forEach(function (category) {
                    bindout(registration.user, category.name, registration.queue);
                });
        });
    });
});

function bindout(userName, userCategory, userQueue) {
    queue = amqpConnection.queue(userQueue).bind(userCategory, '');
    console.log(" [r] Category binded: %s for %s, personal queue %s", userCategory, userName, userQueue);
    response = 'You have been subscribed to ' + userCategory;
    responseExchange.publish(userQueue, response);
};