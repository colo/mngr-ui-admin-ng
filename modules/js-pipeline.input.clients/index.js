'use strict'

const path = require('path')
		// Poll = require('../index')
		// mootools = require('mootools'),

const debug = require('debug')('js-pipeline:input:clients'),
			debug_internals = require('debug')('js-pipeline:input:clients:Internals'),
			debug_events = require('debug')('js-pipeline:input:clients:Events')

module.exports = new Class({
	Implements: [Options, Events],

	ON_SUSPEND: 'onSuspend',
	ON_RESUME: 'onResume',
	ON_EXIT: 'onExit',

	ON_ONCE: 'onOnce',
	ON_RANGE: 'onRange',


	ON_CLIENT_CONNECT: 'onClientConnect',
	ON_CLIENT_CONNECT_ERROR: 'onClientConnectError',

	ON_DOC: 'onDoc',
	ON_DOC_ERROR: 'onDocError',

	ON_ONCE_DOC: 'onOnceDoc',
	ON_ONCE_DOC_ERROR: 'onOnceDocError',

	ON_DOC_SAVED: 'onDocSaved',

	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
	ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',

	ON_RANGE_DOC: 'onRangeDoc',
	ON_RANGE_DOC_ERROR: 'onRangeDocError',

	ON_ONCE_REQUESTS_UPDATED: 'onOnceRequestsUpdated',
	ON_RANGE_REQUESTS_UPDATED: 'onRangeRequestsUpdated',
	ON_PERIODICAL_REQUESTS_UPDATED: 'onPeriodicalRequestsUpdated',

	//ON_CONFIG_DOC: 'onConfigDoc',
	//ON_CONFIG_DOC_ERROR: 'onConfigDocError',

	//ON_MONITOR_DOC: 'onMonitorDoc',
	//ON_MONITOR_DOC_ERROR: 'onMonitorDocError',

	clients: {},
	//connected clients
	connected_clients: [],

	//clients that couldn't connect
	err_clients: {},

	err_client_count: [],

	periodicals: {},

	//db: null,
	options: {

		suspended: false,
		id: null,
		conn: undefined,
		clients: [],

		connect_retry_count: 10,
		connect_retry_periodical: 5000,

		requests: {
			periodical: 1000,
		},

		docs:{
			buffer_size: 10,
			timer: 5, //seconds
		}

	},

	initialize: function(options){
		// debug('initialize', options)
		// process.exit(1)
		this.clients = (options.conn !== undefined) ? options.conn : options.clients
		if(!Array.isArray(this.clients))
			this.clients = [this.clients]

		this.setOptions(options)

		this.addEvent(this.ON_EXIT, this.exit.bind(this));

		// this.setOptions(options);
		//
		// //console.log('Input->Poller->suspended', this.options.suspended)
		//
		// // if(typeof(this.options.conn) != 'array' && this.options.conn instanceof Array && !Array.isArray(this.options.conn)){
		// // 	let client = this.options.conn;
		// // 	this.options.conn = [];
		// // 	this.options.conn.push(client);
		// // }
		// this.clients = (this.options.conn !== undefined) ? this.options.conn : this.clients
		// if(!Array.isArray(this.clients))
		// 	this.clients = [this.clients]
		//
		// //////console.log(this.options);
		//
		// this.addEvent(this.ON_EXIT, this.exit.bind(this));


	},
	exit: function(){
		debug('exit');
		if(process && process.exit && typeof process.exit == 'function')//process.exit works only nodejs, not in browsers
			process.exit(0);
	},
	//connect: function(connect_clients){
	// __extend_client_app: function(client, app, is_sub_app){
	// 	debug('__extend_client_app', client, app, is_sub_app)
	// 	// process.exit(1)
	//
	//
	//
	// 	client['ON_EXIT'] = this.ON_EXIT;
	// 	client['ON_SUSPEND'] = this.ON_SUSPEND;
	// 	client['ON_RESUME'] = this.ON_RESUME;
	//
	// 	client['ON_DOC'] = this.ON_DOC;
	// 	client['ON_DOC_ERROR'] = this.ON_DOC_ERROR;
	//
	// 	client['ON_ONCE'] = this.ON_ONCE;
	// 	client['ON_RANGE'] = this.ON_RANGE;
	//
	// 	client['ON_PERIODICAL_DOC'] = this.ON_PERIODICAL_DOC;
	// 	client['ON_PERIODICAL_DOC_ERROR'] = this.ON_PERIODICAL_DOC_ERROR;
	//
	// 	client['ON_ONCE_DOC'] = this.ON_ONCE_DOC;
	// 	client['ON_ONCE_DOC_ERROR'] = this.ON_ONCE_DOC_ERROR;
	//
	// 	client['ON_DOC_SAVED'] = this.ON_DOC_SAVED;
	//
	// 	client['ON_RANGE_DOC'] = this.ON_RANGE_DOC;
	// 	client['ON_RANGE_DOC_ERROR'] = this.ON_RANGE_DOC_ERROR;
	//
	// 	client['ON_ONCE_REQUESTS_UPDATED'] = this.ON_ONCE_REQUESTS_UPDATED;
	// 	client['ON_RANGE_REQUESTS_UPDATED'] = this.ON_RANGE_REQUESTS_UPDATED;
	// 	client['ON_PERIODICAL_REQUESTS_UPDATED'] = this.ON_PERIODICAL_REQUESTS_UPDATED;
	//
	// 	// app.addEvent(app.ON_EXIT, function(req){
	// 	// 	debug_events('ON_EXIT %o', req);
	// 	// 	// if(!Array.isArray(req))
	// 	// 	// 	req = [req]
	// 	//
	// 	// 	client.fireEvent(client.ON_EXIT, [req]);
	// 	// }.bind(app));
	//
	// 	app.addEvent(app.ON_EXIT, req => client.fireEvent(client.ON_EXIT, [req]))
	//
	// 	if(is_sub_app === true)
	// 		process.exit(1)
	//
	// 	let __client_suspend = function(req){
	// 		debug_events('ON_SUSPEND %o', req);
	// 		// if(!Array.isArray(req))
	// 		// 	req = [req]
	//
	// 		client.fireEvent(client.ON_SUSPEND, [req]);
	// 	}.bind(app)
	//
	// 	app.addEvent(app.ON_SUSPEND, __client_suspend);
	//
	//
	// 	let __client_resume = function(req){
	// 		debug_events('ON_RESUME %o', req);
	// 		// if(!Array.isArray(req))
	// 		// 	req = [req]
	//
	// 		client.fireEvent(client.ON_RESUME, [req]);
	// 	}.bind(app)
	//
	// 	app.addEvent(app.ON_RESUME, __client_resume);
	//
	// 	// app.addEvent(app.ON_ONCE, function(req){
	// 	// 	debug_events('ON_ONCE %o', req);
	// 	// 	// if(!Array.isArray(req))
	// 	// 	// 	req = [req]
	// 	//
	// 	// 	client.fireEvent(client.ON_ONCE, [req]);
	// 	// }.bind(app));
	// 	app.addEvent(app.ON_ONCE, req => client.fireEvent(client.ON_ONCE, [req]))
	//
	// 	// app.addEvent(app.ON_RANGE, function(req){
	// 	// 	debug_events('ON_RANGE %o', req);
	// 	// 	// if(!Array.isArray(req))
	// 	// 	// 	req = [req]
	// 	// 	client.fireEvent(client.ON_RANGE, [req]);
	// 	// }.bind(app));
	// 	app.addEvent(app.ON_RANGE, req => client.fireEvent(client.ON_RANGE, [req]))
	//
	// 	// app.addEvent(app.ON_DOC_SAVED, function(err, result){
	// 	// 	debug_events('ON_DOC_SAVED', err, result);
	// 	// 	client.fireEvent(client.ON_DOC_SAVED, [err, result]);
	// 	// }.bind(app));
	// 	app.addEvent(app.ON_DOC_SAVED, (err, result) => client.fireEvent(client.ON_DOC_SAVED, [err, result]));
	//
	//
	// 	/**
	// 	 * Events from client to app
	// 	 * */
	//
	// 	// client.addEvent(client.ON_EXIT, function(){
	// 	// 	debug_events('client.ON_EXIT %o', arguments);
	// 	// 	app.fireEvent(app.ON_EXIT, [arguments]);
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_SUSPEND, function(){
	// 		debug_events('client.ON_SUSPEND %o', arguments);
	// 		app.removeEvent(app.ON_SUSPEND, __client_suspend);
	// 		app.fireEvent(app.ON_SUSPEND, [arguments]);
	// 		app.addEvent(app.ON_SUSPEND, __client_suspend);
	// 	}.bind(app));
	//
	// 	client.addEvent(client.ON_RESUME, function(){
	// 		debug_events('client.ON_RESUME %o', arguments);
	// 		app.removeEvent(app.ON_RESUME, __client_resume);
	// 		app.fireEvent(app.ON_RESUME, [arguments]);
	// 		app.addEvent(app.ON_RESUME, __client_resume);
	// 	}.bind(app));
	//
	// 	// client.addEvent(client.ON_DOC, function(doc, options){
	// 	// 	debug_events('client.ON_DOC %o', arguments);
	// 	// 	app.fireEvent(app.ON_DOC, [doc, options]);
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_DOC, (doc, options) => app.fireEvent(app.ON_DOC, [doc, options]))
	//
	// 	// client.addEvent(client.ON_DOC_ERROR, function(doc, options){
	// 	// 	debug_events('client.ON_DOC_ERROR %o', arguments);
	// 	// 	app.fireEvent(app.ON_DOC_ERROR, [doc, options]);
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_DOC_ERROR, [doc, options]))
	//
	// 	// client.addEvent(client.ON_ONCE_DOC, function(doc, options){
	// 	// 	debug_events('client.ON_ONCE_DOC %o', arguments);
	// 	// 	app.fireEvent(app.ON_ONCE_DOC, [doc, options]);
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_ONCE_DOC, (doc, options) => app.fireEvent(app.ON_ONCE_DOC, [doc, options]))
	//
	// 	// client.addEvent(client.ON_ONCE_DOC_ERROR, function(doc, options){
	// 	// 	debug_events('client.ON_ONCE_DOC_ERROR %o', arguments);
	// 	// 	app.fireEvent(app.ON_ONCE_DOC_ERROR, [doc, options]);
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_ONCE_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_ONCE_DOC_ERROR, [doc, options]))
	//
	// 	// client.addEvent(client.ON_PERIODICAL_DOC, function(doc, options){
	// 	// 	debug_events('client.ON_PERIODICAL_DOC %o', arguments);
	// 	// 	app.fireEvent(app.ON_PERIODICAL_DOC, [doc, options]);
	// 	//
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_PERIODICAL_DOC, (doc, options) => app.fireEvent(app.ON_PERIODICAL_DOC, [doc, options]))
	//
	// 	// client.addEvent(client.ON_PERIODICAL_DOC_ERROR, function(doc, options){
	// 	// 	debug_events('client.ON_PERIODICAL_DOC_ERROR %o', arguments);
	// 	// 	app.fireEvent(app.ON_PERIODICAL_DOC_ERROR, [doc, options]);
	// 	//
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_PERIODICAL_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_PERIODICAL_DOC_ERROR, [doc, options]))
	//
	// 	// client.addEvent(client.ON_RANGE_DOC, function(doc, options){
	// 	// 	debug_events('client.ON_RANGE_DOC %o', arguments);
	// 	// 	app.fireEvent(app.ON_RANGE_DOC, [doc, options]);
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_RANGE_DOC, (doc, options) => app.fireEvent(app.ON_RANGE_DOC, [doc, options]))
	//
	// 	// client.addEvent(client.ON_RANGE_DOC_ERROR, function(doc, options){
	// 	// 	debug_events('client.ON_RANGE_DOC_ERROR %o', arguments);
	// 	// 	app.fireEvent(app.ON_RANGE_DOC_ERROR, [doc, options]);
	// 	// }.bind(app));
	// 	client.addEvent(client.ON_RANGE_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_RANGE_DOC_ERROR, [doc, options]))
	//
	// 	client.addEvent(client.ON_ONCE_REQUESTS_UPDATED, function(){
	// 		debug_internals('client.ON_REQUESTS_UPDATED %o', client.options.requests.once);
	// 		client.removeEvents(client.ON_ONCE)
	// 		app._process_requests(index, (is_sub_app === true) ? app : undefined, (is_sub_app === true) ? { once: app.options.requests.once } : { once: client.options.requests.once });
	// 	}.bind(app));
	//
	// 	client.addEvent(client.ON_RANGE_REQUESTS_UPDATED, function(){
	// 		debug_internals('client.ON_REQUESTS_UPDATED %o', client.options.requests.range);
	// 		client.removeEvents(client.ON_RANGE)
	// 		app._process_requests(index, (is_sub_app === true) ? app : undefined, (is_sub_app === true) ? { range: app.options.requests.range } : { range: client.options.requests.range });
	// 	}.bind(app));
	//
	// 	client.addEvent(client.ON_PERIODICAL_REQUESTS_UPDATED, function(){
	// 		debug_internals('client.ON_PERIODICAL_REQUESTS_UPDATED %o', client.options.requests.periodical);
	// 		let key = client.options.id;
	//
	// 		if(app.periodicals[key])//if exists, stop and delete all, and process again
	// 			Array.each(app.periodicals[key], function(fn){
	// 				const {type, timer} = fn;
	// 				switch(type){
	// 					case 'task':
	// 						timer.stop();
	//
	// 					case 'timer':
	// 						clearInterval(timer);
	//
	// 					default:
	// 						delete app.periodicals[key];
	//
	// 				}
	//
	// 			}.bind(app));
	//
	// 		Array.each(client.options.requests.periodical, function(app_req){
	// 			app._process_periodical(client, null, app_req, 'periodical');
	// 		}.bind(app));
	//
	// 	}.bind(app));
	//
	// 	/**
	// 	 * DOCS from client to app
	// 	 * */
	//
	//
	// 	if(client.options && client.options.requests){
	// 		this._process_requests(index, (is_sub_app === true) ? app : undefined, client.options.requests);
	// 	}
	//
	// 	return client
	// },
	connect: function(){
		debug('connect...')

		Array.each(this.clients, function(client, index){

			if(!this.connected_clients || !this.connected_clients[index]){//to prevent multiples ON_ERROR trying to reconnect

				if(!this.err_client_count[index])
					this.err_client_count[index] = 0;

				//checks if the 'client app' already failed, else create a new one
				if(this.err_clients && this.err_clients[index]){

					debug('Connect->err_clients %d', index);
					// process.exit(1)
					client = this.err_clients[index];
				}
				else{
					// debug('Connect->create client %o', client);
					// process.exit(1)

					// this.__extend_client_app(client, this)

					client['ON_EXIT'] = this.ON_EXIT;
					client['ON_SUSPEND'] = this.ON_SUSPEND;
					client['ON_RESUME'] = this.ON_RESUME;

					client['ON_DOC'] = this.ON_DOC;
					client['ON_DOC_ERROR'] = this.ON_DOC_ERROR;

					client['ON_ONCE'] = this.ON_ONCE;
					client['ON_RANGE'] = this.ON_RANGE;

					client['ON_PERIODICAL_DOC'] = this.ON_PERIODICAL_DOC;
					client['ON_PERIODICAL_DOC_ERROR'] = this.ON_PERIODICAL_DOC_ERROR;

					client['ON_ONCE_DOC'] = this.ON_ONCE_DOC;
					client['ON_ONCE_DOC_ERROR'] = this.ON_ONCE_DOC_ERROR;

					client['ON_DOC_SAVED'] = this.ON_DOC_SAVED;

					client['ON_RANGE_DOC'] = this.ON_RANGE_DOC;
					client['ON_RANGE_DOC_ERROR'] = this.ON_RANGE_DOC_ERROR;

					client['ON_ONCE_REQUESTS_UPDATED'] = this.ON_ONCE_REQUESTS_UPDATED;
					client['ON_RANGE_REQUESTS_UPDATED'] = this.ON_RANGE_REQUESTS_UPDATED;
					client['ON_PERIODICAL_REQUESTS_UPDATED'] = this.ON_PERIODICAL_REQUESTS_UPDATED;

					// this.addEvent(this.ON_EXIT, function(req){
					// 	debug_events('ON_EXIT %o', req);
					// 	// if(!Array.isArray(req))
					// 	// 	req = [req]
					//
					// 	client.fireEvent(client.ON_EXIT, [req]);
					// }.bind(this));
					this.addEvent(this.ON_EXIT, req => client.fireEvent(client.ON_EXIT, [req]))

					let __client_suspend = function(req){
						debug_events('ON_SUSPEND %o', req);
						// if(!Array.isArray(req))
						// 	req = [req]

						client.fireEvent(client.ON_SUSPEND, [req]);
					}.bind(this)

					this.addEvent(this.ON_SUSPEND, __client_suspend);


					let __client_resume = function(req){
						debug_events('ON_RESUME %o', req);
						// if(!Array.isArray(req))
						// 	req = [req]

						client.fireEvent(client.ON_RESUME, [req]);
					}.bind(this)

					this.addEvent(this.ON_RESUME, __client_resume);

					// this.addEvent(this.ON_ONCE, function(req){
					// 	debug_events('ON_ONCE %o', req);
					// 	// if(!Array.isArray(req))
					// 	// 	req = [req]
					//
					// 	client.fireEvent(client.ON_ONCE, [req]);
					// }.bind(this));
					this.addEvent(this.ON_ONCE, req => client.fireEvent(client.ON_ONCE, [req]))

					// this.addEvent(this.ON_RANGE, function(req){
					// 	debug_events('ON_RANGE %o', req);
					// 	// if(!Array.isArray(req))
					// 	// 	req = [req]
					// 	client.fireEvent(client.ON_RANGE, [req]);
					// }.bind(this));
					this.addEvent(this.ON_RANGE, req => client.fireEvent(client.ON_RANGE, [req]))

					// this.addEvent(this.ON_DOC_SAVED, function(err, result){
					// 	debug_events('ON_DOC_SAVED', err, result);
					// 	client.fireEvent(client.ON_DOC_SAVED, [err, result]);
					// }.bind(this));
					this.addEvent(this.ON_DOC_SAVED, (err, result) => client.fireEvent(client.ON_DOC_SAVED, [err, result]));

					/**
					 * Events from client to this
					 * */

				 	// client.addEvent(client.ON_EXIT, function(){
					// 	debug_events('client.ON_EXIT %o', arguments);
					// 	this.fireEvent(this.ON_EXIT, [arguments]);
					// }.bind(this));
					client.addEvent(client.ON_SUSPEND, function(){
						debug_events('client.ON_SUSPEND %o', arguments);
						this.removeEvent(this.ON_SUSPEND, __client_suspend);
						this.fireEvent(this.ON_SUSPEND, [arguments]);
						this.addEvent(this.ON_SUSPEND, __client_suspend);
					}.bind(this));

					client.addEvent(client.ON_RESUME, function(){
						debug_events('client.ON_RESUME %o', arguments);
						this.removeEvent(this.ON_RESUME, __client_resume);
						this.fireEvent(this.ON_RESUME, [arguments]);
						this.addEvent(this.ON_RESUME, __client_resume);
					}.bind(this));

					// client.addEvent(client.ON_DOC, function(doc, options){
					// 	debug_events('client.ON_DOC %o', arguments);
					// 	this.fireEvent(this.ON_DOC, [doc, options]);
					// }.bind(this));
					client.addEvent(client.ON_DOC, (doc, options) => this.fireEvent(this.ON_DOC, [doc, options]))

					// client.addEvent(client.ON_DOC_ERROR, function(doc, options){
					// 	debug_events('client.ON_DOC_ERROR %o', arguments);
					// 	this.fireEvent(this.ON_DOC_ERROR, [doc, options]);
					// }.bind(this));
					client.addEvent(client.ON_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_DOC_ERROR, [doc, options]))

					// client.addEvent(client.ON_ONCE_DOC, function(doc, options){
					// 	debug_events('client.ON_ONCE_DOC %o', arguments);
					// 	this.fireEvent(this.ON_ONCE_DOC, [doc, options]);
					// }.bind(this));
					client.addEvent(client.ON_ONCE_DOC, (doc, options) => this.fireEvent(this.ON_ONCE_DOC, [doc, options]))

					// client.addEvent(client.ON_ONCE_DOC_ERROR, function(doc, options){
					// 	debug_events('client.ON_ONCE_DOC_ERROR %o', arguments);
					// 	this.fireEvent(this.ON_ONCE_DOC_ERROR, [doc, options]);
					// }.bind(this));
					client.addEvent(client.ON_ONCE_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_ONCE_DOC_ERROR, [doc, options]))

					// client.addEvent(client.ON_PERIODICAL_DOC, function(doc, options){
					// 	debug_events('client.ON_PERIODICAL_DOC %o', arguments);
					// 	this.fireEvent(this.ON_PERIODICAL_DOC, [doc, options]);
					//
					// }.bind(this));
					client.addEvent(client.ON_PERIODICAL_DOC, (doc, options) => this.fireEvent(this.ON_PERIODICAL_DOC, [doc, options]))

					// client.addEvent(client.ON_PERIODICAL_DOC_ERROR, function(doc, options){
					// 	debug_events('client.ON_PERIODICAL_DOC_ERROR %o', arguments);
					// 	this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, [doc, options]);
					//
					// }.bind(this));
					client.addEvent(client.ON_PERIODICAL_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, [doc, options]))

					// client.addEvent(client.ON_RANGE_DOC, function(doc, options){
					// 	debug_events('client.ON_RANGE_DOC %o', arguments);
					// 	this.fireEvent(this.ON_RANGE_DOC, [doc, options]);
					// }.bind(this));
					client.addEvent(client.ON_RANGE_DOC, (doc, options) => this.fireEvent(this.ON_RANGE_DOC, [doc, options]))

					// client.addEvent(client.ON_RANGE_DOC_ERROR, function(doc, options){
					// 	debug_events('client.ON_RANGE_DOC_ERROR %o', arguments);
					// 	this.fireEvent(this.ON_RANGE_DOC_ERROR, [doc, options]);
					// }.bind(this));
					client.addEvent(client.ON_RANGE_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_RANGE_DOC_ERROR, [doc, options]))

					client.addEvent(client.ON_ONCE_REQUESTS_UPDATED, function(){
						debug_internals('client.ON_REQUESTS_UPDATED %o', client.options.requests.once);
						client.removeEvents(client.ON_ONCE)
						this._process_requests(index, undefined, { once: client.options.requests.once });
					}.bind(this));

					client.addEvent(client.ON_RANGE_REQUESTS_UPDATED, function(){
						debug_internals('client.ON_REQUESTS_UPDATED %o', client.options.requests.range);
						client.removeEvents(client.ON_RANGE)
						this._process_requests(index, undefined, { range: client.options.requests.range });
					}.bind(this));

					client.addEvent(client.ON_PERIODICAL_REQUESTS_UPDATED, function(){
						debug_internals('client.ON_PERIODICAL_REQUESTS_UPDATED %o', client.options.requests.periodical);
						let key = client.options.id;

						if(this.periodicals[key])//if exists, stop and delete all, and process again
							Array.each(this.periodicals[key], function(fn){
								const {type, timer} = fn;
								switch(type){
									case 'task':
										timer.stop();

									case 'timer':
										clearInterval(timer);

									default:
										delete this.periodicals[key];

								}

							}.bind(this));

						Array.each(client.options.requests.periodical, function(app_req){
							this._process_periodical(client, null, app_req, 'periodical');
						}.bind(this));

					}.bind(this));

					/**
					 * DOCS from client to this
					 * */

					// if(client.options && client.options.requests){
					// 	this._process_requests(index, undefined, client.options.requests);
					// }

					/**
					* If client mounts an app it also needs the events
					**/

					// client.addEvent(client.ON_USE, (mount, app) => this.__extend_client_app(app, client, true))
					// client.addEvent(client.ON_USE, function(mount, app){
					// 	this.__extend_client_app(app, client, true)
					// })
					client.addEvent(client.ON_USE, function(mount, app){
						debug_events('client.ON_USE %o', app);

						app['ON_EXIT'] = this.ON_EXIT;
						client.addEvent(client.ON_EXIT, function(){
							debug_events('client.ON_EXIT %o', arguments);
							app.fireEvent(this.ON_EXIT, [arguments]);
						}.bind(this));

						app['ON_DOC'] = this.ON_DOC;
						app['ON_DOC_ERROR'] = this.ON_DOC_ERROR;

						app['ON_ONCE_DOC'] = this.ON_ONCE_DOC;
						app['ON_ONCE_DOC_ERROR'] = this.ON_ONCE_DOC_ERROR;

						app['ON_PERIODICAL_DOC'] = this.ON_PERIODICAL_DOC;
						app['ON_PERIODICAL_DOC_ERROR'] = this.ON_PERIODICAL_DOC_ERROR;

						app['ON_RANGE_DOC'] = this.ON_RANGE_DOC;
						app['ON_RANGE_DOC_ERROR'] = this.ON_RANGE_DOC_ERROR;

						app['ON_ONCE_REQUESTS_UPDATED'] = this.ON_ONCE_REQUESTS_UPDATED;
						app['ON_RANGE_REQUESTS_UPDATED'] = this.ON_RANGE_REQUESTS_UPDATED;
						app['ON_PERIODICAL_REQUESTS_UPDATED'] = this.ON_PERIODICAL_REQUESTS_UPDATED;

						app['ON_ONCE'] = this.ON_ONCE;
						app['ON_RANGE'] = this.ON_RANGE;

						/**
						* app can fire ON_ONCE and ON_RANGE events
						* */
						app.addEvent(app.ON_ONCE, function(req){
							debug_events('app.ON_ONCE %o', req);
							client.fireEvent(client.ON_ONCE, req);
						}.bind(this));

						app.addEvent(app.ON_RANGE, function(req){
							debug_events('ON_RANGE %o', req);
							client.fireEvent(client.ON_RANGE, req);
						}.bind(this));
						/**
						* app can fire ON_ONCE and ON_RANGE events
						* */
					 app.addEvent(app.ON_ONCE_REQUESTS_UPDATED, function(){
						 debug_internals('app.ON_ONCE_REQUESTS_UPDATED %o', app.options.requests.once);
						 client.removeEvents(client.ON_ONCE)
						 this._process_requests(index, app, { once: app.options.requests.once } );
					 }.bind(this));

					 app.addEvent(app.ON_RANGE_REQUESTS_UPDATED, function(){
						 debug_internals('app.ON_RANGE_REQUESTS_UPDATED %o', app.options.requests.range);
						 client.removeEvents(client.ON_RANGE)
						 this._process_requests(index, app, { range: app.options.requests.range } );
					 }.bind(this));

						app.addEvent(app.ON_PERIODICAL_REQUESTS_UPDATED, function(){
							debug_internals('app.ON_PERIODICAL_REQUESTS_UPDATED %o', app.options.requests.periodical);
							let key = app.options.id;

							if(this.periodicals[key])//if exists, stop and delete all, and process again
								Array.each(this.periodicals[key], function(fn){
									const {type, timer} = fn;
									switch(type){
										case 'task':
											timer.stop();

										case 'timer':
											clearInterval(timer);

										default:
											delete this.periodicals[key];

									}

								}.bind(this));

							Array.each(app.options.requests.periodical, function(app_req){
									this._process_periodical(client, app, app_req, 'periodical');
							}.bind(this));

						}.bind(this));

						/**
						 * DOCS from app to client
						 * */
						 app.addEvent(app.ON_DOC, function(doc){
								debug_events('app.ON_DOC %o', arguments);
								client.fireEvent(client.ON_DOC, [doc, {type: 'doc', input_type: client, app: app}]);
							}.bind(this));

							app.addEvent(app.ON_DOC_ERROR, function(doc){
								debug_events('app.ON_DOC_ERROR %o', arguments);
								client.fireEvent(client.ON_DOC_ERROR, [doc, {type: 'doc', input_type: client, app: app}]);
							}.bind(this));
						app.addEvent(app.ON_ONCE_DOC, function(doc){
							debug_events('app.ON_ONCE_DOC %o', doc);
							client.fireEvent(client.ON_ONCE_DOC, [doc, {type: 'once', input_type: client, app: app}]);
						}.bind(this));

						app.addEvent(app.ON_ONCE_DOC_ERROR, function(doc){
							debug_events('app.ON_ONCE_DOC_ERROR %o', doc);
							client.fireEvent(client.ON_ONCE_DOC_ERROR, [doc, {type: 'once', input_type: client, app: app}]);
						}.bind(this));

						app.addEvent(app.ON_PERIODICAL_DOC, function(doc){
							debug_events('app.ON_PERIODICAL_DOC %o', doc);
							client.fireEvent(client.ON_PERIODICAL_DOC, [doc, {type: 'periodical', input_type: client, app: app}]);
						}.bind(this));

						app.addEvent(app.ON_PERIODICAL_DOC_ERROR, function(doc){
							debug_events('app.ON_PERIODICAL_DOC_ERROR %o', doc);
							client.fireEvent(client.ON_PERIODICAL_DOC_ERROR, [doc, {type: 'periodical', input_type: client, app: app}]);
						}.bind(this));


						app.addEvent(app.ON_RANGE_DOC, function(doc){
							debug_events('app.ON_RANGE_DOC %o', doc);
							client.fireEvent(client.ON_RANGE_DOC, [doc, {type: 'range', input_type: client, app: app}]);
						}.bind(this));

						app.addEvent(app.ON_RANGE_DOC_ERROR, function(doc){
							debug_events('app.ON_RANGE_DOC_ERROR %o', doc);
							client.fireEvent(client.ON_RANGE_DOC_ERROR, [doc, {type: 'range', input_type: client, app: app}]);
						}.bind(this));

						/**
						 * DOCS from app to client
						 * */

						if(app.options.requests){

							this._process_requests(index, app, app.options.requests);

						}

					}.bind(this));

					// client.addEvent(client.ON_CONNECT, function(result){
					// 	debug_events('client.ON_CONNECT %o', result);
					// 	process.exit(1)
					// 	this._register_client(index, client);
					// }.bind(this));
					// client.addEvent(client.ON_CONNECT, result => this._register_client(index, client))
					client.addEvent(client.ON_CONNECT, result => this._register_client(index))

					// client.addEvent(client.ON_CONNECT_ERROR, function(err){
					// 	debug_events('client.ON_CONNECT_ERROR %o', err);
					// 	process.exit(1)
					// 	this._register_error(index, client);
					// }.bind(this));
					client.addEvent(client.ON_CONNECT_ERROR, err => this._register_error(index, client));
					// client.addEvent(client.ON_CONNECT_ERROR, err => this._register_error(index));

					debug('Connect->create client %o', client);
				}

				try{
					debug_events('client CONNECTED %o', client.connected);
					if(client.connected === true){
						// process.exit(1)
						// this._register_client(index, client)
						this._register_client(index)
					}
					else if(this.options.connect_retry_count < 0 || this.err_client_count[index] < this.options.connect_retry_count){
						//client.os.api.get({uri: 'hostname'});
						// process.exit(1)
						client.connect();
					}

				}
				catch(e){
					//////console.log(e);

				}

			}//
		}.bind(this));

		//}.bind(this));
	},
	_process_requests: function(index, app, requests){
		let client = this.clients[index]
		app = app || client;

		debug_internals('_process_requests %o', client, app, requests);

		Object.each(requests, function(requests_by_type, type){
			//app.options.requests_by_type.current = type;

			debug_internals('requests_by_type %o', requests_by_type);
			debug_internals('requests_by_type type %s', type);

			Array.each(requests_by_type, function(app_req){

				debug_internals('single req %o', app_req);

				switch(type){
					case 'once':
					// debug('ONCE', client, app, app_req, type, this.options.suspended)
					// process.exit(1)
						if(this.options.suspended !== true)
							this.dispatch(null, client, app, app_req, type);

						// client.addEvent(client.ON_ONCE, function(req){
						// 	debug_events('client.ON_ONCE %o', req);
						// 	this.dispatch(req, app, app_req, type);
						// }.bind(this));
						client.addEvent(client.ON_ONCE, req => this.dispatch(req, client, app, app_req, type))
						break;

					case 'periodical':
						this._process_periodical(client, app, app_req, type);
						break;

					case 'range':
						// client.addEvent(client.ON_RANGE, function(req){
						// 	debug_events('client.ON_RANGE %o', req);
						// 	this.dispatch_range(req, app, app_req, type);
						// }.bind(this));
						client.addEvent(client.ON_RANGE, req => this.dispatch_range(req, client, app, app_req, type))
						break;

				}

			}.bind(this));


		}.bind(this));

	},

	_process_periodical: function(client, app, app_req, type){
		app = app || client;

		let key = app.options.id;
		debug_internals('_process_periodical app %s', app.options.id);

		if(!this.periodicals[key]) this.periodicals[key] = [];

		// let periodical_timer = null;
		// let task = null;
		let periodical_timer,
				task;

		let start = function(){
			if(this.options.suspended == false){
				//console.log('Poller->start', app.options.id)

				let found = this.periodicals[key].some(function(item, index){
					return item.periodical == app_req;
				}.bind(this));

				if(found != true && (!periodical_timer || !periodical_timer._repeat)){

					if(typeof(this.options.requests.periodical) == 'function'){
						let cb = this.dispatch.pass([null, client, app, app_req, type], this);

						task = this.options.requests.periodical(cb);
						task.start();
						this.periodicals[key].push({type: 'function', timer: task, periodical: app_req});
					}
					else{

						periodical_timer = this.dispatch.periodical(
							this.options.requests.periodical,
							this,
							[null, client, app, app_req, type]
						);

						this.periodicals[key].push({type: 'timer', timer: periodical_timer, periodical: app_req});

					}
				}
			}
		}.bind(this);

		let stop = function(){
			this.periodicals[key] = [];

			if(typeof(this.options.requests.periodical) == 'function' && task){
				task.stop();
			}
			else{
				if(periodical_timer && (Number.isInteger(periodical_timer) || periodical_timer._repeat)){
					clearInterval(periodical_timer);
				}
			}
		}.bind(this);

		if(process && process.on){
			process.on('exit',  (code) => stop);
		}
		else if(window && window.onbeforeunload){
			window.onbeforeunload = (code) => stop
		}

		this.addEvent(this.ON_SUSPEND, function(){
			this.options.suspended = true
			debug_events('ON_SUSPEND');
			stop();
		});

		client.addEvent(client.ON_CONNECT_ERROR, function(){
			debug_events('client.ON_CONNECT_ERROR');
			stop();

			client.addEvent(client.ON_CONNECT,start);
		});

		this.addEvent(this.ON_RESUME, function(){
			this.options.suspended = false
			debug_events('ON_RESUME');
			start();
		});
		// this.addEvent(this.ON_RESUME, start);

		client.removeEvent(client.ON_CONNECT, start);


		start();
	},
	__build_range: function(req){
		if((!req.get && req.Range) || req.get('Range')){
			let range = (!req.get) ? req.Range.trim() : req.get('Range').trim()

			let words = /(\w+)(?:\s)(\w+)(?:-)(\w+)/g;
			let match = words.exec(range);
			let type = match[1].toLowerCase();

			let start, end;

			switch (type){
				case 'date':
				case 'utc':
					let date = /^(\d\d\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?$/;
					start = date.exec(match[2]);
					end = date.exec(match[3]);

					start.forEach(function(value, i){
						if(!value)
							start[i] = 0;
					});

					end.forEach(function(value, i){
						if(!value)
							end[i] = 0;
					});

					if(type == 'utc'){
						start = new Date(
							Date.UTC(start[1], start[2], start[3], start[4], start[5], start[6], start[7])
						).getTime();

						end = new Date(
							Date.UTC(end[1], end[2], end[3], end[4], end[5], end[6], end[7])
						).getTime();
					}
					else{
						start = new Date(start[1], start[2], start[3], start[4], start[5], start[6], start[7]).getTime();
						end = new Date(end[1], end[2], end[3], end[4], end[5], end[6], end[7]).getTime();
					}


				break;

				case 'posix':
				case 'epoch':
					start = parseInt(match[2]);
					end = parseInt(match[3]);

				break;

				default:
					throw new Error('Type ['+type+'] not implemented');

			};


			return {
				type: type,
				start: start,
				end: end
			}

		}
		else{
			throw new Error('No Range header!');
		}
	},
	dispatch_range: function(req, client, app, app_req, type){
		if(client.connected === true){
			let range = undefined
			if(Array.isArray(req)){
				range = []
				Array.each(req, function(_req){
					try{
						range.push(this.__build_range(_req))
					}
					catch(e){}

				})
			}
			else{
				range = this.__build_range(req)
			}

			req['options'] = {
				range: range
			};

			debug_internals('dispatch_range %o', req['opt']);

			return this.dispatch(req, client, app, app_req, type);
		}

		return undefined
	},
	dispatch: function(req, client, app, app_req, type){
		debug_internals('->dispatch', req, app, app_req, type, client.connected)
		// process.exit(1)

		if(client.connected === true || type === 'once'){
			let key = Object.keys(app_req)[0];
			let value = Object.values(app_req)[0];

			let verb = (key == 'api') ? Object.keys(value)[0] : key;
			let data = (key == 'api') ? Object.values(value)[0] : value;
			//let original_app = app;

			let dispatch_app = (key == 'api') ? app.api : app;

			let req_client = (req == null) ? null : {
				agent: (req.headers) ? req.headers['user-agent'] : 'internal',
				ip: req.ip || '127.0.0.1'
			};

			app.options.requests.current = {};
			app.options.requests.current.type = type;
			app.options.requests.current.client = req_client;

			if(data instanceof Function){//this way we may run PRE-FUNCTION for complex requests
				debug_internals('dispatch->function %o', [req, dispatch_app[verb]]);

				data.attempt([req, dispatch_app[verb], app], app);
			}
			else{
				debug_internals('dispatch %s %o', verb, dispatch_app[verb], dispatch_app);
				dispatch_app[verb](data);
			}

		}


	},
	// _sanitize_doc: function(doc, doc_id, metadata){
	//
	// 	debug_internals('TO _sanitize_doc isArray %s', Array.isArray(doc));
	//
	// 	if(!doc.data){
	// 		let new_doc = { data: null };
	// 		if(Array.isArray(doc)){
	// 			new_doc.data = doc;
	// 		}
	// 		else{
	// 			new_doc.data = (doc instanceof Object) ? Object.clone(doc) : doc;
	// 		}
	//
	// 		doc = new_doc;
	// 	}
	//
	// 	debug_internals('TO _sanitize_doc %o', doc);
	//
	// 	let timestamp = Date.now();
	//
	// 	if(!doc._id){
	// 		doc._id = doc_id +'@'+timestamp;
	// 	}
	//
	// 	doc['metadata']	 = Object.clone(metadata);
	// 	doc['metadata']['type'] = null;
	// 	doc['metadata']['client'] = null;
	// 	doc['metadata']['timestamp'] = timestamp;
	//
	// 	debug_internals('_sanitize_doc %o', doc);
	//
	// 	return doc;
	// },
	//_register_client: function(client_id, index, client){
	// _register_client: function(index, client){
	_register_client: function(index){
		let client = this.clients[index]

		// client.fireEvent(client.ON_RESUME)
		// debug('_register_client', client)
		// process.exit(1)

		// client = this.__extend_client_app(client, this)
		if(!this.connected_clients)
			this.connected_clients = [];

		// if(!this.connected_clients[index] || this.connected_clients[index] != client){
		if(!this.connected_clients[index]){
			if(client.options && client.options.requests){
				this._process_requests(index, undefined, client.options.requests);
			}

			this.connected_clients[index] = client;

			if(this.err_client_count)
				delete this.err_client_count[index];

			if(this.err_clients)
				delete this.err_clients[index];

			// debug_internals('_register_client %o', client);

			this.fireEvent(this.ON_CLIENT_CONNECT, client);
		}
	},
	//_register_error: function(client_id, index, client){
	_register_error: function(index, client){
	// _register_error: function(index){

		// let client = this.clients[index]
		client.fireEvent(client.ON_SUSPEND)


		this.err_client_count[index] += 1;

		let err_client = {};
		err_client = [];
		err_client[index] = this.clients[index];

		if(!this.err_clients)
			this.err_clients = [];

		// if(this.err_clients[index] != client){
		if(!this.err_clients[index]){
			this.err_clients[index] = client;

			let reconnect_timer

			let reconnect = function(err_client){
				reconnect_timer = this.connect.periodical(this.options.connect_retry_periodical, this, err_client);
			}.bind(this);


			let reconnect_stop = function(){clearInterval(reconnect_timer)}.bind(this);

			// process.on('exit', (code) => reconnect_stop);
			if(process && process.on){
				process.on('exit',  (code) => reconnect_stop);
			}
			else if(window && window.onbeforeunload){
				window.onbeforeunload = (code) => reconnect_stop
			}

			// client.addEvent(client.ON_CONNECT, function(){
			// 	debug_events('client.ON_CONNECT');
			// 	reconnect_stop();
			// });
			client.addEvent(client.ON_CONNECT, reconnect_stop);

			reconnect(err_client);
		}

		// if(this.connected_clients)
		// 	delete this.connected_clients[index];
		this.connected_clients[index] = null
		this.connected_clients = this.connected_clients.clean()

		debug_internals('_register_error %o', client);


		this.fireEvent(this.ON_CLIENT_CONNECT_ERROR, err_client);
	},


});
