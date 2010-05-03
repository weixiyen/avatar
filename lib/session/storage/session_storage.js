// session-storage module for node-sessions
// Michael Borejdo (mediacoder)
// MIT License

var sys = require("sys");
var crypto = require("./../../../../crypto");
var iv = '9C6CFC609C6CFC60'; //16
var key = '9C6CFC609C6CFC609C6CFC609C6CFC60'; //32

var SessionStorage = function(){

};
sys.inherits(SessionStorage, process.EventEmitter);

SessionStorage.prototype.saveSession = function(session){};
SessionStorage.prototype.deleteSession = function(session){};
SessionStorage.prototype.updateSession = function(session){};
SessionStorage.prototype.lookupSession = function(req){};

SessionStorage.prototype.encryptData = function(data){
	sys.p("<<<<ENCRYPT>>>>");
	var cipher =(new crypto.Cipher).init("aes-256-cbc",key,iv,true);
	var e = cipher.update(data);
	e += cipher.final();
	return e;
};
SessionStorage.prototype.decryptData = function(data){
	sys.p("<<<<DECRYPT>>>>");
	var cipher =(new crypto.Cipher).init("aes-256-cbc",key,iv,false);
	var d = cipher.update(data);
	d += cipher.final();
	return d;
};
exports.SessionStorage = SessionStorage;