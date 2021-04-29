
var Role = require('./role').Role,
	Permission = require('./permission').Permission,
	DSD = require('./constrain/dsd').DSD,
	RC = require('./constrain/rc').RC,
	SSD = require('./constrain/ssd').SSD,
	Subject = require('./subject').Subject,
	Session = require('./session').Session,
	Operation = require('./operation').Operation,
	Resource= require('./resource').Resource;
	
var Rbac = new Class({
  Implements: [Options, Events],
  
  ADD_ROLE: 'addRole',
  ADD_PERMISSION: 'addPermission',
  ADD_CONSTRAIN: 'addConstrain',
  SET_SESSION: 'setSession',
  DELETE_CONSTRAIN: 'deleteConstrain',
  DELETE_PERMISION: 'deletePermission',
  DELETE_ROLE: 'deleteRole',
  IS_AUTHORIZED: 'isAuthorized',
  
  $role: null,
  
//   $roles: {},
  $permissions: {},
  $constrains: {},

  $session: null,
  
  //$rules: null,
  
  options: {
  },

  initialize: function(rules){
		//this.$rules = rules;
		this.$role = new Role('rbac');
	// 	this.$role.addPermission(new Permission('rbac'));
		this.$role.setRbac(this);
		
		this.processRules(rules);
  },
  getRules: function (){
		const roles = this.getRoles();
		const perms = this.getPermissions();
		const constrains = this.getConstrains();
		
		var json_roles = [];
		var json_perms = [];
		var json_constrains = [];
		
		//console.log(this.getConstrains());
		
		Object.each(roles, function(role){
			//console.log(role.toJSON());
			json_roles.push(role.toJSON());
		});
		
		Object.each(perms, function(perm){
			//console.log(perm.toJSON());
			json_perms.push(perm.toJSON());
		});
		
		Object.each(constrains, function(constrain){
			//console.log(constrain.toJSON());
			json_constrains.push(constrain.toJSON());
		});
		
		
		//throw new Error();
		
		return {
			"roles": json_roles,
			"subjects": this.getSubjects(),
			//"operations":,
			"permissions": json_perms,
			"constrains": json_constrains
		}
	},
  processRules: function(rules){
		//console.log('---RULES----');
	 	//console.log(rules);
		
		if(rules.permissions){
			this.processPermissions(rules.permissions);
		}
		
		if(rules.constrains){
			this.processConstrains(rules.constrains);
		}
		
		
		if(rules.roles){
			this.processRoles(rules.roles);
		}
		
		
		if(rules.subjects){
			this.processSubjects(rules.subjects);
		}
  },
//   }.protect(),
  processRoles: function(roles){
	
		roles.each(function(role){
			
			if(!this.getRoles()[role.id]){//if Role already exists doen't create it, will add Permissions
			
				try{
					var roleInstance = new Role(role);
				}
				catch(e){
					throw new Error(e + ', role: ' +JSON.encode(role));
				}
				
				this.addRole(roleInstance);
			}
			else{
				var roleInstance = this.getRoles()[role.id];
			}
			
			//console.log(role.permissions);
			
			if(role.permissions){
				role.permissions.each(function (perm){
					if(this.getPermissions()[perm]){
					//console.log('adding perm:' + perm);
					roleInstance.addPermission(this.getPermissions()[perm]);
					}
				}.bind(this));
			}
			
		}.bind(this));
		
		roles.each(function(role){
			if(role.roles){
				role.roles.each(function(id){
					if(this.getRoles()[id]){
					this.getRoles()[role.id].addRole(this.getRoles()[id]);
					}
				}.bind(this));
			}
		}.bind(this));
	
  }.protect(),
  processPermissions: function(permissions, resources, operations){
	
		permissions.each(function(permission){
			try{
				var permInstance = new Permission(permission);
			}
			catch(e){
				throw new Error(e + ', permission: ' +JSON.encode(permission));
			}
			
			this.addPermission(permInstance);
			
		}.bind(this));
	
  }.protect(),
  processConstrains: function(constrains){
	
		constrains.each(function(constrain){
			
			try{
				var conInstance = {};
				switch(constrain.type){
					case 'SSD': conInstance = new SSD(constrain);
							break;
					case 'RC': conInstance = new RC(constrain);
							break;
					default: conInstance = new DSD(constrain);
				}
			}
			catch(e){
				throw new Error(e + ', constrain: ' +JSON.encode(constrain));
			}
			
			this.addConstrain(conInstance);
			
			
		}.bind(this));
	
  }.protect(),
  processSubjects: function(subjects){
	
		if(typeOf(subjects) == 'function'){
			var sub = subjects();
			
			//console.log('function');
			//console.log(sub);
			subjects = sub;
		}
		
		subjects.each(function(subject){
			
			try{
				var subInstance = new Subject(subject);
			}
			catch(e){
				throw new Error(e + ', subject: ' +JSON.encode(subject));
			}
			
			if(subject.roles){
				subject.roles.each(function(id){
					if(this.getRoles()[id]){
						this.getRoles()[id].addSubject(subInstance);
					}
				}.bind(this));
			}
			
			this.$subjects = subjects;
		}.bind(this));
	
	
  }.protect(),
  getSubjects: function(){
		return this.$subjects;
	},
  getPermissions: function(){
		return this.$permissions;
  },
  getConstrains: function(){
		return this.$constrains;
  },
  getRoles: function(){
// 	////console.log(this.$role);
		return this.$role.getRoles();
  },
  setSession: function(session){
		//console.log('---rbac.setSession----');
		
	  this.fireEvent(this.SET_SESSION, session);
	  
	  if(session !== null &&  (session.getRole() == null || this.roleExists(session.getRole()) === false)){
		  throw new Error('Session role must exist on Rbac policy');
	  }

	  if(this.$session)
			this.$session.removeEvent(session.ADD_ROLE, this.checkRole);
	  
	  if(session !== null)
			session.addEvent(session.ADD_ROLE, this.checkRole.bind(this));
	  
	  this.$session = session;

		//console.log(this.$session);
  },
  getSession: function(){
	  return this.$session;
  },
  check: function(op, res){
	  //console.log('---RBAC.check--');
	  
	  if(this.getSession() === null){
		  throw new Error('No current Session avaliable');
	  }
	  if(this.getSession().getSubject() === null){
		  throw new Error('Current Session doens\'t have a Subject assigned');
	  }
	  if(this.getSession().getRole() === null){
		  throw new Error('Current Session doens\'t have a Role assigned');
	  }
	  
	  var currentRole = this.getSession().getRole();
		
		console.log('---RBAC.check.currentRole--');
		console.log(currentRole.getID());
		
// 		$currentPerms = $currentRole.getPermissions();

	  var tempPermission = new Permission('tmp');
	  tempPermission.setResource(res);
	  tempPermission.setOperation(op);
	  
	  /*check in rbac has this permission*/
	  var permExist = false;
	  Object.each(this.getPermissions(), function(value){
			if (value.equals(tempPermission)){
				permExist = true;
	// 		  break;
			}
	  });
		

	  
	  if(permExist === false){
			throw new Error('Permission (Operation: '+op.getID()+' / Resource: '+res.getID()+') not in Rbac policy');
	  }
	  
	  var val = false;
	  /*checks if rbac has this role, and if the role has that permission*/
	  if(this.roleExists(currentRole)){
			
			var roles = this.getRoles();
			var perms = roles[currentRole.getID()].getAllPermissions();
			
			//console.log('---RBAC.check.currentRole.perms--');
			//console.log(perms);
			
			Object.each(perms, function(value){
				if(value.equals(tempPermission)) val = true;
			});
			
	  }
	  return val;
  },
  isAuthorized: function(obj){
	
		var result = false;
		
		if(obj.op && obj.res){
			try {
				result = this.check(new Operation(obj.op), new Resource(obj.res));

				this.fireEvent(this.IS_AUTHORIZED, {op: obj.op, res: obj.res, result: result } );
				return result;
			}
			catch(e){
				//console.log(e.message);
				this.fireEvent(this.IS_AUTHORIZED, {op: obj.op, res: obj.res, result: false } );
				throw e;
			}
		}
		
	
  },
  addRole: function(role){
		
		role.addEvent(role.ADD_ROLE, this.checkRole.bind(this));
		role.addEvent(role.ADD_PERMISSION, this.checkPermission.bind(this));

		var perms = role.getPermissions();
		
		
		Object.each(perms, function(value){
			if(!this.permissionExists(value)) throw new Error('Permission not in Rbac policy');
		}.bind(this));
		
		this.$role.addRole(role);
		this.fireEvent(this.ADD_ROLE, role);
  },
  roleExists: function(role){
		if(this.$role === role){
			return true;
		}
		
		return this.$role.roleExists(role);
  },
  permissionExists: function(permission){
	  if(this.$permissions[permission.getID()]){
		  return true;
	  }

	  return false;
  },
  constrainExists: function(constrain){
		if(this.$constrains[ constrain.getID() ]){
			return true;
		}
		
		return false;
  },
  deleteRole: function(role){
	
		if(this.roleExists(role) !== false){
			
			this.fireEvent(this.DELETE_ROLE, role);
			
	// 		var roles = Object.clone(this.$role.getRoles());
	// 		
	// 		Object.each(this.$roles, function(value){
	// 		  roles.merge(value.getRoles());
	// 		});
	// 		
	// 		
	// 		if(Object.contains(roles, role) !== false){
	// 			throw new Error('Can\'t delete Role, you need to delete it from parent role first');
	// 		}
			
	// 		Object.each(this.$constrains, function(constrain){
	// 		  if(constrain.getRoles()[role.getID()])
	// 			throw new Error('Can\'t delete Role, you need to delete it from constrain first');
	// 		});
	// 
	// 		
	// 		this.$roles[role.getID()].removeEvent(role.ADD_ROLE, this.checkRole);
	// 		this.$roles[role.getID()].removeEvent(role.ADD_PERMISSION, this.checkPermission);
	// 		
	// 		
	// 		delete this.$roles[role.getID()];
			
	// 		role.setRbac(null);
			
			this.$role.deleteRole(role);
			
			return role;
		}
		else{
			return false;
		}
  },
  addConstrain: function(constrain){
		this.fireEvent(this.ADD_CONSTRAIN, constrain);
		
		constrain.addEvent(constrain.ADD_ROLE, this.checkRole.bind(this));
		this.$constrains[constrain.getID()] = constrain;
		if(this.$constrains[constrain.getID()].getRbac() !== this) this.$constrains[constrain.getID()].setRbac(this);
  },
  deleteConstrain: function(constrain){
	  if(this.constrainExists(constrain)){
			this.fireEvent(this.DELETE_CONSTRAIN, constrain);
			
			this.$constrains[constrain.getID()].removeEvent(constrain.ADD_ROLE, this.checkRole);
			
			delete this.$constrains[constrain.getID()];
			
			constrain.setRbac(null);
			return constrain;
	  }
	  else{
			return false;
	  }
	  
  },
  addPermission: function(perm){
		this.fireEvent(this.ADD_PERMISSION, perm);
		
		this.$permissions[perm.getID()] = perm;
		if(this.$permissions[perm.getID()].getRbac() !== this) this.$permissions[perm.getID()].setRbac(this);
  },
  deletePermission: function(perm){
		
	  if(this.getPermissions().contains(perm) !== false){
		
			var roles = Object.clone(this.$roles);
			
			Object.each(this.$roles, function(value){
				roles.merge(value.getRoles());
			});
			
			
			if(Object.contains(roles, role) !== false){
				throw new Error('Can\'t delete Permision, you need to delete it from parent role first');
			}

			Object.each(roles, function(value){
				if(value.getPermissions()[perm.getID()]){
					throw new Error('Can\'t delete Permision, you need to delete it from Roles first');
				}
			});
			
			this.fireEvent(this.DELETE_PERMISION, perm);
			
			delete this.$permissions[perm.getID()];
			
			perm.setRbac(null);
			return $perm;
	  }
	  else{
			return false;
	  }
  },
  checkRole: function(role){
		if(this.roleExists(role) === false) throw new Error('Role not in Rbac policy');
  },
  checkPermission: function(permission){
	  if(!this.permissionExists(permission)) throw new Error('Permission not in Rbac policy');
  },
  
});


exports.Rbac = Rbac;
