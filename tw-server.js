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
    mongoose = require('mongoose');


var builder = ProtoBuf.protoFromFile("talkwut-protocol/notifier/protocol.proto");

var Notificator = builder.build("talkwut.notifier");

// Configuration params
var
    amqpHost = 'localhost',
    twIncomingQueue = 'talkwut-global',
    twUserRegistrationQueue = 'talkwut-register'

mongoose.connect('mongodb://195.211.101.35/talkwut');
var Schema = mongoose.Schema;
var Category = mongoose.model('Category', {
    name: String,
    exchange: String,
    users: [
        { type: Schema.Types.ObjectId, ref: 'User ' }
    ]
});

var User = mongoose.model('User', {
    email: String,
    _categories: [
        { type: String, ref: 'Category' }
    ],
    logs: [
        {type: Schema.Types.ObjectId, ref: 'Log'}
    ]
});

var Log = mongoose.model('Log', {
    _category: { type: String, ref: 'Category' },
    message: String,
    attachments: [
        {name: String, file: Buffer}
    ],
    _user: { type: String, ref: 'User' }
});

var rtnri = new Category({name: "RTnRI"});
rtnri.save(function (err) {
    if (err) {
        console.log(err.message);
    }
    var user = new User({email:"sad@dw.ry", _categories:[rtnri.id]})
    user.save(function(err){
        if (err) {
            console.log(err.message);
        }
    })
});


// Open amqp connection
var connection = amqp.createConnection({host: amqpHost});

var decomposition = function (email) {

}

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
                queue.bind(exchange, '');
                console.log(' [*] Waiting for messages. To exit press CTRL+C')
                console.log(' [*] Personal queue has been created for this server: %s', servQueueName)
                queue.subscribe(function (msg) {

                    var envelope = Notificator.Envelope.decode(msg.data);
                    decomposition(envelope);
                    console.log(" [x] Message received: %s", msg.data);
                });
            });
    });

    helloMessage = 'Talkwut node connected: ' + servQueueName;
    exchangeGlobal.publish('', helloMessage);
});