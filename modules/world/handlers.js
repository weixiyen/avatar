var handlers; this.handlers = handlers = []; //required
require('../../lib/underscore');
var render = require('../../lib/template').render,
    uuid = require('../../lib/uuid'),
    sys = require('sys'),
    emitter = require('events').EventEmitter;
    
var users = {}, // users, position, avatar
    chatlog = [], // chat log
    updateQueue = [], // store all the responses to update for each user
    deletedUsers = [],
    msgEmitter = new emitter,
    updated = 0,
    session_lifetime = 600000; // 10min

setInterval(function(){
    
    var userids = _.keys(users),
	now = Date.now();
	    
    _.each(userids, function(uid){
	if (now >= users[uid].expires) {
	    deletedUsers.push(uid);
	    delete users[uid];
	    updated = 1;
	}
    });
    
    if (updated) {
	_.each(updateQueue, function(update){
	    update();
	});
	updateQueue = [];
	deletedUsers = [];
	updated = 0;
    } 
    
}, 222);

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
            error = 0,
	    uid = uuid.create(),
	    data = {};
	
	users[uid] = {
	    uid: uid,
	    username: username,
	    position: {x:0,y:0},
	    model: model,
	    expires: Math.floor((+new Date) + session_lifetime)
	}
	updated = 1;
	data = {
	    user: users[uid],
	    error: error
	}
        this.res.end(JSON.stringify(data));
    }
});

handlers.push({
   path: '/updatePosition',
   action: function() {
	var uid = this.GET.uid,
	    top = this.GET.top,
	    left = this.GET.left;
	
	if (users[uid]){
	    users[uid].position = {
		x: left,
		y: top
	    }
	    users[uid].expires = Math.floor((+new Date) + session_lifetime)
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
            chat_cursor = this.GET.chat_cursor,
	    uid = this.GET.uid;

        updateQueue.push(
            function() {
                var new_data = {
                    users: users,
		    deletedUsers: deletedUsers,
                    chatlog: [],
                    chat_cursor: chat_cursor,
		    exists: userExists(uid)
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
        var uid = this.GET.uid,
            msg = this.GET.msg,
	    username = this.GET.username,
            message = {
                id: uuid.create(),
                uid: uid,
                msg: msg,
		username: username
            };
	if (users[uid]) {
	    users[uid].expires = Math.floor((+new Date) + session_lifetime)
	}
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
	var uid = this.GET.uid;
        var valid = userExists(uid);
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

function userExists(uid) {
    return _.indexOf( _.map(users, function(user){ return user.uid }), uid) != -1;
}