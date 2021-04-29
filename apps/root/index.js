'use strict'

const	path = require('path')

const App = require(path.join(process.cwd(), '/libs/App'))

const ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

let debug = require('debug')('mngr-ui-admin:apps:root'),
    debug_internals = require('debug')('mngr-ui-admin:apps:root:Internals');

let eachOf = require( 'async' ).eachOf

const Pipeline = require('../../modules/js-pipeline')

module.exports = new Class({
  Extends: App,

  // ALL_TTL: 60000,
	ALL_TTL: 10000,
  __internal_pipeline: undefined,
  __internal_pipeline_cfg: {},

  options: {
    table: 'os',
    tables: ['os', 'logs', 'munin', 'vhosts', 'os_historical', 'logs_historical', 'munin_historical'],

    pipeline: require('./pipelines/index')({
      conn: Object.merge(
        Object.clone(require(ETC+'ui.conn.js')()),
        {db: 'devel', table: 'os'}
      )
    }),

    internal_pipeline: require('./pipelines/internal')({
      conn: Object.merge(
        Object.clone(require(ETC+'ui.conn.js')()),
        {db: 'devel'}
      )

    }),


    id: 'all',
    path: '/',

    // params: {
		// 	host: /(.|\s)*\S(.|\s)*/,
    //   prop: /data|paths|instances|data_range/,
    //   events: /hosts|paths/,
    //   // stat:
		// },

    routes: {
			all: [
				{
					path: '',
					callbacks: ['404'],
					version: '',
				},
			]
		},

    api: {
      path: '',
			routes: {
				get: [

          {
            path: ':prop/:value?',
            callbacks: ['all'],
            version: '',
          },
          {
            // path: ':host?/:prop?/:paths?',
            path: ':prop?',
            callbacks: ['all'],
            version: '',
          },
				],

			},
		},

		io: {
			// middlewares: [], //namespace.use(fn)
			// rooms: ['root'], //atomatically join connected sockets to this rooms
			routes: {
        '/': [{
					// path: ':param',
					// once: true, //socket.once
					callbacks: ['all', 'register'],
					// middlewares: [], //socket.use(fn)
				}],
        'on': [
          {
            // path: ':events',
            // once: true, //socket.once
            callbacks: ['register'],
            // middlewares: [], //socket.use(fn)
          }
        ],
        'off': [
          {
  					// path: ':events',
  					// once: true, //socket.once
  					callbacks: ['unregister'],
  					// middlewares: [], //socket.use(fn)
  				}
        ],
			}
		},

    // expire: 1000,//ms
	},
  initialize: function(options){

    this.__internal_pipeline = new Pipeline(this.options.internal_pipeline)

    this.__internal_pipeline.addEvent(this.__internal_pipeline.ON_SAVE_DOC, function(doc){
      let {id, type} = doc

      debug_internals('__internal_pipeline onSaveDoc %o', doc)
      // process.exit(1)
      if(id === 'tables' && doc.data.length > 0){
        this.options.tables = doc.data
      }

    }.bind(this))

    this.__internal_pipeline.addEvent(this.__internal_pipeline.ON_DOC_ERROR, function(err, resp){
      let {id, type} = resp
      debug_internals('__internal_pipeline onDocError %o', err, resp)

    }.bind(this))

		debug('this.__internal_pipeline.inputs', this.__internal_pipeline.inputs)

    this.__internal_pipeline_cfg = {
      ids: [],
      connected: [],
      suspended: this.__internal_pipeline.inputs.every(function(input){ return input.options.suspended }, this)
    }

    this.__after_connect_inputs(
      this.__internal_pipeline,
      this.__internal_pipeline_cfg,
      this.__resume_pipeline.pass([this.__internal_pipeline, this.__internal_pipeline_cfg, this.ID, function(){
        debug('__resume_pipeline CALLBACK')
        this.__internal_pipeline.fireEvent('onOnce')
        // this.__internal_pipeline.fireEvent('onResume')
      }.bind(this), false], this)
    )

    this.parent(options)
    debug('end INITIALIZE')
  },
  unregister: function(){
    let {req, resp, socket, next, opts} = this._arguments(arguments)
    // let id = this.__get_id_socket_or_req(socket)
    let filtered_opts = Object.filter(opts, function(value, key){
        return Object.getLength(value) > 0
    })
    filtered_opts = (Object.getLength(filtered_opts) > 0) ? opts : ''
    let id = this.create_response_id(socket, filtered_opts, true)
    debug_internals('UNregister: ', filtered_opts)
    // process.exit(1)

    if(Array.isArray(opts)){
      let _query = opts[0]
      opts = opts[1]
      opts.query = { 'unregister': _query }
    }
    else if (!opts.query.unregister){
      opts.query.unregister = true
    }

    /**
    * refactor: same as "logs" function
    **/
    if(opts.body && opts.query)
      opts.query = Object.merge(opts.query, opts.body)

    if(opts.body && opts.body.params && opts.params)
      opts.params = Object.merge(opts.params, opts.body.params)

    let params = opts.params
    let range = (req) ? req.header('range') : (opts.headers) ?  opts.headers.range : opts.range
    let query = opts.query

    /**
    * "format" is for formating data and need at least metadata: [timestamp, path],
    * so add it if not found on query
    **/
    // if(opts.query && opts.query.format && opts.query.format !== 'merged'){//for stat || tabular
    if(opts.query && opts.query.format){//for stat || tabular || merged
      if(!opts.query.q || typeof opts.query.q === 'string') opts.query.q = []
      let metadata = ['timestamp', 'path']

      if(!opts.query.q.contains('metadata') && !opts.query.q.some(function(item){ return item.metadata }))
        opts.query.q.push({metadata: metadata})

      Object.each(opts.query.q, function(item){
        if(item.metadata){
          item.metadata.combine(metadata)
        }
      })

      if(!opts.query.q.contains('data') && !opts.query.q.some(function(item){ return item.data }))
        opts.query.q.push('data')
    }
    /**
    * refactor: same as "logs" function
    **/


    debug_internals('UN register: ', id, opts)
    // process.exit(1)

    let from = (opts.query && opts.query.from) ? opts.query.from : this.options.table //else -> default table

    let _params = {
      response: id,
      // input: (params.prop) ? 'log' : 'logs',
      input: 'all',
      from: from,
      // params,
      range,
      // query,
      opts,


    }


    this.get_from_input(_params)

  },
  register: function(){
    let {req, resp, socket, next, opts} = this._arguments(arguments)
    // let id = this.__get_id_socket_or_req(socket)
    let id = this.create_response_id(socket, opts, true)
    debug_internals('register: ', opts)

    if(Array.isArray(opts)){
      let _query = opts[0]
      opts = opts[1]
      opts.query = { 'register': _query }
    }

    /**
    * refactor: same as "logs" function
    **/
    if(opts.body && opts.query)
      opts.query = Object.merge(opts.query, opts.body)

    if(opts.body && opts.body.params && opts.params)
      opts.params = Object.merge(opts.params, opts.body.params)

    let params = opts.params
    let range = (req) ? req.header('range') : (opts.headers) ?  opts.headers.range : opts.range
    let query = opts.query

    /**
    * "format" is for formating data and need at least metadata: [timestamp, path],
    * so add it if not found on query
    **/
    // if(opts.query && opts.query.format && opts.query.format !== 'merged'){//for stat || tabular
    let data_formater_full = false
    if(opts.query && opts.query.format){//for stat || tabular || merged
      if(!opts.query.q || typeof opts.query.q === 'string') opts.query.q = []
      let metadata = ['timestamp', 'path']

      if(opts.query.q.contains('metadata') || opts.query.q.some(function(item){ return item.metadata })) data_formater_full = true

      if(!opts.query.q.contains('metadata') && !opts.query.q.some(function(item){ return item.metadata }))
        opts.query.q.push({metadata: metadata})

      Object.each(opts.query.q, function(item){
        if(item.metadata){
          item.metadata.combine(metadata)
        }
      })

      if(!opts.query.q.contains('data') && !opts.query.q.some(function(item){ return item.data }))
        opts.query.q.push('data')
    }
    /**
    * refactor: same as "logs" function
    **/


    debug_internals('register: ', id, opts)
    let from = (opts.query && opts.query.from) ? opts.query.from : this.options.table //else -> default table

    let _params = {
      response: id,
      // input: (params.prop) ? 'log' : 'logs',
      input: 'all',
      from: from,
      // params,
      range,
      // query,
      opts,
      next: function(id, err, result, opts){
        let format = (opts && opts.query) ? opts.query.format : undefined

        if(format !== undefined){
          if(opts.query.index !== false){//data get grouped onto arrays
            eachOf(result.data, function (grouped_value, grouped_key, to_grouped_output) {
              this.data_formater(grouped_value, format, data_formater_full, function(data){

                result.data[grouped_key] = data
                // debug('data_formater', data, responses[key])
                to_grouped_output()
              }.bind(this))

            }.bind(this), function (err) {
              // debug('PRE OUTPUT %o', responses)
              // process.exit(1)
              this.generic_response({err, result, resp: undefined, socket, input: 'all', opts})
            }.bind(this));
          }
          else{
            this.data_formater(result.data, format, data_formater_full, function(data){

              result.data = data
              // debug('data_formater', data, responses[key])
              // to_output()
              this.generic_response({err, result, resp: undefined, socket, input: 'all', opts})

            }.bind(this))
          }
        }
        else{
          // debug('to reponse %o', result)
          // process.exit(1)
          this.generic_response({err, result, resp: undefined, socket, input: 'all', opts})
        }


      }.bind(this)

    }

    this.get_from_input(_params)



  },
  all: function(){
    let {req, resp, socket, next, opts} = this._arguments(arguments)
    if(opts.query && opts.query.register && socket){
      next()
      // this.register.attempt(arguments, this)
    }
    else{
      debug_internals('root: %o %o %o', opts.params, opts.query, opts.body)
			// process.exit(1)
      // debug_internals('root: %o %o %o', arguments)
      if(opts.body && opts.query)
        opts.query = Object.merge(opts.query, opts.body)

      if(opts.body && opts.body.params && opts.params)
        opts.params = Object.merge(opts.params, opts.body.params)

      if(opts.query && opts.query.params && opts.params){
        opts.params = Object.merge(opts.params, opts.query.params)
        delete opts.query.params
      }


      let params = opts.params
      let range = (req) ? req.header('range') : (opts.headers) ?  opts.headers.range : opts.range
      let query = opts.query

      /**
      * "format" is for formating data and need at least metadata: [timestamp, path],
      * so add it if not found on query
      **/
      // if(opts.query && opts.query.format && opts.query.format !== 'merged'){//for stat || tabular
      let data_formater_full = false
      if(opts.query && opts.query.format){//for stat || tabular || merged
        if(!opts.query.q || typeof opts.query.q === 'string') opts.query.q = []
        let metadata = ['timestamp', 'path']

        if(opts.query.q.contains('metadata') || opts.query.q.some(function(item){ return item.metadata })) data_formater_full = true

        if(!opts.query.q.contains('metadata') && !opts.query.q.some(function(item){ return item.metadata }))
          opts.query.q.push({metadata: metadata})

        Object.each(opts.query.q, function(item){
          if(item.metadata){
            item.metadata.combine(metadata)
          }
        })

        if(!opts.query.q.contains('data') && !opts.query.q.some(function(item){ return item.data }))
          opts.query.q.push('data')
      }

			/**
			* DON'T register=changes true with out specifying 1 or more tables using http rest api
			* if a table doesn't recive changes while others do, it will call the "callback" more than once per response
			**/
      let responses = {}
      let from = (opts.query && opts.query.from) ? opts.query.from : this.options.tables
      from = (Array.isArray(from)) ? from : [from]


      eachOf(from, function (_from, key, callback) {
        this.get_from_input({
          response: this.create_response_id((req) ? req : socket, opts),
          from: _from,
          input: 'all',
          range,
          opts,
          next: function(id, err, result){
            debug('NEXT', _from, id)
            // responses.push(result)
            responses[_from] = result
						try {
	            callback()
						}
						catch(e){
							/**
							* this happends when more than one table is registered for changes...if one table doens't have any changes and the other has more than one, will enter here
							**/
							debug('error', _from, id, err)
							// process.exit(1)
						}
          }.bind(this)

        })

      }.bind(this), function (err) {
        let format = (opts && opts.query) ? opts.query.format : undefined

        if(format !== undefined){
          eachOf(responses, function (value, key, to_output) {

            debug('DATA FORMATER FULL', data_formater_full)
            // process.exit(1)
            if(opts.query.index !== false){//data get grouped onto arrays
              eachOf(value.data, function (grouped_value, grouped_key, to_grouped_output) {
                this.data_formater(grouped_value, format, data_formater_full, function(data){

                  value.data[grouped_key] = data
                  debug('data_formater', data, responses[key])
                  to_grouped_output()
                }.bind(this))

              }.bind(this), function (err) {
                debug('PRE OUTPUT %o', responses)
                // process.exit(1)
                to_output()
              }.bind(this));
            }
            else{
              this.data_formater(value.data, format, data_formater_full, function(data){

                value.data = data
                debug('data_formater', data, responses[key])
                to_output()
              }.bind(this))
            }

          }.bind(this), function (err) {
            debug('OUTPUT %o', responses)
            // process.exit(1)
            let result = {id: [], data: {}, metadata: undefined}
            // result.metadata.from = []
            Object.each(responses, function(resp, key){
              result.id.push(resp.id)
              if(resp.data){
                result.data[key] = resp.data
                // result.data.combine(resp.data)
              }
              if(!result.metadata){
                result.metadata = Object.clone(resp.metadata)
                result.metadata.from = []
              }

              result.metadata.from.push(resp.metadata.from)
            }.bind(this))

            debug('RESULT %o', result)
            this.generic_response({err, result, resp, socket, input: 'all', opts})

          }.bind(this));
        }
        else{
          let result = {id: [], data: {}, metadata: undefined}
          // result.metadata.from = []
          // let counter = 0
          Object.each(responses, function(value, key){
            result.id.push(value.id)
            if(value.data)
              result.data[key] = value.data

            if(!result.metadata){
              result.metadata = Object.clone(value.metadata)
              result.metadata.from = []
            }

            result.metadata.from.push(value.metadata.from)

          }.bind(this))

          debug('RESULT %o', result)
          this.generic_response({err, result, resp, socket, input: 'all', opts})

        }

      }.bind(this))



    }

  },

});
