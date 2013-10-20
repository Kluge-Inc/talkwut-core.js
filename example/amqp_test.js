var http = require('http');
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var amqp = require('amqp');

var httpserver = http.createServer(handler);
// Open amqp connection
var amqpconn = amqp.createConnection({host: 'localhost'});

// Set amqp params
amqpconn.on('ready', function(){
    // Create or connect to exchange
    connection.exchange('talkwut-global', {type: 'fanout',
                                 autoDelete: false}, function(exchange){
        // Create personal queue
        qname = 'tw-server-' + Math.random()
        connection.queue(qname, {exclusive: true},
                         function(queue){
            // Subscribe queue to exchange
            queue.bind('talkwut-global', '');
            console.log(' [*] Waiting for messages. To exit press CTRL+C')

            queue.subscribe(function(msg){
                console.log(" [x] %s", msg.data.toString('utf-8'));
            });
        })
    });
});


httpserver.listen(8080, '0.0.0.0');

// Handler for our web server
function handler(req, res) {
  var path = url.parse(req.url).pathname;
  console.log(' [*] Started web server on port 8080')
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