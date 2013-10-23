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
    amqpHost = '192.168.9.118',
    twIncomingQueue = 'talkwut-incoming'

// Open amqp connection
var connection = amqp.createConnection({host: amqpHost});

connection.on('ready', function(){
    var Notificator = builder.build("talkwut.notifier");
    var email = new Notificator.Envelope(
        new Notificator.Notification("Title", "Message body", "http://www.rabbitmq.com/amqp-0-9-1-reference.html"),
        new Notificator.Envelope.Destination(['sd@asdw', '13wd@wdsad'],['RTNRI']));

    connection.publish(twIncomingQueue, email.toBuffer());
});