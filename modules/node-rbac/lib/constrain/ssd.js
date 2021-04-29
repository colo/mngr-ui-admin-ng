var Constrain = require('../constrain').Constrain;


var SSD = new Class({
  Extends: Constrain,
  
  addRole: function(role){
	
	role.addEvent(role.ADD_ROLE, this.checkRole.bind(this));
	role.addEvent(role.PRE_ADD_SUBJECT, this.checkRoleSubject.bind(this));
	
	if(Object.getLength(this.getRoles()) > 1){
	  if(!this.checkSubjects(role.getSubjects(), this.getAllSubjects())) throw new Error('Constrain: Static Separation of Duty');
	}
	
	this.parent(role);
  },
  deleteRole: function(role){
	if(this.$roles[role.getID()]){
	  role.removeEvent(role.PRE_ADD_SUBJECT, this.checkRoleSubject);
	}
	return this.parent(role);
  },
  checkSubjects: function(roleSubjects, subjects){
	var val = true;
	Object.each(roleSubjects, function(value){
	  Object.each(subjects, function(subject){
		if(subject.getID() == value.getID()){
		val = false;
		}
	  });

	}.bind(this));
	
	return val;
  }.protect(),
  checkRoleSubject: function(subject){
	if(!this.checkSubjects({'subject': subject}, this.getAllSubjects())) throw new Error('Constrain: Static Separation of Duty ');
  },
  checkRole: function(role){
	if(!this.checkSubjects(role.getSubjects(), this.getAllSubjects())) throw new Error('Constrain: Static Separation of Duty ');
  },
  getAllSubjects: function(){
	var subjects = {};
	
	Object.each(this.getRoles(), function(value){
	  subjects = Object.merge(subjects, value.getSubjects());
	});
	
	return subjects;
	
  }.protect(),
  toJSON: function (){
		var json = this.parent();
		json['type'] = 'SSD';
		
		return json;
	}
});


exports.SSD = SSD;
