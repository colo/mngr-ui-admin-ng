'use strict'

let debug = require('debug')('mngr-ui-admin:apps:graphql:pipelines:vhosts.resolvers')

module.exports = function(query, app){
	let resolvers = {
		// Munin: {
		// 	__resolveType(obj, context, info){
		// 		// debug('__resolveType', arguments)
		// 		// process.exit(1)
		// 		if(obj.metadata.path === 'os.cpus'){
		// 			return 'OSCpus'
		// 		}
		// 		// else if(obj.metadata.path === 'os.loadavg'){
		// 		// 	return 'OSLoadavg'
		// 		// }
		// 		else if(obj.metadata.path === 'os.uptime'){
		// 			return 'OSUptime'
		// 		}
		// 		else if(obj.metadata.path === 'os.memory'){
		// 			return 'OSMemory'
		// 		}
		// 		else if(obj.metadata.path === 'os.mounts.used'){
		// 			return 'OSMountsUsed'
		// 		}
		// 		else if(/^os\.blockdevices\.(.)*\.requests$/.test(obj.metadata.path)){
		// 			return 'OSBlockdevicesRequests'
		// 		}
		// 		else if(/^os\.blockdevices\.(.)*\.sectors$/.test(obj.metadata.path)){
		// 			return 'OSBlockdevicesSectors'
		// 		}
		// 		else if(/^os\.blockdevices\.(.)*\.time$/.test(obj.metadata.path)){
		// 			return 'OSBlockdevicesTime'
		// 		}
		// 		else if(/^os\.mounts\.(.)*\.blocks$/.test(obj.metadata.path)){
		// 			return 'OSMountsBlocks'
		// 		}
		// 		else if(/^os\.networkInterfaces\.(.)*\.bytes$/.test(obj.metadata.path)){
		// 			return 'OSNetworkInterfacesBytes'
		// 		}
		// 		else if(/^os\.networkInterfaces\.(.)*\.packets$/.test(obj.metadata.path)){
		// 			return 'OSNetworkInterfacesPackets'
		// 		}
		//
		// 		return 'MuninGeneric'
		// 	}
		//
		// },
		Query: {
			vhosts: async (obj, args, context, info) => {
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

				debug('fields %O ', fields)
				// process.exit(1)
				// const result = await query.get(args.id+'.host').pluck({metadata: ['timestamp', 'path']}).run(app.conn)
				// let cursor
				if(args.id && args.id !== undefined){
					query = query.get(args.id)
				}
				else if(!args.path || args.path === undefined){

					if(args.host !== undefined)
						query = query
							.filter(app.r.row('metadata')('host').eq(args.host))

					// query = query
					// 	.withFields({metadata: 'path'})
					// 	.distinct()

				}
				else {
					query = query
					.orderBy({index: app.r.desc('timestamp')})

					let filters = []
					if(args.host !== undefined)
						filters.push(app.r.row('metadata')('host').eq(args.host))

					if(args.path !== undefined)
						filters.push(app.r.row('metadata')('path').eq('vhosts.'+args.path))

					if(args.type !== undefined)
						filters.push(app.r.row('metadata')('type').eq(args.type))

					if(args.port !== undefined)
						filters.push(app.r.row('data')('port').eq(''+args.port)) //currently typecast to String, as docs are saving it (wrongly) as String

					if(args.schema !== undefined)
						filters.push(app.r.row('data')('schema').eq(args.schema))

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
					// 		app.r.row('metadata')('path').eq('vhosts.'+args.path).and(
					// 			app.r.row('metadata')('type').eq(args.type)
					// 		)
					// 	)
					// )

				}

				if(!args.id || args.id === undefined){

					if(!args.path || args.path === undefined){
						query = query
							.withFields({metadata: 'path'})
							.distinct()
						// query = query.distinct()
					}
					else{
						// query = query.withFields(app.r.args(fields))
						query = query.pluck(app.r.args(fields))
					}

					if(args.limit > 0)
						query = query.limit(args.limit)
				}



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
