'use strict'

const	mootools = require('mootools'),
      r = require('rethinkdb'),
      Output = require('../js-pipeline.output')


const debug = require('debug')('js-pipeline:output:RethinkDB'),
      debug_events = require('debug')('js-pipeline:output:RethinkDB:Events'),
      debug_internals = require('debug')('js-pipeline:output:RethinkDB:Internals')

/**
 * RethinkDBOutput
 *
 * */
module.exports = new Class({
  Extends: Output,

  __connect_cb: undefined,

  // dbs: [],
  accept: false,
  conns: [],
  buffer: [],
  buffer_expire: 0,

  options: {

		conn: [
			{
        host: '127.0.0.1',
				port: 28015,
				db: undefined,
        table: undefined,
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
			},
		],

    insert: {durability: 'soft', returnChanges: false, conflict: 'replace'},
	},
  __connect(err, conn, params){
		debug_events('connect %o', err, conn)
    // process.exit(1)
		if(err){
			this.fireEvent(this.ON_CONNECT_ERROR, { error: err, params: params });
			// throw err
		}
		else {
			// this.conn = conn
			this.fireEvent(this.ON_CONNECT, { conn: conn,  params: params});

      let index = params.index
      this.options.conn[index].accept = true

      this.fireEvent(this.ON_ACCEPT)

      // try{
      //   let index = params.index
      //   let db = this.options.conn[index].db
      //   let table = this.options.conn[index].table
      //
      //   this.r.dbList().run(conn, function(err, dbs){
      //     debug_internals('connect-> setting dbs %o %s', dbs, db);
      //     let exist = false
      //     Array.each(dbs, function(d){
      //       if(d == db)
      //         exist = true
      //     })
      //
      //     if(exist === false){
      //       debug_internals('connect-> setting db/table %o', this.options.conn[index]);
      //       this.r.dbCreate(db).run(conn, function(err, result){
      //         // this._save_docs(doc, index);
      //         try{
      //           this.r.db(db).tableCreate(table).run(conn, function(err, result){
      //             debug_internals('connect-> setting db/table %o create', err, result);
      //             this.options.conn[index].accept = true
      //
      //             this.fireEvent(this.ON_ACCEPT)
      //           }.bind(this))
      //         }
      //         catch(e){
      //           // this._save_docs(doc, index);
      //           debug_internals('tableCreate error %o', e);
      //         }
      //       }.bind(this));
      //     }
      //     else {
      //       this.options.conn[index].accept = true
      //
      //       this.fireEvent(this.ON_ACCEPT)
      //     }
      //   }.bind(this))
      //
      //
      // }
      // catch(e){
      //   // console.log(e)
      //   debug_internals('dbCreate error %o', err);
      //   // this._save_docs(doc, index);
      // }
		}
	},
  connect: function(){
    if(typeOf(this.options.conn) != 'array'){
			let conn = this.options.conn;
			this.options.conn = [];
			this.options.conn.push(conn);
		}

		Array.each(this.options.conn, function(conn, index){
			// this.dbs.push( new(couchdb.Connection)(conn.host, conn.port, conn.opts).database(conn.db) );

      let opts = {
  			host: conn.host,
  			port: conn.port,
  			db: conn.db
  		};

      let _cb = function(err, conn){
        this.conns[index] = conn
        let connect_cb = (this.__connect_cb !== undefined && typeOf(this.__connect_cb) ===  "function") ? this.__connect_cb.bind(this) : this.__connect.bind(this)
        connect_cb(err, conn, Object.merge(opts, {index: index}))
      }.bind(this)



  		this.r.connect(Object.merge(opts, conn.rethinkdb), _cb)
		}.bind(this));


  },
	initialize: function(options, connect_cb){
    this.parent(options);
	  this.r = require('rethinkdb')

    this.__connect_cb = connect_cb
	},
	_save_to_output: function(doc){

    Array.each(this.conns, function(conn, index){
      // let table = this.options.conn[index].table
      let db = this.options.conn[index].db
      let table = this.options.conn[index].table
      let accept = this.options.conn[index].accept

      debug_internals('_save_to_output %s %s %o', db, table, this.options.conn[index])
      if(accept === true){
        this._save_docs(doc, index);
      }
      else{
        let _save = function(){
          this._save_docs(doc, index);
          this.removeEvent(this.ON_ACCEPT, _save)
        }.bind(this)
        this.addEvent(this.ON_ACCEPT, _save)
      }
    }.bind(this));
  },
  _save_docs: function(doc, index){
		debug_internals('_save_docs %o %s %o', doc, index, this.options.insert);
    // process.exit(1)
    let db = this.options.conn[index].db
    let table = this.options.conn[index].table
    let conn = this.conns[index]

    this.r.db(db).table(table).insert(doc, this.options.insert).run(conn, function(err, result){
      debug_internals('insert result %o', err, result);
      this.fireEvent(this.ON_DOC_SAVED, [err, result])
    }.bind(this))


	},

});
