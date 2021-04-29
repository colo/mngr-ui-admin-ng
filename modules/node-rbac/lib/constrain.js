var Constrain = new Class({
  Implements: [Options, Events],
  
  ADD_ROLE: 'addRole',

  $roles: {},
  $rbac: null,
  $id: null,
  $name: null,
  
  options: {
  },

  initialize: function(id, options){
	
	if((typeOf(id) == 'object' && !id.id) || !id)
	  throw new Error('Constrain must have and id');
	
	if(typeOf(id) == 'object'){
	  var options = {};
	  Object.each(id, function(opt, key){
		if(key != 'name' && key != 'id' && key != 'type')
		  options[key] = opt;
	  });
	  
	  if(id.name)
		this.setName(id.name);
	  
	  id = id.id;
	}  
	
	this.$id = id.toLowerCase();
	this.setOptions(options);
	
// 	//console.log(options);
  },
  setName: function(name){
	this.$name = name;
  },
  getName: function(){
	if(!this.$name){
	  return this.getID();
	}
	
	return this.$name;
  },
  addRole: function(role){
// 	role.addEvent(role.ADD_SUBJECT, this.checkRoleSubject.bind(this));
// 	role.addEvent(role.ADD_ROLE, this.checkRole.bind(this));
	
	this.fireEvent(this.ADD_ROLE, role);
	
	this.$roles[role.getID()] = role;
  },
  addRoleFromRbac: function(role){
// 	role.addEvent(role.ADD_SUBJECT, this.checkRoleSubject.bind(this));
// 	role.addEvent(role.ADD_ROLE, this.checkRole.bind(this));
	if(this.options.roles && this.options.roles.contains(role.getID())){
	  this.addRole(role);
	}

  },
//   abstract function checkRoleSubject(Event $e);
//   abstract function checkRole(Event $e);
  deleteRole: function(role){
	if(this.$roles[role.getID()]){
	  this.fireEvent(this.DELETE_ROLE, role);
	  
// 	  role.removeEvent(role.ADD_SUBJECT, this.checkRoleSubject);
// 	  role.removeEvent(role.ADD_ROLE, this.checkRole );
  
	  delete this.$roles[role.getID()];
	  return true;
	}
	else{
		return false;
	}
  },
  getRoles: function(){
	return this.$roles;
  },
  setRbac: function(rbac){
	if(this.$rbac && this.$rbac !== rbac){
	  if(Object.getLength(this.$rbac.getRoles()) > 0){
		Object.each(this.$rbac.getRoles(), function(role){
		  this.deleteRole(role);
		}.bind(this));
	  }
	  
	  this.$rbac.deleteConstrain(this);
	}
	
// 	//console.log('setRbac');
	rbac.addEvent(rbac.ADD_ROLE, this.addRoleFromRbac.bind(this));
	
	if(Object.getLength(rbac.getRoles()) > 0 && this.options.roles){
	  Object.each(this.options.roles, function(role){
		if(rbac.getRoles()[role])
		  this.addRole(rbac.getRoles()[role]);
	  }.bind(this));

	}
	
	this.$rbac = rbac;
	if(rbac && !rbac.constrainExists(this)) rbac.addConstrain(this);
  },
  getRbac: function(){
	return this.$rbac;
  },
  getID: function(){
	return this.$id;
  },
  toJSON: function (){
		var roles = [];
		
		//console.log(this.getRoles());
		//this.getRoles() -> Only matched Roles with defined Roles on Rbac
		Object.each(this.getRoles(), function(role, name){
			roles.push(name);
		});
		
		return {
			"id": this.getID(),
			"name": this.getName(),
			"roles": roles
		};
	}
});


exports.Constrain = Constrain;
