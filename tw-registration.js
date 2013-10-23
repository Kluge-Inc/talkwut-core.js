/**
 * Created with IntelliJ IDEA.
 * User: nchudakov
 * Date: 21.10.13
 * Time: 16:07
 * To change this template use File | Settings | File Templates.
 */

var
    amqp = require('amqp');

var ProtoBuf = require("protobufjs");

var Notificator = ProtoBuf.protoFromFile("talkwut-protocol/notifier/protocol.proto").build();
var TalkwutCoreProtocol = ProtoBuf.protoFromFile("talkwut-protocol/core/registration.proto").build("talkwut.core");


// Configuration params
var
    amqpHost = '192.168.9.118',
    twIncomingQueue = 'talkwut-global',
    twUserRegistrationQueue = 'talkwut-register'

// Open amqp connection
var connection = amqp.createConnection({host: amqpHost});


connection.on('ready', function () {
    var queue;

    exchangeGlobal = connection.exchange(twIncomingQueue, {type: 'fanout',
        autoDelete: false}, function (exchange) {
        queue = connection.queue(twUserRegistrationQueue, {durable: true},
            function (queue) {
                // Subscribe to global exchange
                console.log(' [*] Waiting for messages. To exit press CTRL+C')
                queue.subscribe(function (msg) {
                    var registration = TalkwutCoreProtocol.Registration.decode(msg.data);

                    var userQueue = connection.queue(registration.queue);
                    userQueue.bind(exchange, '');

                    console.log(" [x] Queue binded: %s", registration.queue);
                });
            });
    });
});