/*  
  -- Simple amqp listener for internal talkwut exchange
*/

var amqp = require('amqp');
var connection = amqp.createConnection({host: 'localhost'});

connection.on('ready', function(){
    connection.exchange('talkwut-global', {type: 'fanout',
                                 autoDelete: false}, function(exchange){
        connection.queue('tw-server-' + Math.random(), {exclusive: true},
                         function(queue){
            queue.bind('talkwut-global', '');
            console.log(' [*] Waiting for messages. To exit press CTRL+C')

            queue.subscribe(function(msg){
                console.log(" [x] Message received: %s", msg.data.toString('utf-8'));
            });
        })
    });
});
