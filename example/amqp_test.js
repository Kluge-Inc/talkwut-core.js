var amqp = require('amqp');

var connection = amqp.createConnection({url: "amqp://guest:guest@localhost:5672"});

// Wait for connection to become established.
connection.on('ready', function () {
  // Use the default 'amq.topic' exchange
  connection.queue('tw-server', function(q){
      // Catch all messages
      queue.bind('#')

      // Receive messages
      q.subscribe(function (message) {
        // Print messages to stdout
        console.log(message);
      });
  });
});