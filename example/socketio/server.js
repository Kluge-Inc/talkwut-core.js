var http = require('http');
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
// var context = require('rabbit.js').createContext('amqp://localhost:5672');
var amqp = require('amqp');
var httpserver = http.createServer(handler);

// Open socket.io server
var socketioserver = io.listen(httpserver);

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

socketioserver.sockets.on('connection', function(amqpconn) {
  var pub = amqpconn.socket('PUB'); // FIXME
  var sub = amqpconn.socket('SUB'); // FIXME

  connection.on('disconnect', function() {
    pub.destroy();
    sub.destroy();
  });

  // NB we have to adapt between the APIs
  sub.setEncoding('utf8');
  connection.on('message', function(msg) {
    pub.write(msg);
  });
  sub.on('data', function(msg) {
    connection.send(msg);
  });
  sub.connect('talkwut-global'); // FIXME
  pub.connect('talkwut-global'); // FIXME
});

httpserver.listen(8080, '0.0.0.0');

// ==== boring detail

function handler(req, res) {
  var path = url.parse(req.url).pathname;
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

