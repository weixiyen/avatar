// session-storage module for node-sessions
// Michael Borejdo (mediacoder)
// MIT License

var sys = require("sys");

var SessionStorage_Hash = function(manager,options){
	this.manager = manager;
	this.options = options || {};
	this.storage = {};
	process.EventEmitter.call(this);
};
sys.inherits(SessionStorage_Hash, require("./session_storage").SessionStorage);

SessionStorage_Hash.prototype.saveSession = function(session){
	this.storage[session.sid] = session.serialize();		
	this.emit("saved", session.sid);
};
SessionStorage_Hash.prototype.deleteSession = function(session){
	delete this.storage[session.sid];
	this.emit("deleted",session.sid);
};
SessionStorage_Hash.prototype.updateSession = function(session){	
	this.emit("updated", session.sid);
};
SessionStorage_Hash.prototype.lookupSession = function(req){
	var sid = this.manager.idFromRequest(req);
		var promise = new process.Promise;
	var self = this;
	setTimeout(function(){
		var data = self.storage[sid];
		if(sid && data) {					
			var session = self.manager.refreshSession(sid,data);
			promise.emitSuccess(session);
		} else {
			promise.emitSuccess(false);
		}
	},0);
	return promise;
};

exports.SessionStorage_Hash = SessionStorage_Hash;
