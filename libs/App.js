'use strict'

var	path = require('path')

const App =  process.env.NODE_ENV === 'production'
      ? require(path.join(process.cwd(), '/config/prod.conf'))
      : require(path.join(process.cwd(), '/config/dev.conf'))

const ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

const jscaching = require('../modules/js-caching')

let RedisStoreIn = require('../modules/js-caching.store.redis').input
let RedisStoreOut = require('../modules/js-caching.store.redis').output

const Pipeline = require('../modules/js-pipeline')

let debug = require('debug')('mngr-ui-admin:libs:App'),
    debug_internals = require('debug')('mngr-ui-admin:libs:App:Internals');

const uuidv5 = require('uuid/v5')

const data_formater = require('../modules/node-tabular-data')

let eachOf = require( 'async' ).eachOf


module.exports = new Class({
  Extends: App,
  // Implements: Chain,

  ON_PIPELINE_READY: 'onPipelineReady',
  ID: 'ea77ccca-4aa1-448d-a766-b23efef9c12b',
  SESSIONS_TTL: 60000,


  cache: undefined,
  session_store: undefined,

  // __forks: {},
  __responses: {},
  __response_events: {},
  __registered_intervals: {},

  options: {
    libs: path.join(process.cwd(), '/libs'),

		cache_store: {
      NS: 'a22cf722-6ea9-4396-b2b3-9440dd677dd0',
      id: 'ui.cache',
      suspended: false,
      ttl: 2000,
      stores: [
        {
          // NS: 'a22cf722-6ea9-4396-b2b3-9440dd677dd0',
          id: '0',
          input: Object.merge(Object.clone(require(ETC+'default.redis')), {module: RedisStoreIn}),
					output: Object.merge({
	          buffer:{
	            size: -1,
	            expire: 1000, //ms
							periodical: 500 //how often will check if buffer timestamp has expire
	          }
					},
					Object.clone(require(ETC+'default.redis')),
					{module: RedisStoreOut})
				}
      ],
    },
  },

  initialize: function(options){
    if(this.options.api && this.options.api.routes)
    	Object.each(this.options.api.routes, function(routes, verb){

  			if(verb != 'all'){
  				Array.each(routes, function(route){
  					//debug('route: ' + verb);
            route.callbacks.unshift('__process_pipeline')
            route.callbacks.unshift('__process_request')
  					route.callbacks.unshift('__process_session')
            route.callbacks.unshift('__post_process')
  				});
  			}

  		});



    if(this.options.io && this.options.io.routes)
      Object.each(this.options.io.routes, function(routes, verb){

  			if(verb != 'all'){
  				Array.each(routes, function(route){
  					//debug('route: ' + verb);
            route.callbacks.unshift('__process_pipeline')
            route.callbacks.unshift('__process_request')
            route.callbacks.unshift('__process_session')
  				});
  			}

  		});

    this.parent(options)

    debug_internals('initialize %O', this.options.api.routes)

		this.profile('mngr-ui-admin-app_init');//start profiling

    this.cache = new jscaching(this.options.cache_store)

    data_formater.require_path = this.options.libs
    data_formater.ID = this.ID
    data_formater.cache = this.cache

    this.profile('hosts_init');//end profiling

		this.log('mngr-ui-admin-app', 'info', 'mngr-ui-admin-app started');
  },
  register_interval: function(id, cb, interval, params) {

    if(!this.__registered_intervals[id]) this.__registered_intervals[id] = {}
    let uuid = uuidv5(JSON.stringify(params), this.ID)

    this.__registered_intervals[id][uuid] = setInterval(cb, interval, params)

    debug_internals('register_interval', id, interval, uuid)

    return this.__registered_intervals[id][uuid]
  },
  unregister_interval: function(id, params) {
    debug_internals('unregister_interval', id, params)
    if(this.__registered_intervals[id]){
      if(!params || params === null){//clear All intervals
        if(Object.getLength(this.__registered_intervals[id]) > 0){
          let __registered_intervals= this.__registered_intervals[id]
          Object.each(__registered_intervals, function(interval, uuid){
            clearInterval(interval)
            delete this.__registered_intervals[id][uuid]
          }.bind(this))
          return true
        }
        else{
          return false
        }
      }
      else{
        let uuid = uuidv5(JSON.stringify(params))
        clearInterval(this.__registered_intervals[id][uuid])
        return true
      }

    }
    else{
      return false
    }



  },
  create_response_id: function(socket_or_req, resp_id, no_index){
    if(typeof resp_id !== 'string')
      resp_id = uuidv5(JSON.stringify(resp_id), this.ID)

    // debug_internals('register_response', socket_or_req.id)
    let id = this.__get_id_socket_or_req(socket_or_req)

    let session = (socket_or_req.session) ? socket_or_req.session : socket_or_req.handshake.session

    // let isSocket = (socket_or_req.session) ? false : true

    // session._resp = session._resp+1 || 0
    // let resp_id = id +'.'+session._resp
    if(!session.responses[resp_id]) session.responses[resp_id] = []

    let _index = session.responses[resp_id].length

    let new_resp_id

    // if(isSocket){
    if(no_index === true){
      new_resp_id = id +'.'+ resp_id
    }
    else{
      new_resp_id = id +'.'+ resp_id +'.'+_index
    }

    session.responses[resp_id].push(new_resp_id)

    return new_resp_id
  },
  register_response: function(socket_or_req, resp_id, cb){

    let session = (socket_or_req.session) ? socket_or_req.session : socket_or_req.handshake.session

    if(!session.responses[resp_id]) session.responses[resp_id] = []

    let new_resp_id = this.create_response_id(socket_or_req, resp_id)

    debug_internals('register_response', resp_id)
    if(new_resp_id){
      let _chain = new Chain()
      _chain.chain(
        function(){
          delete this.__responses[new_resp_id]
          session.responses[resp_id] = session.responses[resp_id].erase(new_resp_id)
          session.responses[resp_id] = session.responses[resp_id].clean()
          debug_internals('deleting register_response', resp_id, new_resp_id, session.responses[resp_id], this.__responses)
        }.bind(this),
        cb
      )
      this.__responses[new_resp_id] = _chain
      return {id: new_resp_id, chain: _chain}
    }
    else{
      throw new Error('Couldn\'t register response, no ID')
    }
  },
  response: function (id, err, resp){
    debug_internals('response', id, err)
    // let id = (socket_or_req.id) ? socket_or_req.id : socket_or_req.session.id
    if(this.__responses[id]){
      let _chain = this.__responses[id]
      debug_internals('response', id, _chain)
      while (_chain.callChain(err, resp) !== false) {}
    }
  },

  data_formater: data_formater,

  generic_response: function(payload){
    let {err, result, resp, socket, input, opts} = payload

    debug('generic_response', input, result.metadata)

	  result.metadata.opts = opts

    // debug_internals('generic_response', err, result, socket)

    let status = (err && err.status) ? err.status : ((err) ? 500 : 200)
    if(err)
      result = Object.merge(err, result)

      if(resp){
        resp.status(status).json(result)
      }
      else{
        debug_internals('generic_response', err, result, input)
        socket.emit(input, result)
        // process.exit(1)
      }

  },

  add_response_event: function(resp_id, cb){
    debug_internals('add_response_event', resp_id)

    if(!this.__response_events[resp_id]) this.__response_events[resp_id] = []
    this.__response_events[resp_id].push(cb)
    this.addEvent(resp_id, cb)


  },

  remove_response_event: function(resp_id){
    debug_internals('remove_response_event', resp_id)
    if(this.__response_events[resp_id] && this.__response_events[resp_id].length > 0){
      Array.each(this.__response_events[resp_id], function(cb){
        this.removeEvent(resp_id, cb)
      }.bind(this))

      delete this.__response_events[resp_id]
    }
  },
  remove_matching_response_events: function(id){
    debug_internals('remove_matching_response_events', id)

    let __response_events = Object.clone(this.__response_events)

    Object.each(__response_events, function(events, resp_id){
      if(resp_id.indexOf(id) === 0){
				this.remove_response_event(resp_id)
        // delete this.__response_events[resp_id]
			}
    }.bind(this))
  },
  get_from_input: function(payload){

    // let {response, from, next, req, input, params, key, range, query} = payload
    let {response, from, next, req, input, key, range, opts} = payload
    let query = opts.query || {}
    let params = opts.params || {}
    from = from || this.options.table
		let register = ( query && query.register && query.register !== undefined ) ? true : false
    let cache_key = (key) ? input+'.'+from+'.'+key : input+'.'+from
    cache_key = (params && params.prop && params.value) ? cache_key+'.'+params.prop+'.'+params.value : cache_key
		// cache_key = (query && query.index) ? cache_key+'.'+query.index : cache_key
    // cache_key = (query && query.q) ? cache_key+'.'+uuidv5(JSON.stringify(query.q), this.ID) : cache_key
    // cache_key = (query && query.q && query.fields) ? cache_key+'.'+uuidv5(JSON.stringify(query.fields), this.ID) : cache_key
		cache_key = (query && register === false) ? cache_key+'.'+uuidv5(JSON.stringify(query), this.ID) : cache_key

    debug_internals('__get cache key %s %s', cache_key, input.toUpperCase(), this[input.toUpperCase()+'_TTL'], range, payload)
		// process.exit(1)

    this.cache.get(cache_key, function(err, result){
      // debug_internals('__get cache ERR %o %d %s',  (err) ? true : false, (err) ? err.status : 200, (err) ? new Date(err.expired) : '')
			debug_internals('this.cache.get', cache_key, err, result)
			// process.exit(1)
      if(
        !result
        || (range && range !== undefined)
				|| register === true
        // || (query && query.transformation)
        // || (query && query.aggregation)
        // || (query && query.filter)
      ){//even on result ranges search are not used from cache
        this.get_pipeline(req, function(pipe){
            debug_internals('__get get_pipeline', pipe)
						// process.exit(1)
            // let _get_resp = {}
            // _get_resp[response] = function(err, resp){
            let _get_resp = function(err, resp){
              debug_internals('_get_resp %s %s %o', err, JSON.stringify(resp), params) //resp
							// process.exit(1)
              if(resp.id == response){

                if(
                  ( !range || range === undefined )
									&& register === false
                  // && (!query || (!query.transformation && !query.aggregation && !query.filter))
                ){//don't cache ranges searchs

                  this.cache.set(cache_key, resp, this[input.toUpperCase()+'_TTL'])
                  // debug_internals('CACHE SET %s %o', cache_key, payload, input.toUpperCase()+'_TTL', this[input.toUpperCase()+'_TTL']) //resp
									// process.exit(1)
                }


                if(params && params.prop && !params.value){
                  let _arr_resp = resp['data']

                  debug_internals('PARAMS %o', _arr_resp) //resp

                  if(!Array.isArray(_arr_resp))
                    _arr_resp = [_arr_resp]

                  Array.each(_arr_resp, function(data, index){
                    if(data)
                      Object.each(data, function(value, key){
                        debug_internals('_get_resp delete key %s %s', key, params.prop)
                        if( key !== params.prop)
                          delete data[key]
                      })
                  })

                    resp['data'] = _arr_resp

                }
                // send_resp[req_id](resp)
                resp.metadata.from = from
                resp.metadata.input = input

                debug_internals('_get_resp %O', next) //resp

                // resp.opts = opts

                if(next)
                  next(response, err, resp, opts)

                /**
                * if it's registered (socket) keep the event so it gets fired on each response
                **/
                // if(!query.register){
								if(register === false){
                  // this.removeEvent(response, _get_resp[response])
                  // delete _get_resp[response]
                  this.remove_response_event(response)
                }
              }
            }.bind(this)

            // debug_internals('get_from_input addEvent', response)

            // this.addEvent(response, _get_resp[response])
            if(query.unregister){
              // this.removeEvent(response, _get_resp[response])
              // delete _get_resp[response]
              this.remove_response_event(response)
            }
            else{
              this.add_response_event(response, _get_resp)
            }

            debug_internals('inputs', input)
						// process.exit(1)
            if(range){
              pipe.get_input_by_id(input).fireEvent('onRange', {
                from,
                id: response,
                Range:range,
                params,
                query
              })
            }
            else{
              pipe.get_input_by_id(input).fireEvent('onOnce', {
                from,
                id: response,
                params,
                query
              })
            }

            // pipe.inputs[0].fireEvent('onOnce', {from: from, id: response})//fire only the 'hosts' input

          }.bind(this))
      }
      else{

        debug_internals('from cache %o', result, cache_key) //result
				// process.exit(1)
        let resp = {id: response, metadata: {from, input, cache: {key: cache_key, ttl: this[input.toUpperCase()+'_TTL']}}}
        if(params && (Object.every(params, function(value, key){ return value === undefined }) || params.value)){
          // resp['data'] = result
          debug_internals('from cache MERGE %o', result)
          // resp.data = Object.merge(resp.data, result.data)
          resp.data = result.data
        }
        else{

          // resp[input] = {}
          let _arr_resp = result.data
          if(!Array.isArray(_arr_resp))
            _arr_resp = [_arr_resp]

          if(params && params.prop){
            Array.each(_arr_resp, function(data, index){
              if(data){
                Object.each(data, function(value, key){
                  debug_internals('_get_resp delete key %s %s', key, params)
                  if(params && key !== params.prop)
                    delete data[key]
                })
              }

            })
          }

          resp['data'] = _arr_resp

        }

        if(next)
          next(response, undefined, resp)
      }

    }.bind(this))
  },

  socket: function(socket){
    debug_internals('socket.io connect', socket.id)

		this.parent(socket)

    socket.compress(true)

    // this.__process_session({socket, next: this.__process_pipeline.pass({next: this.__process_request})})

		socket.on('disconnect', function () {
      // process.exit(1)
      this.remove_matching_response_events(socket.id)

      debug_internals('socket.io disconnect', socket.id, this.__pipeline, this.__pipeline_cfg, this.__response_events)

      this.__get_session_id_by_socket(socket.id, function(err, sid){
        debug_internals('disconnect __get_session_by_socket', err, sid)
        if(sid)
          this.__update_sessions({id: sid, type: 'socket'}, true)//true == remove
      }.bind(this))

      if(this.__pipeline_cfg && this.__pipeline_cfg.ids.contains(socket.id)){
        this.__pipeline_cfg.ids.erase(socket.id)
        this.__pipeline_cfg.ids = this.__pipeline_cfg.ids.clean()
      }

      if(this.__pipeline){
        debug_internals('TO UNREGISTER', socket.id)

        this.unregister_interval(socket.id)

        this.__pipeline.fireEvent('onOnce', {
          query: {'unregister': true},
          id: socket.id,
        })//unregister on all inputs

      }

      if(this.__pipeline_cfg && this.__pipeline_cfg.ids.length === 0 && this.__pipeline_cfg){ // && this.pipeline.suspended == false
        this.__pipeline_cfg.suspended = true
        this.__pipeline.fireEvent('onSuspend')
      }


		}.bind(this));
	},
  /**
  * Pipeline
  **/
  get_pipeline: function(req, cb){
    let id = (req && req.id) ? req.id : undefined
    // if(id){
      if(this.__pipeline.inputs.length != this.__pipeline_cfg.connected.length){
          this.__after_connect_inputs(
            this.__pipeline,
            this.__pipeline_cfg,
            this.__resume_pipeline.pass([this.__pipeline, this.__pipeline_cfg, id, cb.pass(this.__pipeline), false], this)
          )
      }
      else{
        this.__resume_pipeline(this.__pipeline, this.__pipeline_cfg, id, cb.pass(this.__pipeline), false)
      }

  },
  /**
  * middleware callback (injected on initialize)
  **/
  __process_pipeline: function(){
    // debug_internals('__process_pipeline', arguments)
    let {req, resp, socket, next, opts} = this._arguments(arguments)

    let id = (socket) ? socket.id : undefined

    if(!this.__pipeline){

      this.__pipeline = new Pipeline(this.options.pipeline)

      this.__pipeline.addEvent(this.__pipeline.ON_SAVE_DOC, function(doc){
        let {id, type} = doc

        debug_internals('__pipeline onSaveDoc %o', id)

        if(id)
          this.fireEvent(id, [undefined, doc])


        if(type)
          this.fireEvent(type, [undefined, doc])

      }.bind(this))

      this.__pipeline.addEvent(this.__pipeline.ON_DOC_ERROR, function(err, resp){
        let {id, type} = resp

        debug_internals('__pipeline onDocError %o', err, resp)

        if(id)
					this.fireEvent(id, [err, resp])

        if(type)
          this.fireEvent(type, [err, resp])

      }.bind(this))

      this.__pipeline_cfg = {
        ids: [],
        connected: [],
        suspended: this.__pipeline.inputs.every(function(input){ return input.options.suspended }, this)
      }

      this.__after_connect_inputs(
        this.__pipeline,
        this.__pipeline_cfg,
        this.__resume_pipeline.pass([this.__pipeline, this.__pipeline_cfg, id, next], this)
      )

    }
    else{
      if(this.__pipeline.inputs.length != this.__pipeline_cfg.connected.length){
          this.__after_connect_inputs(
            this.__pipeline,
            this.__pipeline_cfg,
            this.__resume_pipeline.pass([this.__pipeline, this.__pipeline_cfg, id, next], this)
          )
      }
      else{
        this.__resume_pipeline(this.__pipeline, this.__pipeline_cfg, id, next)
      }
    }


  },
  __after_connect_inputs: function(pipeline, cfg, cb){

    let _client_connect = function(index){
      debug_internals('__after_connect_inputs %o %d', cfg.connected, index)

      // cfg.connected.push(true)
      cfg.connected[index] = true
      if(cfg.connected.every(function(input){ return input }) && pipeline.inputs.length === cfg.connected.length && cb && typeof cb === 'function'){
        cb()
      }


      pipeline.inputs[index].removeEvent('onClientConnect', _client_connect)
    }.bind(this)

    Array.each(pipeline.inputs, function(input, index){
      debug('__after_connect_inputs INPUT', input.clients)
      if(Object.getLength(input.clients) > 0 && Object.every(input.clients, function(poller, key){ return poller.connected })){
        debug('__after_connect_inputs ALREADY CONNECTED', index)
        _client_connect(index)
      }
      else{
        input.addEvent('onClientConnect', _client_connect.pass(index));
      }
    }.bind(this))
  },
  /**
  * use event === false on get_pipeline, so it won't fire the event
  **/
  __resume_pipeline: function(pipeline, cfg, id, cb, event){
    debug_internals('__resume_pipeline', pipeline, cfg, id)

    if(id){
      if(!cfg.ids.contains(id))
        cfg.ids.push(id)

      if(cfg.suspended === true){
        debug_internals('__resume_pipeline this.pipeline.connected', cfg.connected)

        if(cfg.connected.every(function(item){ return item === true}.bind(this))){
          cfg.suspended = false
          pipeline.fireEvent('onResume')
        }
        else{
          let __resume = []
          Array.each(pipeline.inputs, function(input, index){
            if(cfg.connected[index] !== true){
              __resume[index] = function(){
                this.__resume_pipeline(pipeline, cfg, id)
                input.conn_pollers[0].removeEvent('onConnect', __resume[index])
              }.bind(this)
              input.conn_pollers[0].addEvent('onConnect', () => __resume[index])
            }

          }.bind(this))

        }

      }
    }

    if(cb){
      if(event === false){
        cb()
      }
      else{
        let _chain = new Chain();
        _chain.chain(
          cb,
          this.fireEvent.pass([this.ON_PIPELINE_READY, pipeline], this)
        );

        while (_chain.callChain() !== false) {}
      }
    }
    else{
      this.fireEvent(this.ON_PIPELINE_READY, pipeline)
    }

  },
  /**
  * @end Pipeline
  **/

  /**
  * middleware callback (injected on initialize)
  **/
  __process_request: function(){
    // debug_internals('__process_request', arguments)
    let {req, resp, socket, next, opts} = this._arguments(arguments)

		if(req){
			// req.on("close", function() {
			// 	if(req.aborted){
			// 	  debug('client closed', req.aborted, req)
			// 		process.exit(1)
			// 	}
			// }.bind(this));

			// req.on("close", function () {
	    //   // process.exit(1)
			// 	if(req.aborted){
			// 		let id = this.__get_id_socket_or_req(req)
			//
			// 		this.remove_matching_response_events(id)
			//
		  //     // debug_internals('socket.io disconnect', socket.id, this.__pipeline, this.__pipeline_cfg, this.__response_events)
			//
		  //     this.__get_session_by_id(id, function(err, sid){
		  //       debug_internals('disconnect __get_session_by_socket', err, sid)
		  //       if(sid)
		  //         this.__update_sessions({id: sid, type: 'http'}, true)//true == remove
		  //     }.bind(this))
			//
		  //     if(this.__pipeline_cfg && this.__pipeline_cfg.ids.contains(id)){
		  //       this.__pipeline_cfg.ids.erase(id)
		  //       this.__pipeline_cfg.ids = this.__pipeline_cfg.ids.clean()
		  //     }
			//
		  //     if(this.__pipeline){
		  //       debug_internals('TO UNREGISTER', id)
			//
		  //       this.unregister_interval(id)
			//
		  //       this.__pipeline.fireEvent('onOnce', {
		  //         query: {'unregister': true},
		  //         id: id,
		  //       })//unregister on all inputs
			//
		  //     }
			//
		  //     if(this.__pipeline_cfg && this.__pipeline_cfg.ids.length === 0 && this.__pipeline_cfg){ // && this.pipeline.suspended == false
		  //       this.__pipeline_cfg.suspended = true
		  //       this.__pipeline.fireEvent('onSuspend')
		  //     }
			// 	}
			// }.bind(this))

			req.on("close", function() {
				if(req.aborted){
					try {

		        let id = this.__get_id_socket_or_req(req)

		        this.remove_matching_response_events(id)

						if(this.__pipeline){
		          debug_internals('TO UNREGISTER', id)
							// process.exit(1)

		          this.__pipeline.fireEvent('onOnce', {
		            query: {'unregister': true},
		            id: id,
		          })//unregister on all inputs

		        }

		        debug_internals('__post_process', id)
					}
					catch(e){
						debug('err', e)
						process.exit(1)
					}
				}

      }.bind(this))
		}
    /**
    * don' allow register === periodical for "req", even on NODE_ENV !== 'production'
    **/
    if(req && req.query && req.query.register && req.query.register === 'periodical')
      delete req.query.register

    if(process.env.NODE_ENV === 'production' && req && req.query){
      delete req.query.register
      debug_internals('__process_request cleaning req.query...', req.query)
    }

    if(next)
      next()
  },

  __post_process: function(){
		let {req, resp, socket, next, opts} = this._arguments(arguments)

    if(resp){
      resp.on("finish", function() {
        debug_internals('FINISH')
        let id = this.__get_id_socket_or_req((req) ? req : socket)

        if(req){
          this.remove_matching_response_events(id)

          if(this.__pipeline){
            debug_internals('TO UNREGISTER', id)

            this.__pipeline.fireEvent('onOnce', {
              query: {'unregister': true},
              id: id,
            })//unregister on all inputs

          }
        }
        debug_internals('__post_process', id)
      }.bind(this));
    }


    //
    //
    // if(process.env.NODE_ENV === 'production' && req && req.query){
    //   delete req.query.register
    //   debug_internals('__process_request cleaning req.query...', req.query)
    // }

    if(next)
      next()
  },
  /**
  * @start - session
  **/
  __get_id_socket_or_req: function(socket_or_req){
    // debug_internals('register_response', socket_or_req.id)
    return (socket_or_req.id) ? socket_or_req.id : socket_or_req.session.id
  },
  /**
  * middleware callback (injected on initialize)
  **/
  __process_session: function(){
    let {req, resp, socket, next, opts} = this._arguments(arguments)

    let session = (socket) ? socket.handshake.session : req.session
    debug_internals('__process_session', session)

    // let id = (socket) ? socket.id : req.session.id
    // debug_internals('__process_session store', (socket) ? socket.handshake.sessionStore : req.sessionStore)

    if(!this.session_store)
      this.session_store = (socket) ? socket.handshake.sessionStore : req.sessionStore

    this.__update_sessions({id: session.id, type: (socket) ? 'socket' : 'http'})

    // if(!session.events)
    //   session.events = []
    //
    // if(!session.hosts_events)
    //   session.hosts_events= {}

    if(socket){
      if(!session.sockets) session.sockets = []

      session.sockets.include(socket.id)
    }

    if(!session.responses) session.responses = {}

    // return session
    if(next)
      next()
  },

  __update_sessions: function(session, remove){
    remove = remove || false
    this.cache.get(this.ID+'.sessions', function(err, sessions){
      if(!sessions || sessions == null) sessions = {}

      session = [session]
      if(remove === false){
        Array.each(session, function(_session){
          if(!sessions[_session.type]) sessions[_session.type] = []
          sessions[_session.type] = sessions[_session.type].include(_session.id)
        })

      }
      else{
        Array.each(session, function(_session){
          if(sessions[_session.type])
            sessions[_session.type] = sessions[_session.type].erase(_session.id)
        })
      }

      this.cache.set(this.ID+'.sessions', sessions, this.SESSIONS_TTL)
    }.bind(this))
  },


  __get_session_by_id: function(id, cb){

    if(this.session_store && typeof this.session_store.get == 'function'){
      try{
        this.session_store.get(id, cb)
      }
      catch(e){
        debug_internals('this.session_store.get error', e)
      }
    }
    else if(this.session_store && this.session_store.sessions[id]){//MemoryStore
      cb(undefined, this.session_store.sessions[id])
    }
    else{
      cb({status: 404, message: 'session not found'}, undefined)
    }


  },

  __get_session_id_by_socket: function(socketId, cb){
    debug_internals('__get_session_id_by_socket', socketId)

    if(this.session_store && typeof this.session_store.all == 'function'){
      try{
        this.session_store.all(function(err, sessions){
          if(err) cb(err, sessions)

          debug_internals('__get_session_id_by_socket this.session_store.all', sessions.length)

          let found = false
          Object.each(sessions, function(session, sid){
            if(session && session.sockets && session.sockets.contains(socketId)){
              cb(undefined, sid)
              found = true
            }
          }.bind(this))

          if(found === false) cb({status: 404, message: 'session not found'}, undefined)

        })
      }
      catch(e){
        debug_internals('this.session_store.get error', e)
      }
    }
    else if(this.session_store && this.session_store.sessions){//MemoryStore
      debug_internals('__get_session_id_by_socket this.session_store.sessions', this.session_store.sessions)
      let found = false
      Object.each(this.session_store.sessions, function(session, sid){
        if(session && session.sockets && session.sockets.contains(socketId)){
          cb(undefined, sid)
          found = true
        }
      }.bind(this))

      if(found === false) cb({status: 404, message: 'session not found'}, undefined)
    }
    else{//last resort, search by IDs using cache
      // cb({status: 404, message: 'session not found'}, undefined)
      this.cache.get(this.ID+'.sessions', function(err, sessions){

        if(sessions && sessions['socket'] && sessions['socket'].length > 0){
          let found = false
          Array.each(sessions['socket'], function(sid){
            this.__get_session_by_id(sid, function(err, session){
              if(session){
                found = true
                cb(undefined, sid)
              }
            })
          }.bind(this))

          if(found === false) cb({status: 404, message: 'session not found'}, undefined)
        }
        else{
          cb({status: 404, message: 'session not found'}, undefined)
        }
      }.bind(this))
    }

  },
  /**
  * @end - session
  **/

})
