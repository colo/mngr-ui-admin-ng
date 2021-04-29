'use strict'

// import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

let debug = require('debug')('mngr-ui-admin:apps:graphql:pipelines:hosts.resolvers')

module.exports = function(query, app){
	let resolvers = {
		Query: {
			host: async (opts, args) => {
				debug('arguments', args)
				// process.exit(1)
				// const result = await query.get(args.id+'.host').pluck({metadata: ['timestamp', 'path']}).run(app.conn)
				const result = await query.get(args.id+'.host').run(app.conn)
				debug('result', result)
				// process.exit(1)
				// return result.metadata
				return result
			},
			hosts: async (obj, args, context, info) => {
				// debug('arguments %O %O %O %O ', obj, args, context, info.fieldNodes[0].selectionSet.selections)
				let fields = []

				let _recurseFields = function(selections){
					debug('_recurseFields %O ', selections)
					let arr = []
					Array.each(selections, function(selection){
						if(selection.kind === 'Field' && selection.selectionSet !== undefined){
							let obj = {}
							// let _arr = []
							let _arr = _recurseFields(selection.selectionSet.selections)
							obj[selection.name.value] = _arr
							arr.push( obj )
						}
						else if(selection.kind === 'Field'){
							arr.push(selection.name.value)
							// return [selection.name.value]
						}
						else if (selection.selectionSet){
							// let obj = {}
							// obj[selection.name.value] =
							// debug('RE _recurseFields', _recurseFields(selection.selectionSet.selections))
							arr.combine( _recurseFields(selection.selectionSet.selections) )
							// debug('result', result)
							// process.exit(1)
							// pluck.push(obj)
						}
					})

					return arr
				}
				fields = _recurseFields(info.fieldNodes[0].selectionSet.selections)

				fields.push('metadata')

				debug('fields %O ', fields, args)
				// process.exit(1)

				// const result = await query.get(args.host+'.host').pluck({metadata: ['timestamp', 'path']}).run(app.conn)
				// let cursor
				// if(args.id && args.id !== undefined){
				// 	query = query.get(args.id)
				// }
				// // else if(!args.path || args.path === undefined){
				// //
				// // 	if(args.host !== undefined)
				// // 		query = query
				// // 			.filter(app.r.row('metadata')('host').eq(args.host))
				// //
				// // 	// query = query
				// // 	// 	.withFields({metadata: 'path'})
				// // 	// 	.distinct()
				// //
				// // }
				// else {
					query = query
					.orderBy({index: app.r.desc('timestamp')})

					let filters = []
					if(args.host !== undefined)
						filters.push(app.r.row('metadata')('host').eq(args.host))

					if(args.path !== undefined)
						filters.push(app.r.row('metadata')('path').eq('munin.'+args.path))

					if(args.type !== undefined)
						filters.push(app.r.row('metadata')('type').eq(args.type))

					if(filters.length > 0){
						let to_filter
						for(let i = filters.length - 1; i >= 0; i--){
							let filter = filters[i]
							if(i === filters.length - 1){
								to_filter = filter
							}
							else{
								to_filter = filter.and(to_filter)
							}
						}

						// debug('to_filter', to_filter)
						// process.exit(1)

						query = query.filter(to_filter)
					}

					// .filter(
					// 	app.r.row('metadata')('host').eq(args.host).and(
					// 		app.r.row('metadata')('path').eq('munin.'+args.path).and(
					// 			app.r.row('metadata')('type').eq(args.type)
					// 		)
					// 	)
					// )

				// }

				// if(!args.id || args.id === undefined){

					// query = query.withFields(app.r.args(fields))
					query = query.pluck(app.r.args(fields))

					if(args.limit > 0)
						query = query.limit(args.limit)

					// if(!args.path || args.path === undefined)
					// 	query = query.distinct()
				// }



				const cursor = await query.run(app.conn)

				// cursor.toArray(function(err, result){
				// 	debug('cursor.toArray()', result)
				// 	process.exit(1)
				// })



				if(args.id){
					return [cursor]
				}
				else{
					return cursor.toArray()
				}
			}
		}
	}


	return resolvers
}
