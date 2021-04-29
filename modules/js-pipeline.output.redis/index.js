/**
 * quick & dirty redis output (base on rethinkdb)
 * not tested or fully checked, just "works" as cache store.output
* */

'use strict'

const	mootools = require('mootools'),
			Output = require('../js-pipeline.output')

let redis = require('redis')


var debug = require('debug')('js-pipeline.output.Redis');
var debug_events = require('debug')('js-pipeline.output.Redis:Events');
var debug_internals = require('debug')('js-pipeline.output.Redis:Internals');

/**
 * RethinkDBOutput
 *
 * */
module.exports = new Class({
  // Implements: [Options, Events],
	Extends: Output,

  // dbs: [],
  accept: false,
	connected: false,
	__connect_cb: undefined,

  conns: [],
  buffer: [],
  buffer_expire: 0,

  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',
  ON_ACCEPT: 'onAccept',

  ON_DOC: 'onDoc',
	//ON_DOC_ERROR: 'onDocError',

	ON_ONCE_DOC: 'onOnceDoc',
	//ON_ONCE_DOC_ERROR: 'onOnceDocError',

	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
  //ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',

  ON_SAVE_DOC: 'onSaveDoc',
  ON_SAVE_MULTIPLE_DOCS: 'onSaveMultipleDocs',

  ON_DOC_SAVED: 'onDocSaved',

  options: {
		id: null,
		// conn: [
		// 	{
    host: '127.0.0.1',
		port: undefined,
		db: undefined,
    // table: undefined,
    redis: {},
    // rethinkdb: {
		// 	// 'user': undefined, //the user account to connect as (default admin).
		// 	// 'password': undefined, // the password for the user account to connect as (default '', empty).
		// 	// 'timeout': undefined, //timeout period in seconds for the connection to be opened (default 20).
		// 	// /**
		// 	// *  a hash of options to support SSL connections (default null).
		// 	// * Currently, there is only one option available,
		// 	// * and if the ssl option is specified, this key is required:
		// 	// * ca: a list of Node.js Buffer objects containing SSL CA certificates.
		// 	// **/
		// 	// 'ssl': undefined,
		// },
		// 	},
		// ],

		buffer:{
      size: 5,//-1 =will add until expire | 0 = no buffer | N > 0 = limit buffer no more than N
			expire: 5000, //miliseconds until saving
			periodical: 1000 //how often will check if buffer timestamp has expire
		},

    // insert: {durability: 'hard', returnChanges: 'always', conflict: 'replace'},
	},
	connect: function(){
		let connect_cb = (this.__connect_cb !== undefined && typeOf(this.__connect_cb) ===  "function") ? this.__connect_cb.bind(this) : this.__connect.bind(this)
		debug_events('connect')

    if(this.options.conn){
			connect_cb(undefined, this.options.conn)
		}
		else{
			let opts = Object.merge(
        this.options.redis,
        {
					host: this.options.host,
					port: this.options.port,
					db: this.options.db
        }
      )
			let client = redis.createClient(opts)
		  client.on('connect', function(){ connect_cb(undefined, client) }.bind(this))
      client.on('error', function(err){ connect_cb(err, undefined) }.bind(this))
			// client.on('connect', connect_cb(undefined, client) )
      // client.on('error', (err) => connect_cb(err, undefined))
			// let opts = {
			// 	host: this.options.host,
			// 	port: this.options.port,
			// 	db: this.options.db
			// };
			//
			// debug_internals('to connect %o ', Object.merge(opts, this.options.rethinkdb))
			// this.r.connect(Object.merge(opts, this.options.rethinkdb), connect_cb)

		}
	},
  __connect: function(err, conn){
		debug_events('__connect %o', err, conn)
		// process.exit(1)
		if(err){
			this.connected = false
			this.fireEvent(this.ON_CONNECT_ERROR, { error: err });
			// throw err
		}
		else {
			this.conn = conn
			this.connected = true
			this.fireEvent(this.ON_CONNECT, { conn: conn });

      // let index = params.index
      // this.options.conn[index].accept = true

		}
	},
	initialize: function(options, connect_cb){
		this.parent(options);

    this.__connect_cb = connect_cb

		// debug('initialize', this.options)
		// process.exit(1)
    // let _default_conn_options = Object.clone(this.options.conn[0])
		// //console.log('---RethinkDBOutput->init---');
		// //throw new Error();
		//
		// this.setOptions(options);
		//
    // // debug_internals('initialize', this.options, _default_conn_options)
		//
		// if(typeOf(this.options.conn) != 'array'){
		// 	var conn = this.options.conn;
		// 	this.options.conn = [];
		// 	this.options.conn.push(conn);
		// }
		//
		// Array.each(this.options.conn, function(conn, index){
		// 	conn = Object.merge(_default_conn_options, conn)
		//
    //   debug_internals('initialize', conn)
		//
    //   let opts = Object.merge(
    //     conn.redis,
    //     {
    //       host: conn.host,
    //       port: conn.port,
    //       db: conn.db
    //     }
    //   )
		//
    //   let _cb = function(err, conn){
    //     this.conns[index] = conn
    //     connect_cb = (typeOf(connect_cb) ==  "function") ? connect_cb.bind(this) : this.connect.bind(this)
    //     connect_cb(err, conn, Object.merge(opts, {index: index}))
    //   }.bind(this)
		//
    //   let client = redis.createClient(opts)
		//
		//
    //   client.on('connect', function(){ _cb(undefined, client) }.bind(this))
    //   client.on('error', function(err){ _cb(err, undefined) }.bind(this))
		//
		// }.bind(this));
		//
    // this.addEvent(this.ON_SAVE_DOC, function(doc){
		// 	debug_events('this.ON_SAVE_DOC %o', doc);
		//
		// 	this.save(doc);
		// }.bind(this));
		//
		// this.addEvent(this.ON_SAVE_MULTIPLE_DOCS, function(docs){
		// 	debug_events('this.ON_SAVE_MULTIPLE_DOCS %o', docs);
		//
		// 	this.save(docs);
		// }.bind(this));
		//
		// this.buffer_expire = Date.now() + this.options.buffer.expire;
		// this._expire_buffer.periodical(this.options.buffer.periodical, this);

	},
	// save: function(doc){
	// 	debug_internals('save %o', doc);
	//
	// 	if(this.options.buffer.size == 0){
	//
	// 		this._save_to_dbs(doc)
	// 	}
	// 	// else if( this.buffer.length < this.options.buffer.size && this.buffer_expire > Date.now()){
	// 	// 	this.buffer.push(doc);
	// 	// }
	// 	else{
  //     if((typeof(doc) == 'array' || doc instanceof Array || Array.isArray(doc)) && doc.length > 0){
  //       Array.each(doc, function(d){
  //         this.buffer.push(d)
  //         if(this.options.buffer.size > 0 && this.buffer.length >= this.options.buffer.size){
  //           this._save_buffer()
  //         }
  //       }.bind(this))
  //     }
  //     else{
  // 			this.buffer.push(doc)
  //     }
	//
	//
	// 	}
	// },
  // _save_to_dbs: function(doc){
	//
  //   Array.each(this.conns, function(conn, index){
  //     // let table = this.options.conn[index].table
  //     let db = this.options.conn[index].db
  //     let table = this.options.conn[index].table
  //     let accept = this.options.conn[index].accept
	//
  //     debug_internals('_save_to_dbs %s %s %o', db, table, this.options.conn[index])
  //     if(accept === true){
  //       this._save_docs(doc, index);
  //     }
  //     else{
  //       let _save = function(){
  //         this._save_docs(doc, index);
  //         this.removeEvent(this.ON_ACCEPT, _save)
  //       }.bind(this)
  //       this.addEvent(this.ON_ACCEPT, _save)
  //     }
	//
	//
	//
  //   }.bind(this));
  // },
	_save_to_output: function(doc){

    if(this.connected === true){
      this._save_docs(doc);
    }
    else{
      let _save = function(){
        this._save_docs(doc);
        this.removeEvent(this.ON_CONNECT, _save)
      }.bind(this)
      this.addEvent(this.ON_CONNECT, _save)
    }

  },
	_save_docs: function(doc, index){
		debug_internals('_save_docs %o %s %o', doc, index, this.options.insert);

    if(!Array.isArray(doc)) doc = [doc]

    let db = this.options.db
    // let table = this.options.conn[index].table
    let conn = this.conn

    let multi = conn.multi()
    Array.each(doc, function(d, i){
      let key = d.id
      delete d.id
      multi.set(key, JSON.stringify(d))

      if(i == doc.length -1)
        multi.exec(function (err, result) {
          debug_internals('multi.exec', err, result)
          this.fireEvent(this.ON_DOC_SAVED, [err, result])
        }.bind(this))
    }.bind(this))
    // this.r.db(db).table(table).insert(doc, this.options.insert).run(conn, function(err, result){
    //   debug_internals('insert result %o', err, result);
    //   this.fireEvent(this.ON_DOC_SAVED, [err, result])
    // }.bind(this))

	},
  // _expire_buffer: function(){
	// 	if(this.buffer_expire <= Date.now() && this.buffer.length > 0){
  //     debug_internals('_expire_buffer %o', this.buffer_expire);
	// 		this._save_buffer()
	// 	}
	//
	// },
	// _save_buffer: function(){
	// 	// if(this.buffer_expire <= Date.now() && this.buffer.length > 0){
  //     // debug_internals('_save_buffer %o', this.buffer);
	// 		// let doc = this.buffer;
	// 		// this._save_docs(Array.clone(this.buffer));
	//
  //     // if(this.accept === true){
  //       this._save_to_dbs(Array.clone(this.buffer));
  // 			this.buffer = [];
  // 			this.buffer_expire = Date.now() + this.options.buffer.expire;
  //     // }
	//
	// 		// debug_internals('_save_buffer %o', doc);
	// 	// }
	//
	// }
});
