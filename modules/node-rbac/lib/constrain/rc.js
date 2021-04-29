var Constrain = require('../constrain').Constrain;

var RC = new Class({
  Extends: Constrain,
  
  options:{
	'cardinality': 1,
  },
//   initialize: function(id, options){
// 	this.parent(id)
// 	this.setOptions(options);
//   },
  addRole: function(role){
	role.addEvent(role.ADD_ROLE, this.checkRole.bind(this));
	role.addEvent(role.ADD_SUBJECT, this.checkRoleSubject.bind(this));
	
	if(!this.checkCardinality(role, this.options.cardinality)) throw new Error('Constrain: cardinality '+this.options.cardinality+', can\'t add more subjects to this role.');
	
	
	this.parent(role);
  },
  deleteRole: function(role){
	if(this.$roles[role.getID()]){
	  role.removeEvent(role.ADD_ROLE, this.checkRole );
	}
	return this.parent(role);
  },
  checkCardinality: function(role, cardinality){
 
	if(Object.getLength(role.getSubjects()) > cardinality){
	  return false;
	}
	
	return true;
  }.protect(),
  checkRole: function(role){
	if(!this.checkCardinality(role, this.options.cardinality)) throw new Error('Constrain: cardinality '+this.options.cardinality+', can\'t add more subjects to this role.');
				   
  },
  checkRoleSubject: function(subject){
	Object.each(this.getRoles(),function(role){
		this.checkRole(role);
	}.bind(this));
  },
  toJSON: function (){
		var json = this.parent();
		json['type'] = 'RC';
		json['cardinality'] = this.options.cardinality;
		
		return json;
	}
  
});


exports.RC = RC;
