// node-sessions module for node.js
// Michael Borejdo (mediacoder)
// MIT License

var sys = require("sys");

var Session = function(sid,options,manager){
	this.manager = manager;
	this.options = options || {encrypted:false,lifetime:0};
	this.sid = sid;
	this.expires = (+new Date) + this.options.lifetime*1000;
	this.data = {};
	process.EventEmitter.call(this);
	this.manager.emit("create_session", this);
};
Session.prototype.isValid = function(){
	return true;
};
Session.prototype.clearTimer = function(){
	try{
		clearTimeout(this.manager.timers[this.sid]);
		delete this.manager.timers[this.sid];
		}catch(e){
		sys.p("--> ERROR CLEARING TIMER "+this.sid);
	};
};
Session.prototype.start = function(){
	this.clearTimer();
	var self = this;
	this.manager.timers[this.sid] = setTimeout(function(){
		self.manager.deleteSession(self);
	},this.options.lifetime*1000);
	this.manager.saveSession(this);
};
Session.prototype.regenerateId = function(){
	sys.p(">>>>REGENERATE");
	var old_sid = this.sid;
	this.clearTimer();		
	this.manager.deleteSession(this);

	var new_sid = this.manager.generateId();
	this.sid = new_sid;

	sys.p(this.sid+","+"old: "+old_sid);

	this.manager.updateSession(this);
};
Session.prototype.set = function(key, value){
	return this.manager.setSessionData(key, value, this);
}; 
Session.prototype.get = function(key){		
	return this.manager.getSessionData(key,this);
};
Session.prototype.serialize = function(){
	var data = JSON.stringify({
		sid:this.sid,
		expires:this.expires,
		data:this.data,
		options:this.options
	},null,1);
	return data;
};
Session.prototype.toString = function(){
	var parts = ['SID=' + this.sid];
	if(this.options.path){
		parts.push('path=' + this.options.path)
	}
	if(this.options.domain){
		parts.push('domain=' + this.options.domain)
	}
	if(this.options.persistent){
		function pad(n) {
			return n > 9 ? '' + n : '0' + n
		}
		var d = new Date(this.expires);
		var wdy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		parts.push('expires=' + wdy[d.getUTCDay()] + ', ' + pad(d.getUTCDate()) + '-' + mon[d.getUTCMonth()] + '-' + d.getUTCFullYear() + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' GMT')
	}

	return parts.join('; ');
};
exports.Session = Session;