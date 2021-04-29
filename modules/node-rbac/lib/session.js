var Session = new Class({
  Implements: [Options, Events],
  
  ADD_ROLE: 'addRole',
  
  $subject: null,
  $role: null,
  
  options: {
// 	name: null,
  },

//   initialize: function(options){
// 	this.setOptions(options);
//   },
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
  setSubject:function (subject){
    if(subject){
			if(this.getRole() === null){
				throw new Error('Can\'t add Subject if there is no Role set.');
			}
			else if(Object.contains(this.getRole().getSubjects(),subject) === false){
				throw new Error('Can\'t add Subject that doesn\'t belong to current Role');
			}
			
			//console.log('----setSubject-----');
			//console.log(subject);
			this.$subject = subject;
    }
  },
  getSubject: function(){
	return this.$subject;
  },
  setRole: function(role){
	role.addEvent(role.DELETE_SUBJECT, function(subject){
	  if(subject === this.subject) throw new Error('Deleting a Subject on a created Session is not allowed');
	}.bind(this));
	
	this.fireEvent(this.ADD_ROLE, role);
	
	this.$role = role;
  },
  getRole:function(){
	return this.$role;
  },

});


exports.Session = Session;
