'use strict'

const App = require ( 'node-app-rethinkdb-client/index' )

let debug = require('debug')('js-pipeline.inputs.rethinkdb-rest'),
    debug_internals = require('debug')('js-pipeline.inputs.rethinkdb-rest:Internals');


const roundMilliseconds = function(timestamp){
  let d = new Date(timestamp)
  d.setMilliseconds(0)

  // console.log('roundMilliseconds', d.getTime())
  return d.getTime()
}

const uuidv5 = require('uuid/v5')

const async = require('async')

module.exports = new Class({
  Extends: App,

  ID: '',
  registered: {},
  registered_ids: {},
  feeds: {},
  close_feeds: {},
  changes_buffer: {},
  changes_buffer_expire: {},
  periodicals: {},

  options: {
    db: undefined,
    table: undefined,
    type: undefined,

		requests : {
      once: [


      ],

      /**
      * periodical data always comes from 'periodical' table
      **/
      periodical: [

      ],

      range: [

      ]

		},

		routes: {



		},


  },



  initialize: function(options){

  	this.parent(options);//override default options

		this.profile('js-pipeline.inputs.rethinkdb-rest_init');//start profiling


		this.profile('js-pipeline.inputs.rethinkdb-rest_init');//end profiling

		this.log('js-pipeline.inputs.rethinkdb-rest', 'info', 'js-pipeline.inputs.rethinkdb-rest started');
  },
  query_with_filter: function(query, filter){

    let _query_filter, _query_filter_value

    if(filter){
      if(typeof filter === 'string'){
        // _query_filter = filter.split(':')[0]
        // _query_filter_value = filter.split(':').slice(1)
        debug('query_with_filter STRING', filter, eval("this."+filter))
        query = query.filter(eval("this."+filter))
        debug('query_with_filter STRING', filter, query)
      }
      else if(Array.isArray(filter)){//allow chaining filters
        Array.each(Array.clone(filter), function(_filter, index){
          query = this.query_with_filter(query, _filter)
        }.bind(this))
      }
      else{
        // _query_filter = Object.keys(filter)[0]
        // _query_filter_value = filter[_query_filter]
        query = query.filter(filter)

        debug('query_with_filter OBJECT', filter, query)
      }


    }



    return query
  },
  query_with_transformation: function(query, transformation){
    let _query_transform, _query_transform_value

    if(transformation){
      if(typeof transformation === 'string'){
        _query_transform = transformation.split(':')[0]
        _query_transform_value = transformation.split(':').slice(1)
      }
      else if(Array.isArray(transformation)){//allow chaining transformations
        Array.each(Array.clone(transformation), function(transform, index){
          query = this.query_with_transformation(query, transform)
        }.bind(this))
      }
      else{
        _query_transform = Object.keys(transformation)[0]
        _query_transform_value = transformation[_query_transform]
      }

      if(_query_transform){
        debug('query_with_transformation %o %o', _query_transform, _query_transform_value)

        switch(_query_transform){
          case 'sample':
            query = query.sample(_query_transform_value * 1)
            break;

          case 'limit':
            query = query.limit(_query_transform_value * 1)
            break;

          /**
          * don't use nth, use slice instead (produce an error, because query end up needing a sequence after this)
          **/
          case 'nth':
            query = query.nth(_query_transform_value * 1)
            break;

          case 'skip':
            query = query.skip(_query_transform_value * 1)
            break;

          case 'slice':
            query = query.slice(_query_transform_value[0] * 1, _query_transform_value[1] * 1, _query_transform_value[2])
            break;

          case 'orderBy':
            // query = query.orderBy(eval(_query_transform_value))
            let value = (_query_transform_value.index) ? _query_transform_value.index : _query_transform_value

            if(value && value.indexOf('(') > -1){
              value = value.replace('r.', '')
              value = value.replace(')', '')
              debug('orderBy ', value)
              let order = value.substring(0, value.indexOf('('))
              let index = value.substring(value.indexOf('(') + 1)
              debug('orderBy ',order, index)

              if(_query_transform_value.index)
                _query_transform_value.index = this.r[order](index)
              else
                _query_transform_value = this.r[order](index)
            }



            query = query.orderBy(_query_transform_value)
            break;
        }
      }
    }

    debug('query_with_transformation %o', query)
    return query
  },
  result_with_aggregation: function(query, aggregation){

    let _query_aggregation, _query_aggregation_value

    if(aggregation){
      if(typeof aggregation === 'string'){
        _query_aggregation = aggregation.split(':')[0]
        _query_aggregation_value = aggregation.split(':').slice(1)
      }
      else{
        _query_aggregation = Object.keys(aggregation)[0]
        _query_aggregation_value = aggregation[_query_aggregation]
      }

      debug_internals('result_with_aggregation %o', aggregation, _query_aggregation, _query_aggregation_value)

      /**
      * for "contains"
      * ex:
      * "aggregation":{
    	*	"contains": ["('data')('status')", 500]
    	* }
      **/
      let _query_aggregation_param
      if(Array.isArray(_query_aggregation_value)){
        _query_aggregation_param = _query_aggregation_value[1]
        _query_aggregation_value = _query_aggregation_value[0]
      }

      if(_query_aggregation_value)
        query = query
        .map(
          function (doc) {
            return eval( "doc"+_query_aggregation_value );
          }.bind(this)
        )

      switch(_query_aggregation){
        case 'count':
          query = query.count()
          break;

        case 'min':
          query = query.min()
          break;

        case 'max':
          query = query.max()
          break;

        case 'sum':
          query = query.sum()
          break;

        case 'avg':
          query = query.avg()
          break;

        case 'distinct':
          query = query.distinct()
          break;

        case 'contains':
          query = query.contains(_query_aggregation_param)
          break;
      }
    }



    return query
  },

  build_default_result: function(query, callback){
    let _groups = {}
    // let groups = []

    let _path_query = query.distinct({index: 'path'}).coerceTo('array')

    let self = this

    if(!callback){
      return new Promise(function(resolve, reject) {
        _path_query.run(self.conn, {arrayLimit: 1000000}, function(err, paths){
          debug('build_default_result PATHS %o %o', err, paths)

          if(err) reject(err)

          if(!Array.isArray(paths) || paths.length === 0){
            resolve(paths)
          }
          else{
            // let group = {}
            async.eachOf(paths, function (path, index, _async_callback) {
              if(!_groups[path]) _groups[path] = {}

              _groups[path].path = path

              //COUNT
              self._build_default_result_count(query, path, function(err, resp){
                if(err) _async_callback(err)

                _groups[path].count = resp
                debug('_build_default_result_count %o', _groups[path])

                //HOSTS
                self._build_default_result_hosts(query, path, function(err, resp){
                  if(err) _async_callback(err)

                  _groups[path].hosts = resp
                  debug('_build_default_result_hosts %o', _groups[path])

                  //TAGS
                  self._build_default_result_tags(query, path, function(err, resp){
                    if(err) _async_callback(err)

                    _groups[path].tags = resp
                    debug('_build_default_result_tags %o', _groups[path])

                    //RANGE
                    self._build_default_result_range(query, path, function(err, resp){
                      if(err) _async_callback(err)

                      _groups[path].range = resp
                      debug('_build_default_result_range %o', _groups[path])

                      //TYPES
                      self._build_default_result_types(query, path, function(err, resp){
                        if(err) _async_callback(err)

                        _groups[path].types = resp
                        debug('_build_default_result_types %o', _groups[path])

                        // process.exit(1)
                        // _groups[path].push(_groups[path])
                        _async_callback()
                      })

                    })

                  })

                })

              })
            }, function (err) {
              debug('build_default_result ERR %o', err)
              if(err){
                reject(err)
              }
              else{
                let data = (Object.values(_groups).length > 0 ) ? Object.values(_groups) : []
                resolve(data)
              }
            // process.exit(1)
            })
          }


          // })
          // process.exit(1)
        })

      })
    }
    else {
      _path_query.run(this.conn, {arrayLimit: 1000000}, function(err, paths){
        debug('build_default_result PATHS %o %o', err, paths)

        if(err) callback(err, Object.values(_groups))

        if(!Array.isArray(paths) || paths.length === 0){
          callback(err, paths)
        }
        else{
          // let group = {}
          async.eachOf(paths, function (path, index, _async_callback) {
            if(!_groups[path]) _groups[path] = {}

            _groups[path].path = path

            //COUNT
            self._build_default_result_count(query, path, function(err, resp){
              if(err) _async_callback(err)

              _groups[path].count = resp
              debug('_build_default_result_count %o', _groups[path])

              //HOSTS
              self._build_default_result_hosts(query, path, function(err, resp){
                if(err) _async_callback(err)

                _groups[path].hosts = resp
                debug('_build_default_result_hosts %o', _groups[path])

                //TAGS
                self._build_default_result_tags(query, path, function(err, resp){
                  if(err) _async_callback(err)

                  _groups[path].tags = resp
                  debug('_build_default_result_tags %o', _groups[path])

                  //RANGE
                  self._build_default_result_range(query, path, function(err, resp){
                    if(err) _async_callback(err)

                    _groups[path].range = resp
                    debug('_build_default_result_range %o', _groups[path])

                    //TYPES
                    self._build_default_result_types(query, path, function(err, resp){
                      if(err) _async_callback(err)

                      _groups[path].types = resp
                      debug('_build_default_result_types %o', _groups[path])

                      // process.exit(1)
                      // groups.push(group)
                      _async_callback()
                    })

                  })

                })

              })

            })
          }, function (err) {
            debug('build_default_result ERR %o %o', err, _groups)
            // process.exit(1)
            let data = (Object.values(_groups).length > 0 ) ? Object.values(_groups) : []
            callback(err, data)
          // process.exit(1)
          })
        }


        // })
        // process.exit(1)
      })
    }



  },
  _build_default_result_count: function(query, path, callback){
    let _count_query = query.getAll(path, {index: 'path'}).count()
    _count_query.run(this.conn, {arrayLimit: 1000000}, callback)
  },
  _build_default_result_hosts: function(query, path, callback){
    let _hosts_query = query.getAll(path, {index: 'path'})('metadata')('host').distinct().coerceTo('array')
    _hosts_query.run(this.conn, {arrayLimit: 1000000}, callback)
  },
  _build_default_result_tags: function(query, path, callback){
    let _tags_query = query.getAll(path, {index: 'path'})('metadata')('tag').distinct().coerceTo('array')
    _tags_query.run(this.conn, {arrayLimit: 1000000}, function(err, resp){
      let tags = []
      if(Array.isArray(resp)){
        Array.each(resp, function(_tags){
          tags.combine(_tags)
        })

      }

      callback(err, tags)

    })
  },
  _build_default_result_range: function(query, path, callback){
    let range = []
    let self = this
    let _range_query_min = query.getAll(path, {index: 'path'})('metadata')('timestamp').min()
    _range_query_min.run(this.conn, {arrayLimit: 1000000}, function(err, resp){
      range[0] = resp

      let _range_query_max = query.getAll(path, {index: 'path'})('metadata')('timestamp').max()
      _range_query_max.run(self.conn, {arrayLimit: 1000000}, function(err, resp){
        range[1] = resp
        callback(err, range)
      })


    })
  },
  _build_default_result_types: function(query, path, callback){
    let _types_query = query.getAll(path, {index: 'path'})('metadata')('type').distinct().coerceTo('array')
    _types_query.run(this.conn, {arrayLimit: 1000000}, callback)
  },
  build_default_result_between: function(doc){
    let self = this
    return {
      path: doc('group'),
      count: doc('reduction').count(),
      hosts: doc('reduction').filter(function (doc) {
        return doc('metadata').hasFields('host');
      }).map(function(doc) {
        return self.r.object(doc('metadata')('host'), true) // return { <country>: true}
      }).reduce(function(left, right) {
          return left.merge(right)
      }).default({}).keys(),
      types: doc('reduction').filter(function (doc) {
        return doc('metadata').hasFields('type');
      }).map(function(doc) {
        return self.r.object(doc('metadata')('type'), true) // return { <country>: true}
      }).reduce(function(left, right) {
          return left.merge(right)
      }).default({}).keys(),
      tags: doc('reduction').filter(function (doc) {
        return doc('metadata').hasFields('tag');
      }).concatMap(function(doc) {
        return doc('metadata')('tag')
      }).distinct(),
      range: [
        doc('reduction').min(
          function (set) {
              return set('metadata')('timestamp')
          }
        )('metadata')('timestamp'),
        doc('reduction').max(
          function (set) {
              return set('metadata')('timestamp')
          }
        )('metadata')('timestamp'),
      ]
    }
  },
  build_default_query_result: function(doc, query){
    debug_internals('build_default_query_result %o', query)

    let self = this
    let r_query = doc('reduction')

    let query_with_fields = {}


    let _return_obj = {
      path: doc('group')
    }

    /**
    * @TODO - check this
    **/
    if(query && query.doc_filter){
      debug_internals('build_default_query_result DOC FILTER', query.doc_filter)
      // r_query = r_query.filter(function(doc){ return doc('data')('status').eq(301) })
      r_query = r_query.filter(function(doc){ return eval( "doc"+query.doc_filter ) })

    }


    if(typeof query.q === 'string'){
      if(query.aggregation){
        _return_obj[query.q] = this.result_with_aggregation(this.build_query_fields(r_query, query), query.aggregation)
      }
      else{
        _return_obj[query.q] = this.build_query_fields(r_query, query)
      }

    }
    else{
      // _return_obj['docs'] = r_query.pluck(this.r.args(query.q))
      if(query.aggregation){
        _return_obj = this.result_with_aggregation(this.build_query_fields(r_query, query), query.aggregation)
      }
      else{
        _return_obj = this.build_query_fields(r_query, query)
      }
    }


    // if(query.aggregation){
    //
    // }


    return _return_obj
  },
  build_query_fields: function(r_query, query){
    if(typeof query.q === 'string'){
      let query_with_fields = {}

      if(query.fields){

        try{
          query.fields = JSON.parse(query.fields)
        }
        catch(e){

        }
        query_with_fields[query.q] = query.fields
      }

      debug_internals('build_query_fields %o', query, query_with_fields)

      r_query = (query.fields)
      ? r_query.withFields(query_with_fields)(query.q)
      : r_query.withFields(query.q)(query.q)

      // _return_obj[query.q] = r_query
    }
    else{
      // _return_obj['docs'] = r_query.pluck(this.r.args(query.q))
      // _return_obj = r_query.pluck(this.r.args(query.q))
      r_query = r_query.pluck(this.r.args(query.q))
    }

    return r_query
  },
  process_default: function(err, resp, params, error_on_doc){
    params = (params) ? Object.clone(params) : {}
    debug_internals('process_default', err, params)

    let metadata = params._extras
    metadata.timestamp = Date.now()
    // let type = metadata.type
    let id = metadata.id
    // let transformation = metadata.transformation
    // let aggregation = metadata.aggregation

    delete metadata.type
    delete metadata.id

    if(err){
      debug_internals('process_default err', err)
				this.fireEvent('onGetError', err);

			this.fireEvent(
				this[
					'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC_ERROR'
				],
				[err, {id: id, metadata : metadata}]
			);
    }

    if(!err && Array.isArray(resp) && resp.length === 0)
      err = {
        status: 404,
        message: 'Not Found'
      }

    // if(Array.isArray(resp))
    //   debug_internals('ARRAY RESP', resp)

    // extras[type] = (Array.isArray(resp)) ? resp[0] : resp
    // let data = (Array.isArray(resp) && metadata.changes !== true) ? resp[0] : resp
    let data = resp

    delete metadata.prop
    delete metadata.type


    if(err){
      this.fireEvent(this.ON_DOC_ERROR, [err, {id: id, metadata : metadata}]);

      if(error_on_doc)
        this.fireEvent(this.ON_DOC, [{err, id: id, metadata : metadata}, Object.merge({input_type: this, app: null})]);

    }
    else{

      this.fireEvent(this.ON_DOC, [{id: id,data: data, metadata : metadata}, Object.merge({input_type: this, app: null})]);
    }



  },
  __clean_registered_id: function(uuid, id, all_matching){
    debug_internals('__clean_registered_id uuid %s', uuid, id,all_matching)
    // debug_internals('register %O', this.registered_ids)
    // if(Object.getLength(this.registered_ids) > 0)
      // process.exit(1)


    if(this.registered_ids[uuid]){

      if(all_matching){

        let _registered_ids = Array.clone(this.registered_ids[uuid])

        Array.each(_registered_ids, function(reg_id, index){
          debug_internals('PRE __clean_registered_id ', reg_id, index)

          if(reg_id.indexOf(id) === 0){
            debug_internals('__clean_registered_id TRUE', reg_id, index)
            this.registered_ids[uuid].splice(index, 1)
          }

        }.bind(this))


        this.registered_ids[uuid] = this.registered_ids[uuid].clean()
      }
      else{
        this.registered_ids[uuid] = this.registered_ids[uuid].erase(id)
      }

      if(this.registered_ids[uuid].length === 0){
        delete this.registered_ids[uuid]
        // this.close_feeds[uuid] = true

        if(this.periodicals[uuid]) delete this.periodicals[uuid]

        if(this.feeds[uuid])
          this.feeds[uuid].close(function (err) {
            // this.close_feeds[uuid] = true
            delete this.feeds[uuid]
            delete this.changes_buffer[uuid]
            delete this.changes_buffer_expire[uuid]

            if (err){
              debug_internals('err closing cursor onSuspend', err)
            }
          }.bind(this))
      }
    }



    debug_internals('__clean_registered_id uuid', uuid, id, this.registered_ids, this.periodicals )
  },
  unregister: function(req, params){
    req = Object.clone(req)
    params = Object.clone(params)
    debug_internals('UNregister %o', req, this.registered_ids)
    // if(Object.getLength(this.registered_ids) > 0)
    //   process.exit(1)

    let {id} = req
    delete req.id

    if(req.query.unregister === true || req.query.unregister === '*'){


      let _registered_ids= Object.clone(this.registered_ids)

      // if(Object.getLegth(_registered_ids) > 0){
        // debug_internals('UNregister %O', this.registered_ids)
        // process.exit(1)
      // }

      Object.each(_registered_ids, function(ids, uuid){
        this.__clean_registered_id(uuid, id, true)
        // if(ids.contains(id)) this.registered_ids[uuid] = this.registered_ids[uuid].erase(id)
      }.bind(this))
    }
    else{
      /**
      * swap unregister => register so you get the same uuid
      */
      req.query.register = req.query.unregister
      delete req.query.unregister

      let uuid = uuidv5(JSON.stringify(req), this.ID)

      this.__clean_registered_id(uuid, id)

    }

  },
  register: function(query, req, params){
    req = Object.clone(req)
    params = (params) ? Object.clone(params) : {}

    let {id} = req
    delete req.id

    /**
    * delete and re add to ensure "register" es the last property on query (to match unregister uuid)
    **/
    let register = req.query.register
    delete req.query.register
    req.query.register = register


    let uuid = uuidv5(JSON.stringify(req), this.ID)

    debug_internals('register uuid %s', uuid)

    // if(!this.registered[uuid]) this.registered[uuid] = query
    if(!this.registered_ids[uuid]) this.registered_ids[uuid] = []
    this.registered_ids[uuid].combine([id])

    debug_internals('register uuidS %O', this.registered_ids)

    // if(!this.registered[host][prop]) this.registered[host][prop] = []
    // this.registered[host][prop].push(id)
    if(req.query.register === 'periodical'){
      if(!this.periodicals[uuid]) this.periodicals[uuid] = {}
      this.periodicals[uuid][id] = {query, params}
      // this.periodicals[uuid].push({query, params})

    }
    else if(req.query.register === 'changes' && !this.feeds[uuid]){
      debug_internals('register FUNC %O %O ', req, params)//query,

      debug_internals('registered %o %o', this.registered, this.registered_ids, req.query.q)

      // this.addEvent('onSuspend', this.__close_changes.pass(uuid, this))


      if(!this.changes_buffer[uuid]){
        params._extras.changes = true
        // this.changes_buffer[uuid] = {resp: [], params: Object.clone(params)}
        this.changes_buffer[uuid] = {resp: {}, params: Object.clone(params)}
       }

      if(!this.changes_buffer_expire[uuid]) this.changes_buffer_expire[uuid] = Date.now()


      query
        .run(this.conn, {maxBatchSeconds: 1, includeTypes: true}, function(err, cursor) {

        debug_internals('registered %o %o', err, cursor)
        if(err){

        }
        else{
          this.feeds[uuid] = cursor

          // cursor.on("data", function(message) {
          //   debug_internals('changes %s', new Date(), message)
          // })

          this.feeds[uuid].each(function(err, row){
            // debug_internals('changes %s', new Date(), err, row)

            /**
            * https://www.rethinkdb.com/api/javascript/each/
            * Iteration can be stopped prematurely by returning false from the callback.
            */
            if(this.close_feeds[uuid] === true){ this.close_feeds[uuid] = false; this.feeds[uuid] = undefined; return false }

            // debug_internals('changes %s', new Date())
            if(row && row !== null ){
              if(row.type == 'add'){

                let id = ( row.new_val && row.new_val.id ) ? row.new_val.id : uuidv5(JSON.stringify(row), this.ID)
                this.changes_buffer[uuid].resp[id] = row.new_val

              }

              if(this.changes_buffer_expire[uuid] < Date.now() - 1001 && Object.getLength(this.changes_buffer[uuid].resp) > 0){
                console.log('onPeriodicalDoc', this.changes_buffer[uuid].params, uuid)

                // this.__process_changes(this.changes_buffer[uuid])
                // params._extras.changes = true
                // this.process_default(err, this.changes_buffer[uuid].resp, this.changes_buffer[uuid].params)
                this.process_default(err, Object.values(this.changes_buffer[uuid].resp), this.changes_buffer[uuid].params)

                // debug_internals('changes %s', new Date(), this.changes_buffer[uuid])

                this.changes_buffer_expire[uuid] = Date.now()
                // this.changes_buffer[uuid].resp = []
                this.changes_buffer[uuid].resp = {}


              }

            }


          }.bind(this))

        }


      }.bind(this))

    }


  },


});
