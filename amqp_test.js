var http = require('http');
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var amqp = require('amqp');

var httpserver = http.createServer(handler);
// Open amqp connection
var connection = amqp.createConnection({host: 'localhost'});

connection.on('ready', function(){
    
    // Generate unique queue name
    squeue_name = 'tw-server-' + Math.random();

    // Connect to exchange (create if not present)
    ex_global = connection.exchange('talkwut-global', {type: 'fanout',
                                 autoDelete: false}, function(exchange){
        
        // Create unique queue
        connection.queue(squeue_name, {exclusive: true},
                         function(queue){
            queue.bind('talkwut-global', '');
            console.log(' [*] Waiting for messages. To exit press CTRL+C')

            queue.subscribe(function(msg){
                console.log(" [x] Message received: %s", msg.data.toString('utf-8'));
            });
        })
    });
    //queue_name = 'tw-server-' + Math.random();
    message = 'Talkwut node connected: %s' + squeue_name;
    ex_global.publish('', message);

});


httpserver.listen(8080, '0.0.0.0');

// Handler for our web server
function handler(req, res) {
  var path = url.parse(req.url).pathname;
  console.log(' [w] Got http request: %s', path)
  switch (path){
  case '/':
    path = '/index.html';
  case '/index.html':
    fs.readFile(__dirname + '/index.html', function(err, data){
      if (err) return send404(res);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data, 'utf8');
      res.end();
    });
    break;
  default: send404(res);
  }
}

function send404(res){
  res.writeHead(404);
  res.write('404');
  res.end();
}