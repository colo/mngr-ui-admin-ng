var Constrain = require('../constrain').Constrain;


var DSD = new Class({
  Extends: Constrain,
  
  initialize: function(){
	throw new Error('DSD Constrain not implemeted yet');
  },
  checkRole: function(e){}.protect(),
  checkRoleSubject: function(e){}.protect(),
  toJSON: function (){
		var json = this.parent();
		json['type'] = 'DSD';
		
		return json;
	}
});


exports.DSD = DSD;
