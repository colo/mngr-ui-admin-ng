var Role = new Class({
  Implements: [Options, Events],
  
  ADD_ROLE: 'addRole',
  ADD_PERMISSION: 'addPermission',
  PRE_ADD_SUBJECT: 'preAddSubject',
  ADD_SUBJECT: 'addSubject',
  DELETE_SUBJECT: 'addSubject',
  DELETE_PERMISION: 'deletePermission',
  DELETE_ROLE: 'deleteRole',
  
  $id: null,
  $rbac: null,

  $parentRoles: {},
  $name: null,
  $roles: {},
  $permissions: {},
  $subjects: {},
	
  options: {
  },

  initialize: function(id, options){
	if((typeOf(id) == 'object' && !id.id) || !id)
	  throw new Error('Role must have and id');
	
	if(typeOf(id) == 'object'){
	  var options = {};
	  Object.each(id, function(opt, key){
		if(key != 'name' && key != 'id')
		  options[key] = opt;
	  });
	  
	  if(id.name)
		this.setName(id.name);
	  
	  id = id.id;
	}
	
// 	//console.log(options);
	
	this.setOptions(options);
	this.$id = id.toLowerCase();
	
  },
  getID: function(){
	return this.$id;
  },
  setName: function(name){
	  this.$name = name;
  },
  getName: function(){
	if(!this.$name) this.$name = this.getID();
	return this.$name;
  },
  addRole: function(role){
	this.fireEvent(this.ADD_ROLE, role);
	
	this.$roles[role.getID()] = role;
	
// 	role.addEvent(role.ADD_PERMISSION, this.addPermission.bind(this));
// 	role.addEvent(role.DELETE_PERMISION, this.deletePermission.bind(this));
// 	role.addEvent(role.ADD_SUBJECT, this.addSubject.bind(this));
// 	role.addEvent(role.DELETE_SUBJECT, this.addSubject.bind(this));
// 	role.addEvent(role.ADD_ROLE, this.addRole.bind(this));
// 	role.addEvent(role.DELETE_ROLE, this.deleteRole.bind(this));
	
	if(!role.getParentRoles()[this.getID()]) role.addParentRole(this);
  },
//   fireAnyEvent: function(e){
// 	this.fireEvent(e);
//   },
  roleExists: function(role){
	  
	if(this.$roles[role.getID()]){
	  return true;
	} 
	
	return false;
  },
  getRoles: function(){
	  return this.$roles;
  },
  deleteRole: function(role){

	if(this.roleExists(role)){
// // 		var roles = {};
// // 		roles = Object.merge(roles, this.$roles);
// 		
// 		Object.each(this.$roles, function(value){
// 		  if(Object.contains(value, role) || Object.contains(value.getRoles(), role)){
// 			throw new Error('Can\'t delete Role, you need to delete it from parent role first');
// 		  }
// // 		  roles = Object.merge(roles, value.getRoles());
// 		});
// 		
// 		
// // 		if(Object.contains(roles, role) !== false){
// // 			throw new Error('Can\'t delete Role, you need to delete it from parent role first');
// // 		}
		
		this.fireEvent(this.DELETE_ROLE, role);
		
// 		role.removeEvent(role.ADD_PERMISSION, this.addPermission.bind(this));
// 		role.removeEvent(role.DELETE_PERMISION, this.deletePermission.bind(this));
// 		role.removeEvent(role.ADD_SUBJECT, this.addSubject.bind(this));
// 		role.removeEvent(role.DELETE_SUBJECT, this.addSubject.bind(this));
// 		role.removeEvent(role.ADD_ROLE, this.addRole.bind(this));
// 		role.removeEvent(role.DELETE_ROLE, this.deleteRole.bind(this));
		
		delete this.$roles[role.getID()];
		
		return true;
	}
	else{
		return false;
	}
  },
  addSubject: function(subject){
	this.fireEvent(this.PRE_ADD_SUBJECT, subject);
	this.$subjects[subject.getID()] = subject;
	this.fireEvent(this.ADD_SUBJECT, subject);//after adding the subject, so rc.checkRoleSubject can check roles cardinality
  },
  deleteSubject: function(subject){

	if(this.$subjects[subject.getID()]){
		
	  this.fireEvent(this.DELETE_SUBJECT, subject);
	  delete this.$subjects[subject.getID()];

	  return true;
	}
	else{
	  return false;
	}

  },
  getSubjects: function(){

	  var subjects = {};

	  if (Object.getLength(this.getParentRoles()) > 0) {

		Object.each(this.getParentRoles(), function(parent){
		  subjects = Object.merge(parent.getSubjects(), subjects);
		}.bind(this));
		
		subjects = Object.merge(this.$subjects, subjects);
	  }
	  else{
		subjects = this.$subjects;
	  }
	  
	  return subjects;
  },
  addPermission: function(perm){
	
	this.fireEvent(this.ADD_PERMISSION, perm);
	this.$permissions[perm.getID()] = perm;
  },
//   addPermissionFromRbac: function(perm){
// // 	role.addEvent(role.ADD_SUBJECT, this.checkRoleSubject.bind(this));
// // 	role.addEvent(role.ADD_ROLE, this.checkRole.bind(this));
// 	//console.log(this.id);
// 	
// 	if(this.options.permissions && this.options.permissions.contains(perm.getID())){
// 	  this.addPermission(perm);
// 	}
// 
//   },
  deletePermission: function(perm){
	
	if(this.$permissions[perm.getID()]){
	  this.fireEvent(this.DELETE_PERMISION, perm);
	  delete this.$permissions[perm.getID()];
	  return true;
	}
	else{
	  return false;
	}

  },
  getPermissions: function(){
	  return this.$permissions;
  },
  getAllPermissions: function(){
	var perms = {};
	
	Object.each(this.getRoles(), function(role, index){
	  Object.append(perms, role.getAllPermissions());
	});
	
	Object.append(perms, this.getPermissions());
	
	return perms;
  },
  setRbac: function(rbac){
// 	//console.log(this.id);
	
	if(this.$rbac && this.$rbac !== rbac){
		this.$rbac.deleteRole(this);
// 		Object.each(this.$rbac.getPermissions(), function(perm){
// 		  this.deletePermission(role);
// 		}.bind(this));
	}
	
// 	rbac.addEvent(rbac.ADD_PERMISSION, this.addPermissionFromRbac.bind(this));
	
// 	if(Object.getLength(rbac.getPermissions()) > 0 && this.options.permissions){
// 	  Object.each(this.options.permissions, function(perm){
// 		if(rbac.getRoles()[perm])
// 		  this.addPermission(rbac.getRoles()[perm]);
// 	  }.bind(this));
// 
// 	}
	
	this.$rbac = rbac;
	if(rbac && rbac.roleExists(this) === false) rbac.addRole(this);
  },
  addParentRole: function(role){
	if(this.$parentRoles && this.$parentRoles[role.getID()]){
		this.$parentRoles[role.getID()].deleteRole(this);
	}
	
	this.$parentRoles[role.getID()] = role;
	if(!role.roleExists(this)) role.addRole(this);
  },
  getRbac: function(){
	return this.$rbac;
  },
  getParentRoles: function(){
	return this.$parentRoles;
  },
  equals: function(role){

	if(role.getID() == this.getID() && Object.getLength(this.getPermissions()) == Object.getLength(role.getPermissions()) ){
  
	  
	  var search = [];
	  Object.each(this.getPermissions(), function(value){
		Object.each(role.getPermissions(), function(perm){
		  if(value.getID() != perm.getID())
			return false;
		}.bind(this));
	  }.bind(this));
		
	  return true;
	}
	
	return false;
  },
  toJSON: function(){
		var perms = [];
		var roles = [];
		
		Object.each(this.getPermissions(), function(perm, name){
			perms.push(name);
		});
		
		Object.each(this.getRoles(), function(role, name){
			roles.push(name);
		});
		
		
		return {
			'id': this.getID(),
			'name': this.getName(),
			'permissions': perms,
			'roles': roles
		}
	}
});


exports.Role = Role;
