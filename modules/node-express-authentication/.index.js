var path = require('path'),
	fs = require('fs'),
	util = require('util'),
	moootools = require('mootools'),
	//for authentication
	flash = require('connect-flash'), //for passport flash
	LocalStrategy = require('passport-local').Strategy,
	BasicStrategy = require('passport-http').BasicStrategy,
	UniqueTokenStrategy = require('passport-unique-token').Strategy;
	//session = require('express-session');//for passport session

var	packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '/package.json')));

exports.VERSION = packageJSON.version.split('.');

//exports.Memory = require('./lib/memory.js');
// var Memory = require('./lib/memory.js');
// exports.Memory = Memory;

//exports.Imap = require('./lib/imap.js');
// var Auth = require('./lib/imap.js');
// exports.Auth = Auth;


module.exports = new Class({
// module.exports =  new Class({
  Implements: [Options, Events],


  ON_AUTH: 'onAuth',

  app: null,
  passport: null,
  store: null,
  auth: null,

  options: {
		//store: null,
		//auth: null,
		passport : {
			session: true,
		}
	},

  initialize: function(app, store, auth, options){

		this.setOptions(options);

		this.app = app;

		this.store = store;

		this.auth = auth;

	// 	this.store = new Memory();
	// 	this.auth = new Auth();

		this.passport = require('passport');

		// Passport session setup.
		//   To support persistent login sessions, Passport needs to be able to
		//   serialize users into and deserialize users out of the session.  Typically,
		//   this will be as simple as storing the user ID when serializing, and finding
		//   the user by ID when deserializing.
		this.passport.serializeUser(this.store.serialize.bind(this.store));

		this.passport.deserializeUser(this.store.deserialize.bind(this.store));

		/**var authenticate = function(username, password, done) {
			//console.log('node-express-auth: '+ username + ' ' +password);

			// asynchronous verification, for effect...
			process.nextTick(function () {

				// Find the user by username.  If there is no user with the given
				// username, or the password is not correct, set the user to `false` to
				// indicate failure and set a flash message.  Otherwise, return the
				// authenticated `user`.
				this.auth.authenticate(username, password, function(err, user) {

					user = this.store.findByUserName(user);

					this.fireEvent(this.ON_AUTH, {error: err, username: username});

					if (!user) {
						return done(null, false, { error: err });
					}

					return done(null, user);

				}.bind(this))

			}.bind(this));
		};**/

		this.extend_app(app);
		app.addEvent(app.ON_LOAD_APP, this.extend_app.bind(this));

		app.express().use(flash());//for passport

		app.express().use(this.passport.initialize());
		if(this.options.passport.session === true)
			app.express().use(this.passport.session());



  },
  extend_app: function(app){
		//console.log('extend app');
		//console.log(typeof(app));

		//this.addEvent(this.ON_AUTH, function(obj){
		this.addEvent(this.ON_AUTH, function(err, user){
			if(app.log){
				if(err){
					//app.log('authentication', 'warn', 'authentication : ' + util.inspect(obj));
					app.log('authentication', 'warn', 'authentication : ' + util.inspect({error: err, username: user}));
				}
				else{
					//app.log('authentication', 'info', 'authentication : ' + util.inspect(obj));
					app.log('authentication', 'info', 'authentication : ' + util.inspect({username: user}));
				}
			}
		}.bind(this));

		//var authenticate = function(req, res, next, func){
			///**
			 //* Authorization: Basic bGJ1ZW5vOjQwYmQwMDE1NjMwODVmYzM1MTY1MzI5ZWExZmY1YzVlY2JkYmJlZWY=
			 //*
			 //* */

			//if(req.headers.authorization && req.headers.authorization.indexOf('Basic') == 0){
				////console.log('nod-express-auth: setting BasicStrategy');
				//// Use the LocalStrategy within Passport.
				////   Strategies in passport require a `verify` function, which accept
				////   credentials (in this case, a username and password), and invoke a callback
				////   with a user object.  In the real world, this would query a database;
				////   however, in this example we are using a baked-in set of users.
				//this.passport.use(new BasicStrategy(this.authenticate.bind(this)));


				//this.passport.authenticate('basic', {session: this.options.passport.session}, func)(req, res, next);
			//}
			//else{
				///**
				 //* Content-Type: application/json
				 //*
				 //* {"username": "lbueno", "password": "40bd001563085fc35165329ea1ff5c5ecbdbbeef"}
				 //* */
				////console.log('nod-express-auth: setting LocalStrategy');
				//// Use the LocalStrategy within Passport.
				////   Strategies in passport require a `verify` function, which accept
				////   credentials (in this case, a username and password), and invoke a callback
				////   with a user object.  In the real world, this would query a database;
				////   however, in this example we are using a baked-in set of users.
				//this.passport.use(new LocalStrategy(this.authenticate.bind(this)));

				//this.passport.authenticate('local', {session: this.options.passport.session}, func)(req, res, next);

			//}
		//}.bind(this);


		if(typeof(app) == 'function'){
			app.implement({
				authenticate: this._authenticate.bind(this)
			});
		}
		else{
			app['authenticate'] = this._authenticate.bind(this);
		}

		////console.log("app['authenticate']");
		////console.log(app.authenticate);


		//var check_authentication = function(req, res, next){
			//console.log('---check_authentication--');

			//if (!req.isAuthenticated()) {

			////console.log('check_authentication');
			//////console.log(app);
			////if(req.headers.authorization && req.headers.authorization.indexOf('Basic') == 0){

				//////console.log(this);

				///**
				 //* this refers to the express app instance, NOT this instance
				 //* */
				//this['authenticate'](req, res, next,  function(err, user, info) {

					//console.log('---err---');
					//console.log(err);
					//console.log(info);

					////if (err) {
						////this.log('login', 'error', err);
						////req.flash('error', err);
						////this['500'](req, res, next, { error: err });
					////}
					////else
					//if (!user) {
						//const message = (info) ? info.message : err;
						//this.log('login', 'warn', 'login authenticate ' + message);
						//req.flash('error', err);
						//this['403'](req, res, next, {error: message });
					//}
					//else{
						//req.logIn(user, function(err) {
							//if (err) {
								//this.log('login', 'error', err);
								//req.flash('error', err);
								//this['500'](req, res, next, { error: err.message });
							//}
							//else{
								//next();
							//}
							////console.log('error');
							////console.log(err);

							////return next();

						//}.bind(this));
					//}

				//}.bind(this));//bound to the express app instance

			//}
			//else{
				////console.log('authenticated');
				//next();
			//}

		//};



		//implements a check_authentication function on the App, only if the App doens't implement one
		if(!app.check_authentication){
			if(typeof(app) == 'function'){
				app.implement({
					check_authentication: this._check_authentication.bind(this)
				});
			}
			else{
				app['check_authentication'] = this._check_authentication.bind(this);
			}
		}




  },
  check_user: function(){
		return function(req, res, next){
			console.log('---check_user.middleware--');
			this._check_user(req, res, next);
		}.bind(this);
	},
	_check_user: function(req, res, next){
		console.log('---check_user--');

		if (!req.isAuthenticated()) {

			/**
			 * this refers to the express app instance, NOT this instance
			 * */
			this._authenticate(req, res, next,  function(err, user, info) {

				console.log('---err---');
				console.log(err);
				console.log(info);
				console.log(user);
				console.log(req.user);

				if (!user) {
					req.user = { username: 'anonymous' }
					//const message = (info) ? info.message : err;
					//this.app.log('login', 'warn', 'login authenticate ' + message);
					//req.flash('error', err);
					//this.app['403'](req, res, next, {error: message });
					next();
				}
				else{
					req.logIn(user, function(err) {
						//if (err) {
							//this.app.log('login', 'error', err);
							//req.flash('error', err);
							//this.app['500'](req, res, next, { error: err.message });
						//}
						//else{
							next(err);
						//}

					}.bind(this));
				}

			}.bind(this));//bound to the express app instance

		}
		else{
			//console.log('authenticated');
			next();
		}
	},
  //middleware
  check_authentication: function(){
		return function(req, res, next){
			console.log('---check_authentication.middleware--');
			this._check_authentication(req, res, next);
		}.bind(this);
	},
  _check_authentication: function(req, res, next){
		console.log('---check_authentication--');

		if (!req.isAuthenticated()) {

		//console.log('check_authentication');
		////console.log(app);
		//if(req.headers.authorization && req.headers.authorization.indexOf('Basic') == 0){

			////console.log(this);

			/**
			 * this refers to the express app instance, NOT this instance
			 * */
			this._authenticate(req, res, next,  function(err, user, info) {

				console.log('---err---');
				console.log(err);
				console.log(info);
				console.log(user);

				//if (err) {
					//this.log('login', 'error', err);
					//req.flash('error', err);
					//this['500'](req, res, next, { error: err });
				//}
				//else
				if (!user) {
					const message = (info) ? info.message : err;
					this.app.log('login', 'warn', 'login authenticate ' + message);
					req.flash('error', err);
					this.app['403'](req, res, next, {error: message });
				}
				else{
					req.logIn(user, function(err) {
						if (err) {
							this.app.log('login', 'error', err);
							req.flash('error', err);
							this.app['500'](req, res, next, { error: err.message });
						}
						else{
							next();
						}
						//console.log('error');
						//console.log(err);

						//return next();

					}.bind(this));
				}

			}.bind(this));//bound to the express app instance

		}
		else{
			//console.log('authenticated');
			next();
		}

	},
	_authenticate: function(req, res, next, func){

		/**
			 * https://github.com/Lughino/passport-unique-token
			 * guid generator: https://www.guidgenerator.com/online-guid-generator.aspx
			 *
			 * */

		if(
			req.params.token ||
			req.body.token ||
			req.query.token ||
			req.headers.token

		){

				this.passport.use(new UniqueTokenStrategy(
					//this.authenticate.bind(this))
					function (token, done) {
						this.authenticate.attempt([{token: token}, null, done], this)
					}.bind(this)
				));
				this.passport.authenticate('token', {session: this.options.passport.session}, func)(req, res, next);
		}
		/**
		 * Authorization: Basic bGJ1ZW5vOjQwYmQwMDE1NjMwODVmYzM1MTY1MzI5ZWExZmY1YzVlY2JkYmJlZWY=
		 *
		 * */

		else if(req.headers.authorization && req.headers.authorization.indexOf('Basic') == 0){
			//console.log('nod-express-auth: setting BasicStrategy');
			// Use the LocalStrategy within Passport.
			//   Strategies in passport require a `verify` function, which accept
			//   credentials (in this case, a username and password), and invoke a callback
			//   with a user object.  In the real world, this would query a database;
			//   however, in this example we are using a baked-in set of users.
			this.passport.use(new BasicStrategy(this.authenticate.bind(this)));


			this.passport.authenticate('basic', {session: this.options.passport.session}, func)(req, res, next);
		}
		else{
			/**
			 * Content-Type: application/json
			 *
			 * {"username": "lbueno", "password": "40bd001563085fc35165329ea1ff5c5ecbdbbeef"}
			 * */
			//console.log('nod-express-auth: setting LocalStrategy');
			// Use the LocalStrategy within Passport.
			//   Strategies in passport require a `verify` function, which accept
			//   credentials (in this case, a username and password), and invoke a callback
			//   with a user object.  In the real world, this would query a database;
			//   however, in this example we are using a baked-in set of users.
			this.passport.use(new LocalStrategy(this.authenticate.bind(this)));

			this.passport.authenticate('local', {session: this.options.passport.session}, func)(req, res, next);

		}
	},
  authenticate: function(username, password, done) {
		console.log('node-express-auth-authenticate: ', arguments);

		// asynchronous verification, for effect...
		//process.nextTick(function () {

			// Find the user by username.  If there is no user with the given
			// username, or the password is not correct, set the user to `false` to
			// indicate failure and set a flash message.  Otherwise, return the
			// authenticated `user`.
			this.auth.authenticate(username, password, function(err, user) {

				console.log('----authenticate-----')	;
				console.log(user);
				console.log(err);

				let callback = function(user){
					// console.log('----authenticate.callback-----')	;
					// console.log(arguments);
					//this.fireEvent(this.ON_AUTH, {error: err, user: user});
					this.fireEvent(this.ON_AUTH, [err, user]);

					if (err) {
						return done(err, false);
					}

					return done(null, user);
				}.bind(this)

				if(user){
					if(user.token){
						user = this.store.findByToken(user.token, callback);
					}
					else{
						user = this.store.findByUserName(user, callback);
					}
				}
				else{
					callback()
				}



			}.bind(this))

		//}.bind(this));
  }

});

// exports.Authentication = Authentication;
