var Subject = new Class({
  Implements: [Options, Events],
  
  $id: null,
  
  options: {
	name: null,
  },

  initialize: function(id, options){
	
	if((typeOf(id) == 'object' && !id.id) || !id)
	  throw new Error('Subject must have and id');
	
	if(typeOf(id) == 'object'){
	  var options = {};
	  Object.each(id, function(opt, key){
		if(key != 'id' && key != 'roles')
		  options[key] = opt;
	  });
	  
	  id = id.id;
	}
	
	this.setOptions(options);
	this.$id = id.toLowerCase();
  },
  
  getID: function(){
	return this.$id;
  },
  
  
});


exports.Subject = Subject;