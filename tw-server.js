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
    util = require('util');
;

var ProtoBuf = require("protobufjs");

var builder = ProtoBuf.protoFromFile("talkwut-protocol/notifier/protocol.proto");

var Notificator = builder.build();

var notification = new Notificator.Notification("bla", "lasdfds", "ufo");

console.log(notification.toBuffer());


// Configuration params
var
    amqpHost = 'localhost',
    twIncomingQueue = 'talkwut-global'

// Open amqp connection
var connection = amqp.createConnection({host: amqpHost});

connection.on('ready', function () {

    // Generate unique queue name for server
    servQueueName = 'tw-server-' + Math.random();
    var queue;

    // Connect to exchange (create if not present)
    exchangeGlobal = connection.exchange(twIncomingQueue, {type: 'fanout',
        autoDelete: false}, function (exchange) {
        queue = connection.queue(servQueueName, {exclusive: true},
            function (queue) {
                // Subscribe to global exchange
                queue.bind(exchangeGlobal, '');
                console.log(' [*] Waiting for messages. To exit press CTRL+C')
                console.log(' [*] Personal queue has been created for this server: %s', servQueueName)
                queue.subscribe(function (msg) {
                        var email = Notificator.Email.decode(msg.data);
                        console.log(" [x] Message received: %s", email.message.category);
                });
            });
    });

    helloMessage = 'Talkwut node connected: ' + servQueueName;
    exchangeGlobal.publish('', helloMessage);

});