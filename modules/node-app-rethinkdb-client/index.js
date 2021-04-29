'use strict'

const App = require('../node-app'),
		path = require('path'),
		fs = require('fs'),
		pathToRegexp = require('path-to-regexp');

const camelCase = require('camelcase');
		// r = require('rethinkdb');



////let Logger = require('node-express-logger'),
//let Authorization = require('node-express-authorization');
	////Authentication = require('node-express-authentication');

const debug = require('debug')('app-rethinkdb-client'),
			debug_events = require('debug')('app-rethinkdb-client:Events'),
			debug_internals = require('debug')('app-rethinkdb-client:Internals')


let AppRethinkDBClient = new Class({
  //Implements: [Options, Events],
  Extends: App,

  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',

	ON_INIT_AUTHORIZATION: 'onInitAuthorization',
  ON_INIT_AUTHENTICATION: 'onInitAuthentication',

  //request: null,
	conn: undefined,
	connected: false,

  api: {},

	__connect_cb: undefined,

	methods: [
		/**
		* access
		**/
		'close',
		'reconnect',
		'use',
		'run', //test
		'changes', //test
		'noreplyWait',
		'server',

		/**
		* dbs
		**/
		'dbCreate',
		'dbDrop',
		'dbList',

		/**
		* tables
		**/
		'tableCreate',
		'tableDrop',
		'tableList',
		'indexCreate',
		'indexDrop',
		'indexList',
		'indexRename',
		'indexStatus',
		'indexWait',

		/**
		* data
		*/
		'insert',
		'update',
		'replace',
		'delete',
		'sync',

		'table',
		'get',
		'getAll',
		'between',
		'filter',

		/**
		* joins
		* @todo
		*
		'innerJoin',
		'outerJoin',
		'eqJoin',
		'zip',
		**/

		/**
		* trasnformation
		*/
		'map',
		'withFields',
		'concatMap',
		'orderBy',
		/**
		* trasnformation
		* @todo
		*
		'skip',
		'limit',
		'slice',
		'offsetsOf',
		'isEmpty',
		'union',
		'sample',
		**/
		'nth',

		/**
		* aggregation
		* @todo
		*
		group
		ungroup
		fold
		count
		sum
		avg
		min
		max
		contains
		**/
		'reduce',
		'distinct',
	],

  authorization:null,
  //authentication: null,
  _merged_apps: {},

  options: {

		conn: undefined,
		// scheme: 'http',
		host: '127.0.0.1',
		port: 28015,
		db: undefined,

		rethinkdb: {
			// 'user': undefined, //the user account to connect as (default admin).
			// 'password': undefined, // the password for the user account to connect as (default '', empty).
			// 'timeout': undefined, //timeout period in seconds for the connection to be opened (default 20).
			// /**
			// *  a hash of options to support SSL connections (default null).
			// * Currently, there is only one option available,
			// * and if the ssl option is specified, this key is required:
			// * ca: a list of Node.js Buffer objects containing SSL CA certificates.
			// **/
			// 'ssl': undefined,
		},

		logs: null,

		authentication: null,

		//authentication: {
			//username: 'user',
			//password: 'pass',
			//sendImmediately: true,
			//bearer: 'bearer,
			//basic: false
		//},

		authorization: null,


		// routes: {
    //
		// 	// get: [
		// 	// 	{
		// 	// 		path: '/:param',
		// 	// 		callbacks: ['check_authentication', 'get'],
		// 	// 		content_type: /text\/plain/,
		// 	// 	},
		// 	// ],
		// 	connect: [
		// 		{
		// 		path: '',
		// 		callbacks: ['connect']
		// 		},
		// 	],
		// 	// all: [
		// 	// 	{
		// 	// 	path: '',
		// 	// 	callbacks: ['', 'get']
		// 	// 	},
		// 	// ]
    //
		// },

		api: {

			content_type: 'application/json',

			path: '',

			version: '0.0.0',

			versioned_path: false, //default false

			//accept_header: 'accept-version', //implement?

			/*routes: {
				get: [
					{
					path: '',
					callbacks: ['get_api'],
					content_type: 'application/x-www-form-urlencoded',
					//version: '1.0.1',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					version: '2.0.0',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					version: '1.0.1',
					},
				],
				post: [
					{
					path: '',
					callbacks: ['check_authentication', 'post'],
					},
				],
				all: [
					{
					path: '',
					callbacks: ['get'],
					version: '',
					},
				]

			},*/


			/*doc: {
				'/': {
					type: 'function',
					returns: 'array',
					description: 'Return an array of registered servers',
					example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

				}
			},*/
		},
  },
	__connect: function(err, conn){
		debug_events('__connect %o %o', err, conn, this.conn, this.connected)
		// process.exit(1)
		if(err){
			// process.exit(1)
			this.connected = false
			this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, db: this.options.db, error: err });
			// throw err
		}
		else if(conn){
			this.conn = conn
			this.connected = true
			this.fireEvent(this.ON_CONNECT, {host: this.options.host, port: this.options.port, db: this.options.db, conn: conn });
		}
		else if (this.conn && this.connected === true) {
			this.fireEvent(this.ON_CONNECT, {host: this.options.host, port: this.options.port, db: this.options.db, conn: conn });
		}
		else{
			this.connected = false
			this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, db: this.options.db, error: err });
			// throw err
		}
	},
	connect: function(){
		// debug_events('connect')
		let connect_cb = (this.__connect_cb !== undefined && typeOf(this.__connect_cb) ===  "function") ? this.__connect_cb.bind(this) : this.__connect.bind(this)
		debug_events('connect')

		if(this.options.conn){
			connect_cb(undefined, this.options.conn)
		}
		else{
			let opts = {
				host: this.options.host,
				port: this.options.port,
				db: this.options.db
			};

			debug_internals('to connect %o ', Object.merge(opts, this.options.rethinkdb))
			this.r.connect(Object.merge(opts, this.options.rethinkdb), connect_cb)
			// try {
			// 	this.r.connect(Object.merge(opts, this.options.rethinkdb), connect_cb)
			// }
			// catch(e){
			// 	debug_internals('CONNECT ERROR', e)
			// }
		}
	},
  initialize: function(options, connect_cb){
		this.r = require('rethinkdb')
		this.parent(options);//override default options
		this.__connect_cb = connect_cb


		//if(this.options.db)
			//this.conn = this.conn.use(this.options.db);

		//if(this.options.db);
			//this.request.database(this.options.db);

		// if(this.logger)
		// 	this.logger.extend_app(this);
		// if(this.options.logs){
		// 	////console.log('----instance----');
		// 	////console.log(this.options.logs);
		//
		// 	if(typeof(this.options.logs) == 'class'){
		// 		let tmp_class = this.options.logs;
		// 		this.logger = new tmp_class(this, {});
		// 		this.options.logs = {};
		// 	}
		// 	else if(typeof(this.options.logs) == 'function'){
		// 		this.logger = this.options.logs;
		// 		this.options.logs = {};
		// 	}
		// 	else{
		// 		// this.logger = new Logger(this, this.options.logs);
		// 		this.logger = this.options.logs
		// 	}
		//
		// 	// app.use(this.logger.access());
		// 	// middlewares.push(this.logger.access())
		//
		// 	////console.log(this.logger.instance);
		// }
		//
		// if(this.logger && typeof(this.logger.extend_app) === 'function')
		// 	this.logger.extend_app(this);

		/**
		 * logger
		 *  - end
		 * **/

		/**
		 * authorization
		 * - start
		 * */
		//  if(this.options.authorization && this.options.authorization.init !== false){
		// 	 let authorization = null;
		//
		// 	 if(typeof(this.options.authorization) == 'class'){
		// 		 authorization = new this.options.authorization({});
		// 		 this.options.authorization = {};
		// 	 }
		// 	 else if(typeof(this.options.authorization) == 'function'){
		// 		authorization = this.options.authorization;
		// 		this.options.authorization = {};
		// 	}
		// 	else if(this.options.authorization.config){
		// 		let rbac = this.options.authorization.config;
		//
		// 		if(typeof(this.options.authorization.config) == 'string'){
		// 			//rbac = fs.readFileSync(path.join(__dirname, this.options.authorization.config ), 'ascii');
		// 			rbac = fs.readFileSync(this.options.authorization.config , 'ascii');
		// 			this.options.authorization.config = rbac;
		// 		}
		//
		// 		/**
		// 		 * @todo
		// 		 * should do module injection, avoid "automatigically" importing and starting modules
		// 		 * */
		// 		authorization = new Authorization(this,
		// 			JSON.decode(
		// 				rbac
		// 			)
		// 		);
		// 		/**
		// 		 * *
		// 		 * */
		// 	}
		//
		// 	if(authorization){
		// 		this.authorization = authorization;
		// 		//app.use(this.authorization.session());
		// 	}
		// }


		 //if(this.options.authorization && this.options.authorization.init !== false){
		 if(this.options.authorization){
			 let authorization = null;

			 ////console.log('----typeof(his.options.authorization)---');
			 ////console.log(typeof(this.options.authorization));
			 ////console.log(this.options.authorization);

			if(typeof(this.options.authorization) == 'class'){
				authorization = new this.options.authorization({});
				this.options.authorization = {};
			}
			else if(this.options.authorization.module){
				authorization = new this.options.authorization.module(this.options.authorization)
			}
			// else if(typeof(this.options.authorization) == 'function'){
			else{
				authorization = this.options.authorization;
				this.options.authorization = {};
			}
			// else if(this.options.authorization.config){
			// 	let rbac = this.options.authorization.config;
			//
			// 	if(typeof(this.options.authorization.config) == 'string'){
			// 		//rbac = fs.readFileSync(path.join(__dirname, this.options.authorization.config ), 'ascii');
			// 		rbac = JSON.decode(fs.readFileSync(this.options.authorization.config , 'ascii'));
			// 		this.options.authorization.config = rbac;
			// 	}
			//
			// 	authorization = new Authorization(this,
			// 		rbac
			// 	);
			// }

			if(authorization){
				//if(this.options.authorization.init !== false){

					// if(this.options.authorization.process){
					// 	////console.log('----this.options.authorization.process---');
					// 	authorization.processRules(
					// 		this.options.authorization.process
					// 	);
					// }

					this.authorization = authorization;
					// app.use(this.authorization.session());
					if(this.authorization && typeof(this.authorization.extend_app) === 'function')
						this.authorization.extend_app(this)
					//
					// middlewares.push(this.authorization.session())



				this.fireEvent(this.ON_INIT_AUTHORIZATION, authorization);
			}
		}
		/**
		 * authorization
		 * - end
		 * */

		//if(this.options.api && this.options.api.routes)
			//this.apply_routes(this.options.api.routes, true);

		this.apply_routes(this.options.routes, false);


  },
  apply_routes: function(routes, is_api){
		let uri = '';

		//if(this.options.authentication &&
			//this.options.authentication.basic &&
			//(this.options.authentication.user || this.options.authentication.username) &&
			//(this.options.authentication.pass || this.options.authentication.password))
		//{
			//let user = this.options.authentication.user || this.options.authentication.username;
			//let passwd = this.options.authentication.pass || this.options.authentication.password;
			//uri = this.options.scheme+'://'+user+':'+passwd+'@'+this.options.url+':'+this.options.port;
		//}
		//else{
			//uri = this.options.scheme+'://'+this.options.url+':'+this.options.port;
		//}


		let instance = this;
		//let conn = this.request;

		//let api = this.options.api;

		//if(is_api){
			////path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
			//instance = this.api;
		//}
		//else{
			////path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
			//instance = this;
		//}

		Array.each(this.methods, function(verb){

			////console.log('---VERB---');
			////console.log(verb);
			/**
			 * @callback_alt if typeof function, gets executed instead of the method asigned to the matched route (is an alternative callback, instead of the default usage)
			 * */
			instance[verb] = function(verb, original_func, options, callback_alt){
				// debug_internals('instance[verb] %o', arguments);

				let path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';

				options = options || {};

				debug_internals('instance[verb] routes %o', routes);
				debug_internals('verb %s', verb);
				debug_internals('routes[verb] %o', routes[verb]);

				if(routes[verb]){
					let uri_matched = false;

					Array.each(routes[verb], function(route){
						debug_internals('instance[verb] route.path %s', route.path);

						route.path = route.path || '';
						options.uri = options.uri || '';

						let keys = []
						let re = pathToRegexp(route.path, keys);

						if(options.uri != null && re.test(options.uri) == true){
							// let _path = pathToRegexp.compile(route.path);
							// if(options.uri != null){
							// 	console.log(options.uri)
							// 	try{
							// 	console.log(_path(options.uri))
							// 	}
							// 	catch(e){}
              //
							// }
							// console.log(re.exec(options.uri))
							options.params = {}
							let _params = re.exec(options.uri)
							Array.each(keys, function(val, index){
								options.params[val.name] =_params[index + 1]
							})
							// console.log(options.params)

							uri_matched = true;

							let callbacks = [];

							/**
							 * if no callbacks defined for a route, you should use callback_alt param
							 * */
							if(route.callbacks && route.callbacks.length > 0){
								route.callbacks.each(function(fn){
									//////console.log('route function: ' + fn);

									//if the callback function, has the same name as the verb, we had it already copied as "original_func"
									if(fn == verb){
										callbacks.push({ func: original_func.bind(this), name: fn });
									}
									else{
										callbacks.push({ func: this[fn].bind(this), name: fn });
									}

								}.bind(this));
							}

							let merged = {};

							let args = (options.args !== undefined) ? options.args : {} //0, false && null should be valid args
							let index = options.index || undefined;
							if(typeof index !== 'object'){
								let val = index
								index = {index: val}
							}

							let expr = options.expr || undefined;
							let row = options.row || undefined;
							let field = options.field || undefined;
							let orderBy = options.orderBy || undefined;
							let r_func = options.query || undefined
							let chain = options.chain || undefined
							let opts = options.opts || undefined

							let response = function(err, resp){
								// if(err && resp == undefined){//some functions return no errs
								// 	resp = err
								// 	err = undefined
								// }

								// if(resp){
								// 	let cast_resp = null;
								// 	if(resp[0]){
								// 		cast_resp = [];
                //
                //
								// 		Array.each(resp, function(value, index){
								// 			cast_resp.push(value);
								// 		})
                //
								// 		resp = cast_resp;
                //
								// 	}
								// 	else{
								// 		cast_resp = {};
								// 		Object.each(resp, function(value, key){
								// 			cast_resp[key] = value;
								// 		})
                //
								// 		resp = cast_resp;
                //
                //
								// 	}
								// }


								if(err){
									// this.fireEvent(this.ON_CONNECT_ERROR, {uri: options.uri, route: route.path, error: err });
									this.fireEvent(camelCase('on_'+verb+'_error'), [args]);
								}
								else{
									// this.fireEvent(this.ON_CONNECT, {uri: options.uri, route: route.path, response: resp, options: options });
									this.fireEvent(camelCase('on_'+verb), [args]);
								}


								if(typeof(callback_alt) == 'function' || callback_alt instanceof Function){
									let profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK[*callback_alt*]';

									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

									//callback_alt(err, resp, body, {options: merged, uri: options.uri, route: route.path });
									callback_alt(err, resp, {uri: options.uri, route: route.path, options: options });

									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
								}
								else{
									Array.each(callbacks, function(fn){
										let callback = fn.func;
										let name = fn.name;

										let profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK['+name+']';

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

										//callback(err, resp, body, {options: merged, uri: options.uri, route: route.path });
										callback(err, resp, {uri: options.uri, route: route.path, options: options });

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

									}.bind(this))
								}


							}.bind(this);



							// if(options.id)
							// 	args.push(options.id);
              //
							// if(options.rev)
							// 	args.push(options.rev);
              //
							// if(options.data)
							// 	args.push(options.data);


							// let req_func = instance.conn;
							// let db = keys[0];

							// args.push(response);
              //
							// if(args.length == 0)
							// 	args = [];
              //
							// if(args.length == 1)
							// 	args = args[0];

							// args = args.clean()

							debug_internals('verb %s %o', verb, args)
							// //console.log(this.conn.info())
							let table = (options.params && options.params.table) ? options.params.table : undefined
							let database = (options.params && options.params.database) ? options.params.database : undefined
							let r = instance.r

							switch (verb) {
								/**
								* database
								*/
								case 'use':
									instance.conn[verb].attempt(args)
									response()
									break

								case 'dbCreate':
								case 'dbDrop':
									instance.r[verb](database).run(instance.conn, response)
									break

								case 'dbList'://no args
									instance.r[verb]().run(instance.conn, response)
									break
								/**
								* database end
								*/

								/**
								* table
								*/
								// case 'tableCreate':
								// case 'tableDrop':
								// 	// args = args[0];
								// 	if(database != undefined){
								// 		instance.r.db(options.params.database)[verb](this.r.args(args)).run(instance.conn, response)
								// 	}
								// 	else{
								// 		instance.r[verb](this.r.args(args)).run(instance.conn, response)
								// 	}
								// 	break
								case 'tableCreate':
								case 'tableDrop':
								case 'tableList'://no args
									if(database != undefined){
										instance.r.db(database)[verb](this.r.args(args)).run(instance.conn, response)
									}
									else{
										instance.r[verb](this.r.args(args)).run(instance.conn, response)
									}
									break

								// case 'sync':// data method
								// case 'indexList':
								// 	if(database != undefined){
								// 		instance.r.db(options.params.database).table(table)[verb](this.r.args(args)).run(instance.conn, response)
								// 	}
								// 	else{
								// 		instance.r.table(table)[verb](this.r.args(args)).run(instance.conn, response)
								// 	}
								// 	break
								case 'sync':// data method
								case 'get': //data method
								case 'filter': //data method
								case 'insert'://data method
								case 'update'://data method
								case 'replace'://data method
								case 'withFields'://trasnformation
								case 'indexList':
								case 'indexWait':
								case 'indexStatus':
								case 'indexDrop':
									if(database != undefined){
										instance.r.db(database).table(table)[verb](r.args(args)).run(instance.conn, response)
									}
									else{
										instance.r.table(table)[verb](r.args(args)).run(instance.conn, response)
									}
									break

								case 'getAll': //data method
									debug_internals('getAll %o', instance.conn)
									if(database != undefined){
										if(index){
											instance.r.db(database).table(table)[verb](r.args(args), index).run(instance.conn, response)
										}
										else{
											instance.r.db(database).table(table)[verb](r.args(args)).run(instance.conn, response)
										}

									}
									else{
										if(index){
											instance.r.table(table)[verb](r.args(args), index).run(instance.conn, response)
										}
										else{
											instance.r.table(table)[verb](r.args(args)).run(instance.conn, response)
										}
									}
								break

								case 'indexCreate':
									if(database != undefined){
										if(row){
											if (opts) {
												instance.r.db(database).table(table)[verb](args, row, opts).run(instance.conn, response)
											}
											else{
												instance.r.db(database).table(table)[verb](args, row).run(instance.conn, response)
											}
										}
										else{
											if (opts) {
												instance.r.db(database).table(table)[verb](args, opts).run(instance.conn, response)
											}
											else{
												instance.r.db(database).table(table)[verb](r.args(args)).run(instance.conn, response)
											}
										}

									}
									else{
										if(row){
											if (opts) {
												instance.r.table(table)[verb](args, row, opts).run(instance.conn, response)
											}
											else{
												instance.r.table(table)[verb](args, row).run(instance.conn, response)
											}

										}
										else{
											if (opts) {
												instance.r.table(table)[verb](args, opts).run(instance.conn, response)
											}
											else{
												instance.r.table(table)[verb](r.args(args)).run(instance.conn, response)
											}
										}
									}
									break

								case 'between': //data method
								case 'indexRename':
									if(database != undefined){
										r_func = instance.r.db(database).table(table)[verb](args[0], args[1], args[2])
									}
									else{
										r_func = instance.r.table(table)[verb](args[0], args[1], args[2])
									}


									if(chain){
										if(!Array.isArray(chain))
											chain = [chain]

										Array.each(chain, function(f, index){
											let _func = Object.keys(f)[0]
											let _params = Object.values(f)[0]
											r_func = r_func[_func](_params)

											if(index == chain.length -1)
												r_func.run(instance.conn, response)

										})
									}
									else{
										// r_func.run(instance.conn, response)

										/**
										* @remove: 'chain' should be used instead
										**/
										if(field != undefined){
											// console.log('FIELD:', field)
											if(orderBy != undefined){
												r_func.getField(field).orderBy(orderBy).run(instance.conn, response)
											}
											else{
												r_func.getField(field).run(instance.conn, response)
											}
										}
										else{
											if(orderBy != undefined){
												r_func.orderBy(orderBy).run(instance.conn, response)
											}
											else{
												r_func.run(instance.conn, response)
											}
										}
										/**
										* @remove: 'chain' should be used instead
										**/
									}



									break
								/**
								* table end
								*/

								/**
								* data
								*/
								case 'nth':
								case 'reduce':
								case 'changes':
								case 'delete'://no args
									if(r_func){
										r_func = r_func[verb](args)
									}
									else{
										if(database != undefined){
											r_func = instance.r.db(database).table(table)[verb](args)
										}
										else{
											r_func = instance.r.table(table)[verb](args)
										}


									}

									r_func.run(instance.conn, response)

									break


								/**
								* data end
								*/
								case 'map':
								case 'concatMap':
									if(r_func){
										r_func = r_func[verb](args)
										r_func.run(instance.conn, response)
									}
									else{
										/**
										* @todo: old code, refactor
										**/
										if(expr){
											this.r.expr(expr).map(args).run(instance.conn, response)
										}
										else if(typeOf(args) == 'function'){
											if(database != undefined){
												instance.r.db(database).table(table)[verb](args).run(instance.conn, response)
											}
											else{
												instance.r.table(table)[verb](args).run(instance.conn, response)
											}

										}
									}



								break

								case 'orderBy'://trasnformation
									if(database != undefined){
										if(Array.isArray(args)){
											instance.r.db(database).table(table)[verb](args[0], args[1]).run(instance.conn, response)
										}
										else{
											instance.r.db(database).table(table)[verb](args).run(instance.conn, response)
										}
									}
									else{
										if(Array.isArray(args)){
											instance.r.table(table)[verb](args[0], args[1]).run(instance.conn, response)
										}
										else{
											instance.r.table(table)[verb](args).run(instance.conn, response)
										}

									}
									// console.log(args)
									// if(Array.isArray(args)){
									// 	r_func(args[0], args[1]).run(instance.conn, response)
									// }
									// else{
									// 	r_func(args).run(instance.conn, response)
									// }

									break

								case 'distinct': //aggregation
									if(database != undefined){
										instance.r.db(database).table(table)[verb](args).run(instance.conn, response)
									}
									else{
										instance.r.table(table)[verb](args).run(instance.conn, response)
									}

								break

								case 'table': //select
									if(database != undefined){
										instance.r.db(database)[verb](args).run(instance.conn, response)
									}
									else{
										instance.r[verb](args).run(instance.conn, response)
									}

								break

								default:
									if(Array.isArray(args)){
										args.push(response);
									}
									else{
										args = [response]
									}

									instance.conn[verb].attempt(args, instance.conn)


							}







						}

					}.bind(this));

					if(!uri_matched){
						debug_internals('No routes matched for URI: %s', uri+path+options.uri);
						throw new Error('No routes matched for URI: '+uri+path+options.uri);
					}
				}
				else{
					debug_internals('No routes defined for method:  %s', verb.toUpperCase());
					throw new Error('No routes defined for method: '+verb.toUpperCase());

				}

				//////console.log('returning...', request);

				//return req_func;

			}.bind(this, verb, this[verb]);//copy the original function if there are func like this.get, this.post, etc

		}.bind(this));

	},
	use: function(mount, app){
		////console.log('---AppRethinkDBClient----');
		////console.log(instanceOf(app, AppRethinkDBClient));
		debug('use instanceOf(app, AppRethinkDBClient) %o', instanceOf(app, AppRethinkDBClient));

		if(instanceOf(app, AppRethinkDBClient))
			this.parent(mount, app);


	}



});




module.exports = AppRethinkDBClient
