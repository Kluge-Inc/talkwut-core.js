/**
 * Created by nchudakov on 01.11.13.
 */

var amqp = require('amqp'),
    ProtoBuf = require("protobufjs"),
    config = require('config'),
    nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP", {
    host: "192.168.9.118", // hostname
    port: 2525 // port for secure SMTP
});

// Open amqp connection
var connection = amqp.createConnection({host: config.amqpHost});

connection.on('ready', function () {
    // Generate unique queue name for server
    //servQueueName = 'tw-server-' + Math.random();
    var queue;

    queue = connection.queue(config.twMailerQueue, {exclusive: false},
        function (queue) {
               queue.subscribe(function(envelope){
                   var envelope = Notificator.Envelope.decode(msg.data);
                   envelope.destination.emails.forEach(function(email){
                       smtpTransport.sendMail({
                           from: "NRIV mailer <nriv@at-consulting.ru>", // sender address
                           to: email,
                           subject: envelope.message.title, // Subject line
                           text: envelope.message.message // plaintext body
                       });
                   })

               })
        });
});