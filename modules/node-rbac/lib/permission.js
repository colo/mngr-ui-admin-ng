var Resource = require('./resource').Resource,
	Operation = require('./operation').Operation;
	
var Permission = new Class({
  Implements: [Options, Events],

  $name: null,
	
  $rbac: null,
  $operation: null,
  $resource: null,
  $id: null,
  
  options: {
  },

  initialize: function(id){
	if((typeOf(id) == 'object' && !id.id) || !id)
	  throw new Error('Permission must have and id');
	
	if(typeOf(id) == 'object'){
	  var options = {};
	  Object.each(id, function(opt, key){
		if(key != 'name' && key != 'id' && key != 'resources' && key != 'operations')
		  options[key] = opt;
	  });
	  
	  if(id.name)
		this.setName(id.name);
	
	  if(id.resource){
		var res = {};
	
		
		try{
		  var resourceInstance = new Resource(id.resource);
		}
		catch(e){
		  throw new Error(e + ', resource: ' +JSON.encode(id.resource));
		}
		
		this.setResource(resourceInstance);
		  
		
	  }
	  
	  if(id.operation){
		  
		try{
		  var opInstance = new Operation(id.operation);
		}
		catch(e){
		  throw new Error(e + ', operation: ' +JSON.encode(id.operation));
		}
		
		this.setOperation(opInstance);
		
	  }
	  
	  id = id.id;
	}
	
	this.setOptions(options);
	this.$id = id;
	
  },
  getID: function(){
	return this.$id;
  },
  getName: function(){
	if(!this.$name) this.$name = this.getID();
	return this.$name;
  },
  setName: function(name){
	this.$name = name;
  },
  setResource: function(res){
	this.$resource = res;
  },
  getResource: function(){
	return this.$resource;
  },
  setOperation: function(op){
	this.$operation = op;
  },
  getOperation: function(){
	  return this.$operation;
  },
  setRbac: function(rbac){
	  if(this.$rbac && this.$rbac !== rbac){
		  this.$rbac.deletePermission(this);
	  }

	  this.$rbac = rbac;
	  if(rbac && !rbac.permissionExists(this)) rbac.addPermission(this);
  },
  getRbac: function(){
	return this.$rbac;
  },
  equals: function(perm){
	return (
				this.getOperation().equals(perm.getOperation()) &&
				this.getResource().equals(perm.getResource())
				) ? true : false;
  },
  toJSON: function (){
		return {
			"id": this.getID(),
			"name": this.getName(),
			"operation": this.getOperation().getID(),
			"resource": this.getResource().getID()
		}
	}

});


exports.Permission = Permission;
