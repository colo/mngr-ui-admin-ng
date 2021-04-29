// require("mootools").apply(GLOBAL);
var Moo = require("mootools");

var fs = require('fs'),
    path = require('path'),
    packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '/package.json')));

exports.VERSION = packageJSON.version.split('.');


var Subject = require('./lib/subject').Subject;
var Session = require('./lib/session').Session;
var Role = require('./lib/role').Role;
var Resource = require('./lib/resource').Resource;
var Permission = require('./lib/permission').Permission;
var Operation = require('./lib/operation').Operation;
var DSD = require('./lib/constrain/dsd').DSD;
var RC = require('./lib/constrain/rc').RC;
var SSD = require('./lib/constrain/ssd').SSD;
var Rbac = require('./lib/rbac').Rbac; 
 

exports.Subject = Subject;
exports.Session = Session;
exports.Role = Role;
exports.Resource = Resource;
exports.Permission = Permission;
exports.Operation = Operation;
exports.DSD = DSD;
exports.RC = RC;
exports.SSD = SSD;
exports.Rbac = Rbac;
