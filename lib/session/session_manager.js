// session-manager module for node-sessions
// Michael Borejdo (mediacoder)
// MIT License

var sys = require("sys");
var s = require("./session");

var storage = {};
process.mixin(storage,require("./storage/session_storage_hash"));
process.mixin(storage,require("./storage/session_storage_memcache"));
process.mixin(storage,require("./storage/session_storage_file"));
process.mixin(storage,require("./storage/session_storage_cookie"));

var SessionManager = function(options){
	var options = options || {};
	this.timers = {};		
	this.domain = options.domain || '';
	this.path = options.path  || '/';
	this.persistent = options.persistent || true;
	this.lifetime	= options.lifetime || 86400;
	this.encrypted = options.encrypted || false;

	this.storage = new storage.SessionStorage_Hash(this);
	//this.storage = new storage.SessionStorage_Memcache(this);
	//this.storage = new storage.SessionStorage_Cookie(this,{encrypted:true});
	//this.storage = new storage.SessionStorage_File(this,{dir:"./_sessions/"});

	this.storage.addListener("deleted",function(sid){
		sys.p("STORAGE_DELETED: "+sid);
	});
	this.storage.addListener("saved",function(sid){
		sys.p("STORAGE_SAVED: "+sid);
	});
	this.storage.addListener("updated",function(sid){
		sys.p("STORAGE_UPDATED: "+sid);
	});
	process.EventEmitter.call(this);
};
sys.inherits(SessionManager, process.EventEmitter);

SessionManager.prototype.createSession = function(){
	var _sid = this.generateId();
	var options = {
		encrypted:this.encrypted,
		lifetime:this.lifetime,
		path:this.path,
		domain:this.domain,
		persistent:this.persistent
	};
	this.emit("create",_sid);
	var session = new s.Session(_sid,options,this);
	session.start();
	return session;
};
SessionManager.prototype.refreshSession = function(sid,data){
//TODO
	var unserialized = JSON.parse(data);			
	var session = new s.Session(sid,unserialized.options,this);
	session.data = unserialized.data;
	session.expires = (+new Date) + session.options.lifetime * 1000;			
	
	//we wanna regenerate SID
	//session.regenerateId();
	session.start();
	return session;
};
SessionManager.prototype.lookupSession =  function(req){

	var promise = this.storage.lookupSession(req);

	var session = {isValid:function(){return false;}};
	var self = this;

	promise.addCallback(function(s){
		if(s !== false){
			session = s;
		}
	}).addErrback(function(e){});
	promise.wait();

	return session;
};
SessionManager.prototype.saveSession = function(session){
	this.emit("save", session.sid);
	this.storage.saveSession(session);
};
SessionManager.prototype.updateSession = function(session){
	this.emit("update", session.sid);
	this.storage.saveSession(session);	
};
SessionManager.prototype.deleteSession = function(session){
	this.emit("delete", session.sid);
	this.storage.deleteSession(session);	
};
SessionManager.prototype.setSessionData = function(key, value, session){
	if(this.encrypted){
		var val = this.storage.encryptData(value);
		value = val;
	}
	session.data[key] = value;
	this.updateSession(session);
};
SessionManager.prototype.getSessionData = function(key, session){
	if(key){
		var value = session.data[key] ? session.data[key] : undefined;
		if(this.encrypted){
			var val = this.storage.decryptData(value);
			value = val;
		}				
		return value;
	}
	return session.data;
};
SessionManager.prototype.generateId = function(){
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', // base64 alphabet
	ret = '';

	for (var bits=24; bits > 0; --bits){
		ret += chars[0x3F & (Math.floor(Math.random() * 0x100000000))];
	}
	return ret;
};
SessionManager.prototype.idFromRequest = function(req) {
	var m;
	if (req.headers.cookie && (m = /SID=([^ ,;]*)/.exec(req.headers.cookie)) ){
		return m[1];
	} 
	return false;
};
SessionManager.prototype.dump = function(){
	sys.puts("");
	sys.puts("------------------------------------------ MANAGER DUMP ----------------------------------------");
	sys.puts("TIMERS:");
	sys.puts("------------------------------------------------------------------------------------------------");
	var size = 0, key;
	for (key in this.timers) {
     		if (this.timers.hasOwnProperty(key)){
			size++;
			sys.puts(size+". "+key+":"+this.timers[key]);
		}
   	}
	sys.puts("------------------------------------------------------------------------------------------------");
	sys.puts("SESSIONCOUNT: "+size);
	sys.puts("");
};
exports.SessionManager = SessionManager;
