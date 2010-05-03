var sys = require('sys'),
    http = require('http'),
    handlers = require('./lib/handlers');

var server = http.createServer(function(req,res) {
    try {
        handlers.processRequest(req,res);
    } catch(e) {
        sys.puts(e);
    }
}).listen(8000);
