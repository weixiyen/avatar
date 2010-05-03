// session-storage module for node-sessions
// Michael Borejdo (mediacoder)
// MIT License

var sys = require("sys");
var memcached = require('./../../../cache/node-memcache');

var SessionStorage_Memcache = function(manager,options){
	this.manager = manager;
	this.options = options || {};
	this.client = new memcached.MemcachedClient(options);
	this.client.connect().addCallback(function(success){
		sys.puts("CONNECTED SESSION CACHE");
	});
	process.EventEmitter.call(this);
};
sys.inherits(SessionStorage_Memcache, require("./session_storage").SessionStorage);

SessionStorage_Memcache.prototype.saveSession = function(session){
	var self = this;
		var data = session.serialize();
		this.client.set(session.sid, data, session.options.lifetime*1000).addCallback(function(data){
		self.emit("saved", session.sid);
	}).addErrback(function(err){
		sys.puts(err);
		self.emit("saved", session.sid);
	});		
};
SessionStorage_Memcache.prototype.deleteSession = function(session){
	var self = this;
	var sid = session.sid;
	this.client.del(sid).addCallback(function(data){
		self.emit("deleted", sid);
	}).addErrback(function(err){
		sys.puts(err);
		self.emit("deleted", sid);
	});		
};
SessionStorage_Memcache.prototype.updateSession = function(session){	
	this.emit("updated", session.sid);
};
SessionStorage_Memcache.prototype.lookupSession = function(req){
	var sid = this.manager.idFromRequest(req);
	var promise = new process.Promise;
	var self = this;
	this.client.get(sid).addCallback(function(data){			
		var session = self.manager.refreshSession(sid,data);
		promise.emitSuccess(session);
	}).addErrback(function(err){
		sys.puts(err);
		promise.emitSuccess(false);
	});
	
	return promise;
};
exports.SessionStorage_Memcache = SessionStorage_Memcache;
