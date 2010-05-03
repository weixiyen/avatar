var handlers; this.handlers = handlers = []; //required
require('../../lib/underscore');
var render = require('../../lib/template').render,
    uuid = require('../../lib/uuid'),
    sys = require('sys'),
    emitter = require('events').EventEmitter;
	
var msgEmitter = new emitter;

var users = {}, // users, position, avatar
    chatlog = [], // chat log
    updateQueue = [], // store all the responses to update for each user
    msgEmitter = new emitter,
    updated = 0;

/*
msgEmitter.addListener('update', function() {
    var data = {
            users: users,
            chatlog: chatlog
        };
    _.each(updateQueue, function(update){
        update(data);
    });
    updateQueue = [];
});*/

setInterval(function(){
    if (updated) {
	_.each(updateQueue, function(update){
	    update();
	});
	updateQueue = [];
    }
    updated = 0;
}, 100);


handlers.push({
    path: '/',
    action: function() {
        this.res.end(render('home.html',{
            title: 'Avatar chat!'
        }));
    }
});

handlers.push({
    path: '/login',
    datatype: 'application/json',
    action: function() {
        var username = this.GET.username,
	    model = this.GET.model,
            errors = [];
	users[username] = {
	    username: username,
	    position: {x:0,y:0},
	    model: model
        }
        msgEmitter.emit('update');
        var data = {
            user: users[username],
            errors: errors
        }
        this.res.end(JSON.stringify(data));
    }
});

handlers.push({
   path: '/updatePosition',
   action: function() {
	var username = this.GET.username,
	    top = this.GET.top,
	    left = this.GET.left;
	
	if (users[username]){
	    users[username].position = {
		x: left,
		y: top
	    }
	}
	
	updated = 1;
	this.res.end();
   }
});

handlers.push({
    path: '/world',
    datatype: 'application/json',
    action: function() {
        var res = this.res,
            chat_cursor = this.GET.chat_cursor;

        updateQueue.push(
            function() {
                var new_data = {
                    users: users,
                    chatlog: [],
                    chat_cursor: chat_cursor
                }
                new_data.chatlog = chat_cursor ? getPartialChatlog(chat_cursor) : chatlog;
                new_data.chat_cursor = chatlog.length > 0 ? _.last(chatlog).id : 0;
                res.end(JSON.stringify(new_data));
            }
        );
    }
});

handlers.push({
   path: '/sendMessage',
   action: function() {
        var username = this.GET.username,
            msg = this.GET.msg,
            message = {
                id: uuid.create(),
                username: username,
                msg: msg
            };
        reduceChatlog();
        chatlog.push(message);
        updated = 1;
        this.res.end();
   }
});

handlers.push({
   path: '/loadWorld',
   action: function() {
        updated = 1;
        this.res.end();
   }
});

handlers.push({
   path: '/verifyUser',
   datatype: 'application/json',
   action: function() {
        var valid = _.indexOf( _.map(users, function(user){ return user.username }), this.GET.username) != -1;
        this.res.end( JSON.stringify( {valid:valid} ) );
   }
});

function reduceChatlog() {
    if (chatlog.length > 1000) {
        chatlog.shift();
        reduceChatlog();
    }
    return;
}

function getPartialChatlog(cursor) {
    var index = 0;
    _.each(chatlog, function(chat, i){
       if (chat.id === cursor) {
            index = i;
            _.breakLoop();
       }
    });
    return chatlog.slice(index+1);
}