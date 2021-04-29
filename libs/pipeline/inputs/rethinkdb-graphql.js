'use strict'

// var { graphql, buildSchema } = require('graphql');


const App = require('../../../modules/js-pipeline.input.rethinkdb-graphql')
// const App = require ( 'node-app-rethinkdb-client/index' )

let debug = require('debug')('mngr-ui-admin:apps:libs:Pipeline:Inputs:RethinkDBGraphQL'),
    debug_internals = require('debug')('mngr-ui-admin:apps:libs:Pipeline:Inputs:RethinkDBGraphQL:Internals');

const path = require('path')

const round = require(path.join(process.cwd(), 'libs/time/round'))

const pluralize = require('pluralize')

const { graphql } = require('graphql')

// const {graphQlQueryToJson} = require("graphql-query-to-json")
const gql = require('graphql-tag')

/**
* https://github.com/taion/graphql-type-json
**/
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json')
/**
* https://github.com/ardatan/graphql-tools
**/
const { makeExecutableSchema } = require ( 'graphql-tools' )
// const resolvers = {
//   JSON: GraphQLJSON,
//   JSONObject: GraphQLJSONObject,
// 	OS: {
//     __resolveType(obj, context, info){
//       debug('__resolveType', obj, context, info)
//     },
//   },
// }


module.exports = new Class({
  Extends: App,

  ID: 'b1f06da2-82bd-4c95-8e4e-a5a25075e39b',

  options: {
    changes: {includeTypes: true, squash: 1},
    changes_expire: 500,
    run: {arrayLimit: 1000000, maxBatchSeconds: 1},

    db: undefined,
    table: undefined,
    type: undefined,

		requests : {
      once: [
        {
					default: function(req, next, app){
            req = (req) ? Object.clone(req) : {}

            if(!req.query || (!req.query.register && !req.query.unregister)){
							debug_internals('default %o %o', req.query); //, app.options
							// process.exit(1)

              let from = req.from || app.options.table


              let query = app.r
                .db(app.options.db)
                .table(from)

							try{
								// let schema = buildSchema(app.options.schema)
								let typeDefs = app.options.schema
								let resolvers = []
								Array.each(app.options.resolvers, function(resolver){
									resolvers.push(resolver(query, app))
								})

								const resolver = {
								  JSON: GraphQLJSON,
								  JSONObject: GraphQLJSONObject,

									Query: {

									}
								}

								resolvers.push(resolver)

								// graphql(schema, '{ host (id: "columba") { timestamp } }', resolvers).then((response) => {
								// 	debug('graphql', response, response.data.host.timestamp);
								// 	process.exit(1)
								// });

								// debug('graphQlQueryToJson %O', graphQlQueryToJson(req.query.query))
								// process.exit(1)

								// const obj = gql`
								//   ${req.query.query}
								// `
								// debug('graphQlQueryToJson %O', obj.definitions[0].selectionSet.selections[0])
								// process.exit(1)


								// let gQuery = (req && req.query && req.query && req.query.id) ? '{ host (id: "'+req.query.id+'") { metadata { id, timestamp } } }' : '{ hosts { metadata { id, timestamp } } }'
								// let gProp = (req && req.query && req.query && req.query.id) ? 'host' : 'hosts'

								// debug(makeExecutableSchema({ typeDefs, resolvers }))
								// process.exit(1)
								//
								// graphql(makeExecutableSchema({ typeDefs, resolvers }), req.query.query, resolvers).then((response) => {


								// debug('resolvers', resolvers)
								// process.exit(1)

								graphql(makeExecutableSchema({ typeDefs, resolvers: resolvers }), req.query.query).then((response) => {
									debug('graphql %O', response);
									// process.exit(1)

									/**
									* if one Field fails to query, there is no data
									**/
									if(response.errors){
										app.process_default(undefined, response.errors, {
	                    _extras: {
	                      from: from,
	                      type: (req.params && req.params.path) ? req.params.path : app.options.type,
	                      id: req.id,
	                      transformation: (req.query.transformation) ? req.query.transformation : undefined,
	                      aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
	                      filter: (req.query.filter) ? req.query.filter : undefined
	                      // prop: pluralize(index)
	                    }
	                  }, true)
									}
									else{
										// app.process_default(undefined, response.data[gProp], {
										app.process_default(undefined, response.data, {
	                    _extras: {
	                      from: from,
	                      type: (req.params && req.params.path) ? req.params.path : app.options.type,
	                      id: req.id,
	                      transformation: (req.query.transformation) ? req.query.transformation : undefined,
	                      aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
	                      filter: (req.query.filter) ? req.query.filter : undefined
	                      // prop: pluralize(index)
	                    }
	                  }, false)
									}
									// process.exit(1)
								}).catch((err) => {
									debug('graphql ERR %O', err);
									process.exit(1)
								});
							}
							catch(e){
								debug('err', e)
								process.exit(1)
							}



            } //req.query.register === false
					}
				},

        {
					register: function(req, next, app){
            req = (req) ? Object.clone(req) : {}

            if(req.query.register || req.query.unregister){
              debug_internals('register', req);
              // process.exit(1)
              req.params = req.params || {}

              let from = req.from || app.options.table
              // from = (from === 'minute' || from === 'hour') ? 'historical' : from

              let query
              let params = {
                _extras: {
                  from: from,
                  type: (req.params && req.params.path) ? req.params.path : app.options.type,
                  id: req.id,
                  transformation: (req.query.transformation) ? req.query.transformation : undefined,
                  aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
                  filter: (req.query.filter) ? req.query.filter : undefined
                  // prop: pluralize(index)
                }
              }

              if(req.query.register){
                query = app.r
                  .db(app.options.db)
                  .table(from)

                // query = (req.params.prop && req.params.value)
                // ? query
                //   .getAll(req.params.value , {index: pluralize(req.params.prop, 1)})
                // : query
                if(req.params.prop && req.params.value){
                  if(!Array.isArray(req.params.value))
                    try{
                      req.params.value = JSON.parse(req.params.value)
                    }
                    catch(e){
                      req.params.value = [req.params.value]
                    }

                  query = query.getAll(app.r.args(req.params.value) , {index: pluralize(req.params.prop, 1)})
                }

                if(req.query && req.query.filter)
                  query = app.query_with_filter(query, req.query.filter)

                /**
                * changes (feed)
                **/
                if(req.query.register === 'changes')
                  query = query.changes(req.query.opts || app.options.changes)
                  // query = query.changes({includeTypes: true, squash: 1})

                if(req.query && req.query.transformation)
                  query = app.query_with_transformation(query, req.query.transformation)
                /**
                * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
                **/
                // let transformation = (req.query && req.query.transformation) ? req.query.transformation : undefined
                // if(
                //   transformation
                //   && (transformation.orderBy
                //     || (Array.isArray(transformation) && transformation.some(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy'}))
                //   )
                // ){
                //   let orderBy = (transformation.orderBy) ? transformation.orderBy : transformation.filter(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy' })[0]//one orderBy
                //   query = app.query_with_transformation(query, orderBy)
                //
                //   if(Array.isArray(transformation)){
                //     transformation = Array.clone(transformation)
                //     transformation.each(function(trasnform, index){
                //       if(Object.keys(trasnform)[0] === 'orderBy')
                //         transformation[index] = undefined
                //     })
                //
                //     transformation = transformation.clean()
                //   }
                //
                //
                // }
                //
                // if(req.query && req.query.filter)
                //   query = app.query_with_filter(query, req.query.filter)
                //
                // if(transformation)
                //   query = app.query_with_transformation(query, transformation)
                /**
                * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
                **/

                query = (req.params.path)
                ? query
                  .filter( app.r.row('metadata')('path').eq(req.params.path) )
                : query

                /**
                * changes (feed)
                **/
                if(req.query.register === 'changes' && req.query.q && typeof req.query.q !== 'string'){
                  debug_internals('register query.q', req.query);
                  query = this.build_query_fields(query, {q: [{new_val: req.query.q }, 'type']})
                }


                /**
                * periodical
                **/
                if (req.query.register === 'periodical' && req.query.aggregation && !req.query.q) {
                  query =  this.result_with_aggregation(query, req.query.aggregation)
                }
                else if(req.query.register === 'periodical' && req.query.index === false){
                  query = app.build_query_fields(query, req.query)

                  debug('NO INDEX %o', query)

                }
                else if(req.query.register === 'periodical'){

                  if(req.query && (req.query.q || req.query.filter)){
                    query = query
                      .group( app.get_group(req.query.index) )
                      // .group( {index:'path'} )
                      .ungroup()
                      .map(
                        function (doc) {
                          // debug('DOC %o', doc)
                          // return app.build_default_query_result(doc, req.query)
                          return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc)
                        }
                      )


                  }
                  else{
                    query = app.build_default_result_distinct(query,  app.get_distinct(req.query.index))
                  }
                }


                app.register(
                  query,
                  req,
                  params
                )
              }
              else{

                app.unregister(
                  req,
                  params
                )
              }

            }//req.query.register === true
					}
				},

      ],

      /**
      * periodical data always comes from 'periodical' table
      **/
      periodical: [
        {
					default: function(req, next, app){
            // req = (req) ? Object.clone(req) : {}
            debug_internals('periodical default %s', new Date());

            // if(!req.query || (!req.query.register && !req.query.unregister)){
            if(Object.getLength(app.periodicals) > 0){
							process.exit(1)
              // debug_internals('periodical default %O', app.periodicals);

              Object.each(app.periodicals, function(periodical_req, uuid){
                Object.each(periodical_req, function(periodical, id){
                  let {query, params} = periodical
                  debug_internals('periodical default %s %O', id, periodical);
                  // periodical_req.id = id
                  if(query instanceof Promise){
                    query.then(function(resp) {
                      debug('periodical default result as Promise %o', resp)
                      // process.exit(1)
                      app.process_default(
                        undefined,
                        resp,
                        params
                      )
                    }, function(err) {
                      debug('periodical default ERRROR as Promise %o', err)
                      // process.exit(1)
                      app.process_default(
                        err,
                        undefined,
                        params
                      )
                    })
                  }
                  else{
                    query.run(app.conn, {arrayLimit: 10000000}, function(err, resp){
                      debug_internals('periodical default run', err, resp)//resp
                      app.process_default(
                        err,
                        resp,
                        params
                      )
                    })
                  }

                }.bind(this))
              }.bind(this))


            } //req.query.register === false
					}
				},
      ],

      range: [
				/**
				* @from node-mngr-worker-apps/web-apis/input:once->range
				**/
				{
					default: function(req, next, app){
            req = (req)
            ? Object.clone(req)
            : (app.options && app.options.range)
              ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.range))
              : { params: {}, query: {} }

            if(!req.query || (!req.query.register && !req.query.unregister)){
              debug_internals('default range', req, app.options.type)
              // process.exit(1)

              let _default = function(){
                let start, end

                let full_range = ( req.options && req.options.full_range === true ) ? true : false
                /**
                * maybe full_range = should do minus MINUTE/HOUR/etc
                **/

								if(full_range === true){
                  start = 0
                  end = Date.now()
                }
                else {
                  if(app.options.type === 'minute'){
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : round.roundMilliseconds (Date.now())
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : round.roundSeconds(end - SECOND)//- MINUTE
                  }
                  else if(app.options.type === 'hour'){
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : round.roundSeconds(Date.now())
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : round.roundMinutes(end - MINUTE)//  - MINUTE
                  }
                  else if(app.options.type === 'day'){
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : round.roundMinutes(Date.now())
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : round.roundHours(end- HOUR)// - MINUTE
                  }
                  else if(app.options.type === 'week'){
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : round.roundHours (Date.now())
                    // start  = (req.options && req.options.range) ? req.options.range.start : round.roundHours(end) - WEEK
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : round.roundHours(end - HOUR - WEEK)
                  }
									else{
										end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : Date.now()
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : end - SECOND
									}
                }

								req.options = req.options || {}
                // req.options.range = (full_range === true || !req.options.range) ? {start: start, end: end} : req.options.range
								req.options.range =  {start: start, end: end}
                // app.options.type


                let range = 'posix '+start+'-'+end+'/*'


								let from = req.from || app.options.table


	              let query = app.r
	                .db(app.options.db)
	                .table(from)

								try{
									debug_internals('RANGE', full_range, range)
		              // process.exit(1)

									// let schema = buildSchema(app.options.schema)
									let typeDefs = app.options.schema
									let resolvers = []
									Array.each(app.options.resolvers, function(resolver){
										resolvers.push(resolver(query, app, (full_range === true) ? undefined : req.options.range))
									})

									const resolver = {
									  JSON: GraphQLJSON,
									  JSONObject: GraphQLJSONObject,

										Query: {

										}
									}

									resolvers.push(resolver)

									// graphql(schema, '{ host (id: "columba") { timestamp } }', resolvers).then((response) => {
									// 	debug('graphql', response, response.data.host.timestamp);
									// 	process.exit(1)
									// });

									// debug('graphQlQueryToJson %O', graphQlQueryToJson(req.query.query))
									// process.exit(1)

									// const obj = gql`
									//   ${req.query.query}
									// `
									// debug('graphQlQueryToJson %O', obj.definitions[0].selectionSet.selections[0])
									// process.exit(1)


									// let gQuery = (req && req.query && req.query && req.query.id) ? '{ host (id: "'+req.query.id+'") { metadata { id, timestamp } } }' : '{ hosts { metadata { id, timestamp } } }'
									// let gProp = (req && req.query && req.query && req.query.id) ? 'host' : 'hosts'

									// debug(makeExecutableSchema({ typeDefs, resolvers }))
									// process.exit(1)
									//
									// graphql(makeExecutableSchema({ typeDefs, resolvers }), req.query.query, resolvers).then((response) => {


									// debug('resolvers', resolvers)
									// process.exit(1)

									graphql(makeExecutableSchema({ typeDefs, resolvers: resolvers }), req.query.query).then((response) => {
										debug('graphql %O', response);
										// process.exit(1)

										/**
										* if one Field fails to query, there is no data
										**/
										if(response.errors){
											app.process_default(undefined, response.errors, {
		                    _extras: {
		                      from: from,
		                      type: (req.params && req.params.path) ? req.params.path : app.options.type,
		                      id: req.id,
		                      transformation: (req.query.transformation) ? req.query.transformation : undefined,
		                      aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
		                      filter: (req.query.filter) ? req.query.filter : undefined
		                      // prop: pluralize(index)
		                    }
		                  }, true)
										}
										else{
											// app.process_default(undefined, response.data[gProp], {
											app.process_default(undefined, response.data, {
		                    _extras: {
		                      from: from,
		                      type: (req.params && req.params.path) ? req.params.path : app.options.type,
		                      id: req.id,
		                      transformation: (req.query.transformation) ? req.query.transformation : undefined,
		                      aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
		                      filter: (req.query.filter) ? req.query.filter : undefined
		                      // prop: pluralize(index)
		                    }
		                  }, false)
										}
										// process.exit(1)
									}).catch((err) => {
										debug('graphql ERR %O', err);
										process.exit(1)
									});
								}
								catch(e){
									debug('err', e)
									process.exit(1)
								}


                app.fireEvent('onSuspend')

                query.run(app.conn, app.options.run, function(err, resp){
                  app.fireEvent('onResume')
                  debug_internals('run', err) //resp
									// process.exit(1)
                  app.process_default(
                    err,
                    resp,
                    {
                      _extras: {
                        from: from,
                        type: (req.params && req.params.path) ? req.params.path : app.options.type,
                        id: req.id,
                        Range: range,
                        range: req.options.range,
                        transformation: (req.query.transformation) ? req.query.transformation : undefined,
                        aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
                        filter: (req.query.filter) ? req.query.filter : undefined
                        // prop: pluralize(index)
                      }
                    }
                  )
                })
              }

              debug('CONNECTED? %o %s', app.connected, app.options.db)
							// process.exit(1)
              if(app.connected === false){
                app.addEvent(app.ON_CONNECT, _default)
              }
              else{
                _default()
              }
            }//

					}
        },
        {
          register: function(req, next, app){
            req = (req) ? Object.clone(req) : {}

            if(req.query.register || req.query.unregister){
              debug_internals('range register', req);
							process.exit(1)
              req.params = req.params || {}

              let start, end
              end = (req.opt && req.opt.range) ? req.opt.range.end : Date.now()
              start  = (req.opt && req.opt.range) ? req.opt.range.start : end - 10000 //10 secs

              let range = 'posix '+start+'-'+end+'/*'


              let from = req.from || app.options.table
              // from = (from === 'minute' || from === 'hour') ? 'historical' : from

              let index = "timestamp"


              let query

              let params = {
                _extras: {
                  from: from,
                  type: (req.params && req.params.path) ? req.params.path : app.options.type,
                  id: req.id,
                  Range: range,
                  range: req.opt.range,
                  transformation: (req.query.transformation) ? req.query.transformation : undefined,
                  aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
                  filter: (req.query.filter) ? req.query.filter : undefined
                  // prop: pluralize(index)
                }
              }

              if(req.query.register){
                query = app.r
                  .db(app.options.db)
                  .table(from)

                index = (req.params.prop && req.params.value)
                ? pluralize(req.params.prop, 1)+'.timestamp'
                : index

                start = (req.params.prop && req.params.value)
                ? [req.params.value, start]
                : start

                end = (req.params.prop && req.params.value)
                ? [req.params.value, end]
                : end

                query = (req.params.path)
                ? query
                  .between(
                  	start,
                  	end,
                  	{index: index}
                  )
                  .filter( app.r.row('metadata')('path').eq(req.params.path) )
                : query
                  .between(
                  	start,
                  	end,
                  	{index: index}
                  )

                if(req.query && req.query.filter)
                  query = app.query_with_filter(query, req.query.filter)
                /**
                * changes (feed)
                **/
                if(req.query.register === 'changes')
                  query = query.changes(req.query.opts || app.options.changes)

                if(req.query && req.query.transformation)
                  query = app.query_with_transformation(query, req.query.transformation)

                query = (req.params.path)
                ? query
                  .filter( app.r.row('metadata')('path').eq(req.params.path) )
                : query

                /**
                * changes (feed)
                **/
                if(req.query.register === 'changes' && req.query.q && typeof req.query.q !== 'string'){
                  debug_internals('register query.q', req.query);
                  query = this.build_query_fields(query, {q: [{new_val: req.query.q }, 'type']})
                }


                /**
                * periodical
                **/
                if (req.query.register === 'periodical' && req.query.aggregation && !req.query.q) {
                  query =  this.result_with_aggregation(query, req.query.aggregation)
                }
                else if(req.query.index === false){
                  query = app.build_query_fields(query, req.query)

                  debug('NO INDEX %o', query)

                  // query.run(app.conn, {arrayLimit: 10000000}, _result_callback)

                }
                else if(req.query.register === 'periodical'){
                  query = query
                    .group( app.get_group(req.query.index) )
                    // .group( {index:'path'} )
                    .ungroup()
                    .map(
                      function (doc) {
                        // return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result_between(doc)
                        return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc, (req.query.index) ? req.query.index : 'path')
                      }
                  )
                }


                app.register(
                  query,
                  req,
                  params
                )
              }
              else{

                app.unregister(
                  req,
                  params
                )
              }

            }//req.query.register === true
          }
        },

      ]

		},

		routes: {

		},

  },

	initialize: function(options){
		// debug('initialize', options)
		// process.exit(1)
		// // debug('require.cache', require.cache)
		// var schema = buildSchema(`
		// 	type Query {
		// 		hello: String
		// 	}
		// `);
		//
		// var root = { hello: () => 'Hello world!' };
		//
		// graphql(schema, '{ hello }', root).then((response) => {
		// 	debug('graphql', response);
		// 	process.exit(1)
		// });
		// //
		this.parent(options)
	},




});
