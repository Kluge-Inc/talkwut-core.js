var 
http = require('http'),
url = require('url'),
fs = require('fs'),
io = require('socket.io'),
amqp = require('amqp');

// Fire up http server
var httpServer = http.createServer(handler);

// Open socket.io server
var socketioServer = io.listen(httpServer);

// Open amqp connection
var connection = amqp.createConnection({host: 'localhost'});

connection.on('ready', function(){
    
    // Generate unique queue name for server
    servQueueName = 'tw-server-' + Math.random();

    // Connect to exchange (create if not present)
    exchangeGlobal = connection.exchange('talkwut-global', {type: 'fanout',
                                autoDelete: false}, function(exchange){
        
        // Create personal queue
        connection.queue(servQueueName, {exclusive: true},
                         function(queue){
            // Subscribe to global exchange
            queue.bind('talkwut-global', '');
            console.log(' [*] Waiting for messages. To exit press CTRL+C')
            console.log(' [*] Personal queue has been created for this server: %s', servQueueName)

            queue.subscribe(function(msg){
                console.log(" [x] Message received: %s", msg.data.toString('utf-8'));
            });
        })
    });

    helloMessage = 'Talkwut node connected: ' + servQueueName;
    exchangeGlobal.publish('', helloMessage);

});


httpServer.listen(8080, '0.0.0.0');

// Handler for the web server
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

// Error handling
function send404(res){
  res.writeHead(404);
  res.write('404');
  res.end();
}