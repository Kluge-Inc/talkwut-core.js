/**
 * Created with IntelliJ IDEA.
 * User: nchudakov
 * Date: 21.10.13
 * Time: 15:03
 * To change this template use File | Settings | File Templates.
 */
var
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    amqp = require('amqp');

var ProtoBuf = require("protobufjs");

var builder = ProtoBuf.protoFromFile("talkwut-protocol/notifier/protocol.proto");



// Configuration params
var
    amqpHost = 'localhost',
    twIncomingQueue = 'talkwut-global'

// Open amqp connection
var connection = amqp.createConnection({host: amqpHost});

connection.on('ready', function(){

    // Generate unique queue name for server
    servQueueName = 'tw-server-' + Math.random();

    // Connect to exchange (create if not present)
    exchangeGlobal = connection.exchange(twIncomingQueue, {type: 'fanout',
        autoDelete: false}, function(exchange){

    });

    var Notificator = builder.build();

    var notification = new Notificator.Notification("bla", "lasdfds", "ufo");

    exchangeGlobal.publish('', notification.toBuffer());


});