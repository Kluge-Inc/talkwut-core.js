var amqp = require('amqp');

var connection = amqp.createConnection({url: "amqp://guest:guest@localhost:5672"});

// Wait for connection to become established.
connection.on('ready', function () {
  // Use the default 'amq.topic' exchange
  connection.exchange('talkwut-global', function(q){
      // Catch all messages
      q.bind('#');

      // Receive messages
      q.subscribe(function (message) {
        // Print messages to stdout
        console.log(message);
      });
  });
});