let mootools = require ('mootools'),
	path = require ('path'),
	util = require('util'),
	winston = require('winston');

module.exports = new Class({
  Implements: [Options, Events],

  instance: winston,
  id: '',

	//{ emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
  options : {
		/*loggers: {
			error: null,
			access: null,
			profiling: null
		},*/
		loggers: null,

		path: '',

		default: [
				{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
				{ transport: winston.transports.File, options: {level: 'info', filename: null } }
		]

	},

	// initialize: function(app, options){
	initialize: function(options){
		//const mount = app.app.mountpath || app.options.path;
		//console.log('---Logger: '+app.options.id);

		//options.id = options.id || app.options.path.replace("/", "").replace(/\//g, ".");

		this.instance.setLevels(winston.config.syslog.levels);

		this.setOptions(options);

		////console.log(this.options);

		if(this.options.loggers){


			Object.each(this.options.loggers, function(logger, type){

				this.instance.loggers.add(type, this.create_logger(type, logger));

			}.bind(this));
		}

		//this.extend_app(app);

		// app.addEvent(app.ON_LOAD_APP, this.extend_app.bind(this));

  },
  create_logger: function(id, obj){
		//let self = this;
		let logger = null;
		let level = null;
		//let console_level = this.options.console_level;
		//let default_level = this.options.default_level;
		if(!obj || obj == null)
			obj = this.options.default;

		if(typeof(obj) == 'function' ){
			logger = obj;
		}
		else{
			let transports = [];
			////console.log(typeof(obj));
			if(typeof(obj) != 'array' && obj.transport){
				transports.push(this.create_transport(id, obj));
			}
			else if (typeof(obj) == 'array' || typeof(obj) == 'object'){
				Array.each(obj, function(item, index){
					////console.log(typeof(item));
					if(item.transport){
						transports.push(this.create_transport(id, item));
					}
				}.bind(this));
			}

			logger = {
				transports: transports
			};

		}


		return logger;
	},
	create_transport: function(id, obj){
		//let level = null;
		//let transport = null;
		let options = Object.clone(obj.options);

		//let options = Object.clone(self.options.default);

		if(process.env.LOG_ENV)
			options.level = process.env.LOG_ENV;

		////console.log(winston.transports.File);

		//if(obj.transport == winston.transports.File && options.filename == null){
		if(options.filename == null){

			options.filename = path.resolve(this.options.path) + '/' + id + '.log';
		}

		//Logstash
		if(options.node_name){
			options.node_name += '.'+id;
		}

		//let transport =
		////console.log(options.filename);
		return new (obj.transport)( options );
	},
  extend_app: function(app){
		if(app.ON_LOAD_APP)
			app.addEvent(app.ON_LOAD_APP, this.extend_app.bind(this));

		let profile = function(string){

			this.instance.loggers.get('profiling').profile(string);
		}.bind(this);

		let log = function(name, type, string){

			if(!this.instance.loggers[name])
				this.instance.loggers.add(name, this.create_logger(name));

			this.instance.loggers.get(name).log(type, string);
		}.bind(this);

		if(!app.profile)
			if(typeof(app) == 'function'){
			app.implement({
					profile: profile,
				});
			}
			else{
				app['profile'] = profile;
			}

		if(!app.log)
			if(typeof(app) == 'function'){
				app.implement({
					log: log
				});
			}
			else{
				app['log'] = log;
			}
  },
  //express middleware
  access: function(){
		return function access(req, res, next) {
			this.instance.loggers.get('access').log('info', req.method + ' ' + req.url  + ' - HTTP ' + req.httpVersion);
			return next();
		}.bind(this);
  },
  /*error: function(){
		return function error(req, res, next) {
			//console.log('---res.statusCode--');
			//console.log(res.statusCode);
			//this.instance.loggers.get('access').log('info', req.method + ' ' + req.url  + ' - HTTP ' + req.httpVersion);
			return next();
		}.bind(this);
  }*/

});
