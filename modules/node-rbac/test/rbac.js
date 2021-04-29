var path = require('path'),
	util = require('util'),
	fs = require('fs');
	
var Moo = require("mootools");

var Rbac = require('../index');

var rbac = new Rbac.Rbac(
  JSON.decode(
	fs.readFileSync(path.dirname(__filename)+'/rbac.example.json', 'ascii')
  )
);

//console.log('getPermissions');
//console.log(util.inspect(rbac.getPermissions(), false, 1));
//console.log('getConstrains');
//console.log(util.inspect(rbac.getConstrains(), false, 1));
//console.log('getConstrains.rc.getRoles');
//console.log(util.inspect(rbac.getConstrains()['rc'].getRoles(), false, 1));
//console.log('getRoles');
//console.log(util.inspect(rbac.getRoles(), false, 2));
//console.log('getRoles.admin.getRoles');
//console.log(util.inspect(rbac.getRoles()['admin'].getRoles(), false, 0));
//console.log('getRoles.user.getSubjects');
//console.log(util.inspect(rbac.getRoles()['user'].getSubjects(), false, 0));

//console.log('Session');
var session = new Rbac.Session('Admin');
session.setRole(rbac.getRoles()['admin']);
session.setSubject(rbac.getRoles()['admin'].getSubjects()['colo']);
rbac.setSession(session);

//console.log(rbac.check(new Rbac.Operation('read'), new Rbac.Resource('file')));
// //console.log(util.inspect(rbac.getRoles()['user'].getSubjects(), false, 0));