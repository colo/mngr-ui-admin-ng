var Resource = new Class({
  Implements: [Options, Events],
  
  name: null,
  id: null,
  
  options: {
  },

  initialize: function(id, options){
	if((typeOf(id) == 'object' && !id.id) || !id)
	  throw new Error('Resource must have and id');
	
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
  equals: function(res){
	  return (this.getID() == res.getID()) ? true : false;
  }
});


exports.Resource = Resource;