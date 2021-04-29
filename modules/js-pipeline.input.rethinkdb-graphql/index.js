'use strict'

const App = require ( '../node-app-rethinkdb-client/index' )

let debug = require('debug')('js-pipeline.input.rethinkdb-graphql'),
    debug_internals = require('debug')('js-pipeline.input.rethinkdb-graphql:Internals');


const roundMilliseconds = function(timestamp){
  let d = new Date(timestamp)
  d.setMilliseconds(0)

  // console.log('roundMilliseconds', d.getTime())
  return d.getTime()
}

const uuidv5 = require('uuid/v5')

const async = require('async')

// const { graphql, buildSchema } = require('graphql');


module.exports = new Class({
  Extends: App,

  ID: '',

	// closed: {},
  registered: {},
  registered_ids: {},
  feeds: {},
  close_feeds: {},

  changes_buffer: {},
  changes_buffer_expire: {},


  periodicals: {},

	schema: undefined,

  options: {
    db: undefined,
    table: undefined,
    type: undefined,
    changes: {includeTypes: true},

    changes_expire: 1000, //ms

		schema: undefined,

    run: {arrayLimit: 1000000}, //maxBatchSeconds: 1,
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



  // initialize: function(options){
	// 	debug('initialize', options)
	//
  // 	this.parent(options);//override default options
	//
	// 	const schema = buildSchema(options.schema)
	//
	// 	const root = { hello: () => 'Hello world!' };
	//
	// 	graphql(schema, '{ hello }', root).then((response) => {
	// 	  debug('response %O', response);
	// 		process.exit(1)
	// 	})
	//
	// 	this.profile('js-pipeline.input.rethinkdb-graphql_init');//start profiling
	//
	//
	// 	this.profile('js-pipeline.input.rethinkdb-graphql_init');//end profiling
	//
	// 	this.log('js-pipeline.input.rethinkdb-graphql', 'info', 'js-pipeline.input.rethinkdb-graphql started');
  // },
  // query_with_filter: function(query, filter){
	//
  //   let _query_filter, _query_filter_value
	//
  //   if(filter){
  //     if(typeof filter === 'string'){
  //       // _query_filter = filter.split(':')[0]
  //       // _query_filter_value = filter.split(':').slice(1)
  //       debug('query_with_filter STRING', filter)
  //       // query = query.filter(eval("this."+filter))
  //       if(filter.indexOf('this.r.row') > -1){
  //         query = query.filter(eval(filter))
  //       }
  //       else if(filter.indexOf('function:') > -1){
  //         filter = filter.replace('function:', '')
  //         query = query.filter(function(row) { return eval(filter) }.bind(this))
  //       }
  //       else{
  //         query = query.filter(eval("this."+filter))
  //       }
  //       debug('query_with_filter STRING', filter, query)
  //     }
  //     else if(Array.isArray(filter)){//allow chaining filters
  //       Array.each(Array.clone(filter), function(_filter, index){
  //         query = this.query_with_filter(query, _filter)
  //       }.bind(this))
  //     }
  //     else{
  //       // _query_filter = Object.keys(filter)[0]
  //       // _query_filter_value = filter[_query_filter]
  //       query = query.filter(filter)
	//
  //       debug('query_with_filter OBJECT', filter, query)
  //     }
	//
	//
  //   }
	//
	//
	//
  //   return query
  // },
  // query_with_transformation: function(query, transformation){
  //   let _query_transform, _query_transform_value
	//
  //   if(transformation){
  //     if(typeof transformation === 'string'){
  //       _query_transform = transformation.split(':')[0]
  //       _query_transform_value = transformation.split(':').slice(1)
  //     }
  //     else if(Array.isArray(transformation)){//allow chaining transformations
  //       Array.each(Array.clone(transformation), function(transform, index){
  //         query = this.query_with_transformation(query, transform)
  //       }.bind(this))
  //     }
  //     else{
  //       _query_transform = Object.keys(transformation)[0]
  //       _query_transform_value = transformation[_query_transform]
  //     }
	//
  //     if(_query_transform){
  //       debug('query_with_transformation %o %o', _query_transform, _query_transform_value)
	//
  //       switch(_query_transform){
  //         case 'sample':
  //           query = query.sample(_query_transform_value * 1)
  //           break;
	//
  //         case 'limit':
  //           query = query.limit(_query_transform_value * 1)
  //           break;
	//
  //         /**
  //         * don't use nth, use slice instead (produce an error, because query end up needing a sequence after this)
  //         **/
  //         case 'nth':
  //           query = query.nth(_query_transform_value * 1)
  //           break;
	//
  //         case 'skip':
  //           query = query.skip(_query_transform_value * 1)
  //           break;
	//
  //         case 'slice':
  //           query = query.slice(_query_transform_value[0] * 1, _query_transform_value[1] * 1, _query_transform_value[2])
  //           break;
	//
  //         case 'orderBy':
  //           // query = query.orderBy(eval(_query_transform_value))
  //           let value = (_query_transform_value.index) ? _query_transform_value.index : _query_transform_value
	//
  //           if(value && value.indexOf('(') > -1){
  //             value = value.replace('r.', '')
  //             value = value.replace(')', '')
  //             debug('orderBy ', value)
  //             let order = value.substring(0, value.indexOf('('))
  //             let index = value.substring(value.indexOf('(') + 1)
  //             debug('orderBy ',order, index)
	//
  //             if(_query_transform_value.index)
  //               _query_transform_value.index = this.r[order](index)
  //             else
  //               _query_transform_value = this.r[order](index)
  //           }
	//
	//
	//
  //           query = query.orderBy(_query_transform_value)
  //           break;
  //       }
  //     }
  //   }
	//
  //   debug('query_with_transformation %o', query)
  //   return query
  // },
  // result_with_aggregation: function(query, aggregation){
	//
  //   let _query_aggregation, _query_aggregation_value
	//
  //   if(aggregation){
  //     if(typeof aggregation === 'string'){
  //       _query_aggregation = aggregation.split(':')[0]
  //       _query_aggregation_value = aggregation.split(':').slice(1)
  //     }
  //     else{
  //       _query_aggregation = Object.keys(aggregation)[0]
  //       _query_aggregation_value = aggregation[_query_aggregation]
  //     }
	//
  //     debug_internals('result_with_aggregation %o', aggregation, _query_aggregation, _query_aggregation_value)
	//
  //     /**
  //     * for "contains"
  //     * ex:
  //     * "aggregation":{
  //   	*	"contains": ["('data')('status')", 500]
  //   	* }
  //     **/
  //     let _query_aggregation_param
  //     if(Array.isArray(_query_aggregation_value)){
  //       _query_aggregation_param = _query_aggregation_value[1]
  //       _query_aggregation_value = _query_aggregation_value[0]
  //     }
	//
  //     if(_query_aggregation_value)
  //       query = query
  //       .map(
  //         function (doc) {
  //           return eval( "doc"+_query_aggregation_value );
  //         }.bind(this)
  //       )
	//
  //     switch(_query_aggregation){
  //       case 'count':
  //         query = query.count()
  //         break;
	//
  //       case 'min':
  //         query = query.min()
  //         break;
	//
  //       case 'max':
  //         query = query.max()
  //         break;
	//
  //       case 'sum':
  //         query = query.sum()
  //         break;
	//
  //       case 'avg':
  //         query = query.avg()
  //         break;
	//
  //       case 'distinct':
  //         query = query.distinct()
  //         break;
	//
  //       case 'contains':
  //         query = query.contains(_query_aggregation_param)
  //         break;
  //     }
  //   }
	//
	//
	//
  //   return query
  // },
  /**
  * creates more load on server
  **/
  // build_default_result_distinct: function(query, distinct, append_or_replace_distinct, callback){
  //   if(typeof append_or_replace_distinct === 'function'){
  //     callback = append_or_replace_distinct
  //     append_or_replace_distinct = undefined
  //   }
	//
  //   debug('build_default_result %o', query, distinct)
  //   // process.exit(1)
	//
  //   let _groups = {}
  //   // let groups = []
	//
  //   let _index_query = query.distinct(distinct)
  //   // .coerceTo('array')
	//
  //   let self = this
	//
  //   let _indexes_async = function(_groups, index, distinct, rowFinished){
	//
  //     if(!_groups[index]) _groups[index] = {}
  //     // _groups[index].index = index
  //     _groups[index].index_type = distinct.index
  //     _groups[index][distinct.index] = index
	//
  //     let _expr = [
  //       query.getAll(index, distinct).count(),
  //       query.getAll(index, distinct)('metadata')('host').distinct(),
  //       query.getAll(index, distinct)('metadata')('tag').distinct(),
  //       query.getAll(index, distinct)('metadata')('type').distinct(),
  //       query.getAll(index, distinct)('metadata')('timestamp').min(),
  //       query.getAll(index, distinct)('metadata')('timestamp').max(),
  //       query.getAll(index, distinct)('metadata')('path').distinct(),
  //     ]
	//
  //     if(append_or_replace_distinct){
  //       let distinct_expr = []
  //       Object.each(append_or_replace_distinct, function(column){
  //         distinct_expr.push(eval(`query.getAll(index, distinct)${column}.distinct()`))
  //       })
	//
  //       if(append_or_replace_distinct.replace === true){
  //         _expr = distinct_expr
  //       }
  //       else {
  //         _expr.combine(distinct_expr)
  //       }
	//
  //       debug('build_default_result %o', distinct_expr)
  //       // process.exit(1)
  //     }
	//
	//
	//
  //     self.r.expr(_expr).run(self.conn, self.options.run, function(err, resp){
  //       // debug('EXPR RESULT %o %o', err, resp)
  //       if(resp && Array.isArray(resp)){
  //         if(append_or_replace_distinct && append_or_replace_distinct.replace === true){
  //           let resp_index = 0
  //           Object.each(append_or_replace_distinct, function(column, prop){
  //             _groups[index][prop] = resp[resp_index]
  //             resp_index++
  //           })
  //         }
  //         else {
  //           _groups[index].tags = []
  //           resp[2].each(function(item){_groups[index].tags.combine(item)})
	//
  //           _groups[index].count = resp[0]
  //           _groups[index].hosts = resp[1]
  //           _groups[index].types = resp[3]
  //           _groups[index].range =[ resp[4],  resp[5] ]
  //           _groups[index].paths = resp[6]
	//
  //           if(append_or_replace_distinct){
  //             let resp_index = 7
  //             Object.each(append_or_replace_distinct, function(column, prop){
  //               _groups[index][prop] = resp[resp_index]
  //               resp_index++
  //             })
  //           }
  //         }
	//
  //       }
  //       rowFinished(err)
  //     })
  //   }
	//
  //   if(!callback){
  //     return new Promise(function(resolve, reject) {
  //       _index_query.run(this.conn, this.options.run, function(err, indexes){
  //         if(err){
  //            reject(err)
  //          }
  //          else{
  //            indexes.eachAsync(
  //              function (index, rowFinished) {
  //                _indexes_async(_groups, index, distinct, rowFinished)
  //                // if(!_groups[index]) _groups[index] = {}
  //                // _groups[index].index = index
  //                //
  //                // self.r.expr([
  //                //   query.getAll(index, distinct).count(),
  //                //   query.getAll(index, distinct)('metadata')('host').distinct(),
  //                //   query.getAll(index, distinct)('metadata')('tag').distinct(),
  //                //   query.getAll(index, distinct)('metadata')('type').distinct(),
  //                //   query.getAll(index, distinct)('metadata')('timestamp').min(),
  //                //   query.getAll(index, distinct)('metadata')('timestamp').max()
  //                // ]).run(self.conn, {arrayLimit: 1000000}, function(err, resp){
  //                //   // debug('EXPR RESULT %o %o', err, resp)
  //                //   _groups[index].tags = []
  //                //   resp[2].each(function(item){_groups[index].tags.combine(item)})
  //                //
  //                //   _groups[index].count = resp[0]
  //                //   _groups[index].hosts = resp[1]
  //                //   _groups[index].types = resp[3]
  //                //   _groups[index].range =[ resp[4],  resp[5] ]
  //                //
  //                //   rowFinished(err)
  //                // })
  //              },
  //              function (err) {
  //                debug('build_default_result ERR %o', err)
  //                if(err){
  //                  reject(err)
  //                }
  //                else{
  //                  let data = (Object.values(_groups).length > 0 ) ? Object.values(_groups) : []
  //                  resolve(data)
  //                }
	//
  //              }
  //            )
  //          }
	//
	//
	//
	//
	//
  //       })
  //     })
  //   }
  //   else{
  //     _index_query.run(this.conn, this.options.run, function(err, indexes){
  //       if(err){
  //        callback(err, Object.values(_groups))
  //      }
  //      else{
  //        indexes.eachAsync(
  //          function (index, rowFinished) {
  //            _indexes_async(_groups, index, distinct, rowFinished)
	//
  //            // if(!_groups[index]) _groups[index] = {}
  //            // _groups[index].index = index
  //            // _groups[index].index_type = distinct.index
  //            //
  //            // self.r.expr([
  //            //   query.getAll(index, distinct).count(),
  //            //   query.getAll(index, distinct)('metadata')('host').distinct(),
  //            //   query.getAll(index, distinct)('metadata')('tag').distinct(),
  //            //   query.getAll(index, distinct)('metadata')('type').distinct(),
  //            //   query.getAll(index, distinct)('metadata')('timestamp').min(),
  //            //   query.getAll(index, distinct)('metadata')('timestamp').max(),
  //            //   query.getAll(index, distinct)('metadata')('path').distinct(),
  //            // ]).run(self.conn, {arrayLimit: 1000000}, function(err, resp){
  //            //   // debug('EXPR RESULT %o %o', err, resp)
  //            //   if(resp && Array.isArray(resp)){
  //            //     _groups[index].tags = []
  //            //     resp[2].each(function(item){_groups[index].tags.combine(item)})
  //            //
  //            //     _groups[index].count = resp[0]
  //            //     _groups[index].hosts = resp[1]
  //            //     _groups[index].types = resp[3]
  //            //     _groups[index].range =[ resp[4],  resp[5] ]
  //            //     _groups[index].paths = resp[6]
  //            //   }
  //            //   rowFinished(err)
  //            // })
  //          },
  //          function (err) {
  //            debug('build_default_result ERR %o %o', err, _groups)
  //            let data = (Object.values(_groups).length > 0 ) ? Object.values(_groups) : []
  //            callback(err, data)
  //          }
  //        )
  //      }
	//
	//
  //     })
	//
	//
  //   }
  // },

  // get_group: function(group){
  //   if(!group) return this.r.row('metadata')('path')
	//
  //   return this.r.row('metadata')(group)
  // },
  // get_distinct: function(distinct){
  //   if(!distinct) return {index: 'path'}
	//
  //   return {index: distinct}
  // },
  // build_default_result: function(doc, index){
  //   index = index || 'path'
  //   let self = this
  //   let result = {
  //     // path: doc('group'),
  //     count: doc('reduction').count(),
  //     hosts: doc('reduction').filter(function (doc) {
  //       return doc('metadata').hasFields('host');
  //     }).map(function(doc) {
  //       return self.r.object(doc('metadata')('host'), true) // return { <country>: true}
  //     }).reduce(function(left, right) {
  //         return left.merge(right)
  //     }).default({}).keys(),
  //     types: doc('reduction').filter(function (doc) {
  //       return doc('metadata').hasFields('type');
  //     }).map(function(doc) {
  //       return self.r.object(doc('metadata')('type'), true) // return { <country>: true}
  //     }).reduce(function(left, right) {
  //         return left.merge(right)
  //     }).default({}).keys(),
  //     tags: doc('reduction').filter(function (doc) {
  //       return doc('metadata').hasFields('tag');
  //     }).concatMap(function(doc) {
  //       return doc('metadata')('tag')
  //     }).distinct(),
  //     range: [
  //       doc('reduction').min(
  //         function (set) {
  //             return set('metadata')('timestamp')
  //         }
  //       )('metadata')('timestamp'),
  //       doc('reduction').max(
  //         function (set) {
  //             return set('metadata')('timestamp')
  //         }
  //       )('metadata')('timestamp'),
  //     ],
  //     paths: doc('reduction').filter(function (doc) {
  //       return doc('metadata').hasFields('path');
  //     }).map(function(doc) {
  //       return self.r.object(doc('metadata')('path'), true) // return { <country>: true}
  //     }).reduce(function(left, right) {
  //         return left.merge(right)
  //     }).default({}).keys(),
  //   }
	//
  //   result['index_type'] = index
  //   result[index] = doc('group')
  //   return result
  // },
  // build_default_query_result: function(doc, query){
  //   debug_internals('build_default_query_result %o', query)
	//
  //   let self = this
  //   let r_query = doc('reduction')
	//
  //   let query_with_fields = {}
	//
	//
  //   let _return_obj = {
  //     path: doc('group')
  //   }
	//
  //   /**
  //   * @TODO - check this
  //   **/
  //   if(query && query.doc_filter){
  //     debug_internals('build_default_query_result DOC FILTER', query.doc_filter)
  //     // r_query = r_query.filter(function(doc){ return doc('data')('status').eq(301) })
  //     r_query = r_query.filter(function(doc){ return eval( "doc"+query.doc_filter ) })
	//
  //   }
	//
	//
  //   if(typeof query.q === 'string'){
  //     if(query.aggregation){
  //       _return_obj[query.q] = this.result_with_aggregation(this.build_query_fields(r_query, query), query.aggregation)
  //     }
  //     else{
  //       _return_obj[query.q] = this.build_query_fields(r_query, query)
  //     }
	//
  //   }
  //   else{
  //     // _return_obj['docs'] = r_query.pluck(this.r.args(query.q))
  //     if(query.aggregation){
  //       _return_obj = this.result_with_aggregation(this.build_query_fields(r_query, query), query.aggregation)
  //     }
  //     else{
  //       _return_obj = this.build_query_fields(r_query, query)
  //     }
  //   }
	//
	//
  //   // if(query.aggregation){
  //   //
  //   // }
	//
	//
  //   return _return_obj
  // },
  // build_query_fields: function(r_query, query){
  //   if(typeof query.q === 'string'){
  //     let query_with_fields = {}
	//
  //     if(query.fields){
	//
  //       try{
  //         query.fields = JSON.parse(query.fields)
  //       }
  //       catch(e){
	//
  //       }
  //       query_with_fields[query.q] = query.fields
  //     }
	//
  //     debug_internals('build_query_fields %o', query, query_with_fields)
	//
  //     r_query = (query.fields)
  //     ? r_query.withFields(query_with_fields)(query.q)
  //     : r_query.withFields(query.q)(query.q)
	//
  //     // _return_obj[query.q] = r_query
  //   }
  //   else{
  //     // _return_obj['docs'] = r_query.pluck(this.r.args(query.q))
  //     // _return_obj = r_query.pluck(this.r.args(query.q))
	//
  //     /**
  //     * possibly mem leak using args? or pluck?
  //     * r_query = r_query.pluck(this.r.args(query.q))
  //     **/
  //     r_query = r_query.pluck(query.q)
	//
  //     debug('build_query_fields pluck %o', r_query)
  //   }
	//
  //   return r_query
  // },

  process_default: function(err, resp, params, error_on_doc){
    params = (params) ? Object.clone(params) : {}
    debug_internals('process_default', err, params)

    let metadata = params._extras
    metadata.timestamp = Date.now()
    // let type = metadata.type
    let id = (Array.isArray(metadata.id)) ? metadata.id : [metadata.id]
    // let transformation = metadata.transformation
    // let aggregation = metadata.aggregation

    delete metadata.type
    delete metadata.id

    let __response = function(err, resp){

      Array.each(id, function(_id){
        if(err){
          debug_internals('process_default err', err)
    				this.fireEvent('onGetError', err);

    			this.fireEvent(
    				this[
    					'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC_ERROR'
    				],
    				[err, {id: _id, metadata : metadata}]
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
          this.fireEvent(this.ON_DOC_ERROR, [err, {id: _id, metadata : metadata}]);

          // if(error_on_doc)
          //   this.fireEvent(this.ON_DOC, [{err, id: _id, metadata : metadata}, Object.merge({input_type: this, app: null})]);

        }
        else{
          debug_internals('process_default resp', {id: _id,data: data, metadata : metadata})
          this.fireEvent(this.ON_DOC, [{id: _id,data: data, metadata : metadata}, Object.merge({input_type: this, app: null})]);
        }

      }.bind(this))

    }.bind(this)

    if(resp && resp.next && typeof resp.next === 'function'){//cursor
      resp.toArray(__response)
    }
    else{
      __response(err, resp)
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
      // process.exit(1)

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

    debug_internals('register uuid %s %s', uuid, id)


    // if(!this.registered[uuid]) this.registered[uuid] = query
    if(!this.registered_ids[uuid]) this.registered_ids[uuid] = []
    this.registered_ids[uuid].combine([id])

    debug_internals('register uuidS %O', this.registered_ids)
    // process.exit(1)

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
        .run(this.conn, this.options.run, function(err, cursor) {

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
              if(row.type == 'add' || row.type == 'change'){

                let id = ( row.new_val && row.new_val.id ) ? row.new_val.id : uuidv5(JSON.stringify(row), this.ID)
                // if(this.changes_buffer[uuid] === undefined){
                //   debug('ERROR %o %s', this.changes_buffer, uuid)
                //   process.exit(1)
                // }
                if(this.changes_buffer[uuid] && this.changes_buffer[uuid].resp)
                  this.changes_buffer[uuid].resp[id] = row.new_val

              }

              if(
                (
                  this.options.changes_expire === 0
                  || this.options.changes_expire === undefined
                  || ( this.changes_buffer_expire[uuid] < Date.now() - this.options.changes_expire )
                )
                && Object.getLength(this.changes_buffer[uuid].resp) > 0){
              // if(this.changes_buffer[uuid] && Object.getLength(this.changes_buffer[uuid].resp) > 0){
                // console.log('onPeriodicalDoc', this.changes_buffer[uuid].params, uuid)

                // this.__process_changes(this.changes_buffer[uuid])
                // params._extras.changes = true
                // this.process_default(err, this.changes_buffer[uuid].resp, this.changes_buffer[uuid].params)
                this.process_default(
                  err,
                  Object.values(this.changes_buffer[uuid].resp),
                  Object.merge(Object.clone(this.changes_buffer[uuid].params), { _extras: {id: this.registered_ids[uuid], timestamp: Date.now()}})
                )

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
    // // else if(this.feeds[uuid]){
    // //   debug('this.feeds %o %s', this.changes_buffer[uuid], id)
    // //   process.exit(1)
    // // }
    // else if(req.query.register === 'changes' && this.changes_buffer[uuid] && this.changes_buffer[uuid].params){
    //   if(
    //     this.changes_buffer[uuid].params.id
    //     && Array.isArray(this.changes_buffer[uuid].params.id)
    //     && !this.changes_buffer[uuid].params.id.contains(id)
    //   ){
    //     this.changes_buffer[uuid].params.id.push(id)
    //   }
    //   else if(
    //     this.changes_buffer[uuid].params.id
    //     && !Array.isArray(this.changes_buffer[uuid].params.id)
    //     && this.changes_buffer[uuid].params.id !== id
    //   ){
    //     let _id = [this.changes_buffer[uuid].params.id, id]
    //     this.changes_buffer[uuid].params.id = _id
    //   }
    //   else if(!this.changes_buffer[uuid].params.id) {//this should never happen
    //     throw new Error({msg: 'this.changes_buffer['+uudi+'].params.id shouldn\'t be empty'})
    //     this.changes_buffer[uuid].params.id = id
    //   }
    //
    //   debug('this.feeds %o %s', this.changes_buffer[uuid], id)
    //   process.exit(1)
    // }


  },


});
