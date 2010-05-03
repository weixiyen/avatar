// session-storage module for node-sessions
// Michael Borejdo (mediacoder)
// MIT License

var sys = require("sys");
var posix = require("posix");
var file = require("file");

var SessionStorage_File = function(manager,options){
	this.manager = manager;
	this.options = options || {dir:"./"};
	this.dir = this.options.dir ;
	process.EventEmitter.call(this);
};
sys.inherits(SessionStorage_File, require("./session_storage").SessionStorage);

SessionStorage_File.prototype.saveSession = function(session){	
	var data = session.serialize();
	var f = this.dir+"session_"+session.sid;
	file.write(f, data).wait();
	this.emit("saved", session.sid);
};
SessionStorage_File.prototype.deleteSession = function(session){
	var f = this.dir+"session_"+session.sid;
	var promise = posix.unlink(f);
	promise.addCallback(function () {
		this.emit("deleted", f);
	}).addErrback(function(e){
		this.emit("deleted", f);
	});		
};
SessionStorage_File.prototype.updateSession = function(session){	
	this.emit("updated", session.sid);
};
SessionStorage_File.prototype.lookupSession = function(req){
	var sid = this.manager.idFromRequest(req);
	var promise = new process.Promise;
	var self = this;
	setTimeout(function(){
		var f = self.dir+"session_"+sid;
		var data = file.read(f).wait();
		if(sid && data) {	
			var session = self.manager.refreshSession(sid,data);
			promise.emitSuccess(session);
		} else {
			promise.emitSuccess(false);
		}
	},0);
	return promise;
};
exports.SessionStorage_File = SessionStorage_File;