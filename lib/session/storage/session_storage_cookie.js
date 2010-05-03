// TODO
// session-storage module for node-sessions
// Michael Borejdo (mediacoder)
// MIT License

var sys = require("sys");

var SessionStorage_Cookie = function(manager,options){
	this.manager = manager;
	this.options = options || {secure:false};
	process.EventEmitter.call(this);
};
sys.inherits(SessionStorage_Cookie, require("./session_storage").SessionStorage);

SessionStorage_Cookie.prototype.saveSession = function(session){	
	this.emit("saved", session.sid);
};
SessionStorage_Cookie.prototype.deleteSession = function(session){
	this.emit("deleted", session.sid);
};
SessionStorage_Cookie.prototype.updateSession = function(session){	
	this.emit("updated", session.sid);
};
SessionStorage_Cookie.prototype.lookupSession = function(req){
	var sid = this.manager.idFromRequest(req);
		var promise = new process.Promise;
	var self = this;
	setTimeout(function(){
//TODO
		var data = "";
		if(sid && data) {
			var session = self.manager.refreshSession(sid,data);
			promise.emitSuccess(session);
		} else {
			promise.emitSuccess(false);
		}
	},0);
		return promise;
};
exports.SessionStorage_Cookie = SessionStorage_Cookie;
