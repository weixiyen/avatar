var sys = require('sys'),
    path = require('path'),
    url = require('url'),
    fs = require('fs');
    

// this is the main function called by web.js
this.processRequest = function(req, res) {
    var url_obj = url.parse(req.url, true);    
    // handle static files first
    var filename = path.join(process.cwd(), 'static/' + url_obj.pathname);
    path.exists(filename, function(exists) {
        if (exists && url_obj.pathname !== '/') {
            fs.readFile(filename, 'binary', function(err,file){
               if (err) showErr(res,err);
               res.writeHead(200);
               res.end(file, 'binary');
            });
        } else {
             handle(req,res,url_obj);
        }
    });
};



// handles the result of getResponse
function handle(req,res,url_obj) {
    var handler = getHandler(url_obj.pathname, res);
    if (handler === undefined) {
        show404(res);
    } else {
        var content_type = handler.datatype || 'text/html';
        res.writeHead('200',{'Content-Type':content_type});
        handler.req = req;
        handler.res = res;
        handler.GET = url_obj.query;
        handler.action();
    }
}

var modules_path = path.join(process.cwd(), 'modules'),
    modules = fs.readdirSync(modules_path);

// traverse modules, try to match path, and return the response action if there is a path match
function getHandler(uri, res) {
    
    var handler = undefined;
    
    for (var i=0; i < modules.length; i++) {
        
        var handlers = require('../modules/'+modules[i]+'/handlers').handlers;
        for (var j=0; j < handlers.length; j++) {
            if (handlers[j].path === uri) {
                handler = handlers[j];
                break;
            }
        }
        if (handler !== undefined) break;
    }
    return handler;
}

function show404(res) {
    res.writeHead('404',{'Content-Type':'text/plain'});
    res.end('this page does not exist, you fail...');
}

function showErr(res,err) {
    res.writeHead('500',{'Content-Type':'text/plain'});
    res.end(err);
}

