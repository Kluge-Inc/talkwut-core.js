/*##################################################################
 #                                                                  #
 #   -- Talkwut core server v0.1 --                                 #
 #                                                                  #
 #   General [planned] funtional outline:                           #
 #   1. Start up and register itself personal AMQP queue            #
 #   2. Open up socket.io connection                                #
 #   3. Start http server to provide basic client web-interface     #
 #   4. Listen for supported incoming message types:                #
 #      - e-mail: send directly to mailer                           #
 #      - text: re-route to matching user queue                     #
 #+       (see documentation for details)                           #
 #   5. Decode supported messages and route them                    #
 #                                                                  #
 #   Written on a cold autumn night                                 #
 #+  by S. <224.0.0.25@gmail.com>                                   #
 #+  October 2013                                                   #
 #                                                                  #
 #   Script usage:                                                  #
 #   > npm install                                                  #
 #   > node tw-server.js                                            #
 #                                                                  #
 #   Changelog:                                                     #
 #   v0.1 - basic scaffolding                                       #
 #                                                                  #
 ##################################################################*/

// Require dependencies
var
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    io = require('socket.io'),
    amqp = require('amqp'),
    ProtoBuf = require("protobufjs"),
    model = require("./talkwut-model/model.js");


var builder = ProtoBuf.protoFromFile("talkwut-protocol/notifier/protocol.proto");

var Notificator = builder.build("talkwut.notifier");

// Configuration params
var
    amqpHost = '192.168.9.118',
    twIncomingQueue = 'talkwut-incoming';




// Open amqp connection
var connection = amqp.createConnection({host: amqpHost});

var decomposition = function (envelope) {
    envelope.destination.categories.forEach(function (category) {
        connection.exchange(category, {type: 'fanout',
            autoDelete: false}, function (exchange) {
            exchange.publish('', envelope.message.toBuffer());
        })
    });
}

connection.on('ready', function () {

    // Generate unique queue name for server
    //servQueueName = 'tw-server-' + Math.random();
    var queue;

    queue = connection.queue(twIncomingQueue, {exclusive: false},
        function (queue) {
            // Subscribe to global exchange
            console.log(' [*] Waiting for messages. To exit press CTRL+C')
            queue.subscribe(function (msg) {
                var envelope = Notificator.Envelope.decode(msg.data);
                decomposition(envelope);
                console.log(" [x] Message received & processed");
            });
        });
});