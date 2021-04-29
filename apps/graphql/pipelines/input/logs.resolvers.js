'use strict'

let debug = require('debug')('mngr-ui-admin:apps:graphql:pipelines:logs.resolvers')

module.exports = function(query, app){
	let resolvers = {
		Log: {
			__resolveType(obj, context, info){
				// debug('__resolveType', arguments)
				// process.exit(1)
				if(obj.metadata.path === 'logs.nginx'){
					return 'LogNginx'
				}
				else if(obj.metadata.path === 'logs.qmail.send'){
					return 'LogQmailSend'
				}
				else if(obj.metadata.path === 'logs.educativa'){
					return 'LogEducativa'
				}

				return 'LogGeneric'
			}

		},
		LogQmailSendInterface: {
			__resolveType(obj, context, info){
				// debug('__resolveType', arguments)
				// process.exit(1)
				if(obj.metadata.domain === 'delivery.starting'){
					return 'LogQmailSendDeliveryStarting'
				}
				else if(obj.metadata.domain === 'delivery.status'){
					return 'LogQmailSendDeliveryStatus'
				}
				else if(obj.metadata.domain === 'msg.bounce'){
					return 'LogQmailSendMsgBounce'
				}
				else if(obj.metadata.domain === 'msg.end' || obj.metadata.domain === 'msg.new'){
					return 'LogQmailSendMsg'
				}
				// else if(obj.metadata.domain === 'msg.new'){
				// 	return 'LogQmailSendMsgNew'
				// }
				else if(obj.metadata.domain === 'msg.info'){
					return 'LogQmailSendMsgInfo'
				}
				else if(obj.metadata.domain === 'status'){
					return 'LogQmailSendStatus'
				}

				return 'LogQmailSendGeneric'
			}

		},
		Query: {

			log: async (obj, args, context, info) => {
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
				else if(args.domain && args.domain === '*'){

					if(args.host !== undefined){
						query = query
							.filter(app.r.row('metadata')('host').eq(args.host).and(app.r.row('metadata')('path').eq('logs.'+args.path)))
					}
					else{
						query = query
							.filter(app.r.row('metadata')('path').eq('logs.'+args.path))
					}


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
						filters.push(app.r.row('metadata')('path').eq('logs.'+args.path))

					if(args.type !== undefined)
						filters.push(app.r.row('metadata')('type').eq(args.type))

					if(args.domain !== undefined)
						filters.push(app.r.row('metadata')('domain').eq(args.domain))

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
					// 		app.r.row('metadata')('path').eq('os.'+args.path).and(
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
					else if(args.domain && args.domain === '*'){
						query = query
							.withFields({metadata: 'domain'})
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
			},
			log_educativa: async (obj, args, context, info) => {
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
				if(args.id && args.id !== undefined){
					query = query.get(args.id)
				}
				// else if(!args.path || args.path === undefined){
				//
				// 	if(args.host !== undefined)
				// 		query = query
				// 			.filter(app.r.row('metadata')('host').eq(args.host))
				//
				// 	// query = query
				// 	// 	.withFields({metadata: 'path'})
				// 	// 	.distinct()
				//
				// }
				else if(args.domain && args.domain === '*'){

					if(args.host !== undefined){
						query = query
							.filter(app.r.row('metadata')('host').eq(args.host).and(app.r.row('metadata')('path').eq('logs.educativa')))
					}
					else{
						query = query
							.filter(app.r.row('metadata')('path').eq('logs.educativa'))
					}


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

					// if(args.path !== undefined)
						filters.push(app.r.row('metadata')('path').eq('logs.educativa'))

					if(args.type !== undefined)
						filters.push(app.r.row('metadata')('type').eq(args.type))

					if(args.domain !== undefined)
						filters.push(app.r.row('metadata')('domain').eq(args.domain))

					if(args.action !== undefined)
						filters.push(app.r.row('data')('action').eq(args.action))

					if(args.cgi !== undefined)
						filters.push(app.r.row('data')('cgi').eq(args.cgi))

					if(args.course !== undefined)
						filters.push(app.r.row('data')('course').eq(args.course))

					if(args.duration !== undefined)
						filters.push(app.r.row('data')('duration').eq(args.duration))

					if(args.end !== undefined)
						filters.push(app.r.row('data')('end').eq(args.end))

					if(args.start !== undefined)
						filters.push(app.r.row('data')('start').eq(args.start))

					if(args.type !== undefined)
						filters.push(app.r.row('data')('type').eq(args.type))

					if(args.user !== undefined)
						filters.push(app.r.row('data')('user').eq(args.user))

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
					// 		app.r.row('metadata')('path').eq('os.'+args.path).and(
					// 			app.r.row('metadata')('type').eq(args.type)
					// 		)
					// 	)
					// )

				}

				if(!args.id || args.id === undefined){

					// if(!args.path || args.path === undefined){
					// 	query = query
					// 		.withFields({metadata: 'path'})
					// 		.distinct()
					// 	// query = query.distinct()
					// }
					// else
					if(args.domain && args.domain === '*'){
						query = query
							.withFields({metadata: 'domain'})
							.distinct()
						// query = query.distinct()
					}
					else{
						query = query.withFields(app.r.args(fields))
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
			},
			log_nginx: async (obj, args, context, info) => {

				debug('arguments %O %O %O %O ', obj, args, context, info.fieldNodes[0].selectionSet.selections)
				// process.exit(1)

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
				if(args.id && args.id !== undefined){
					query = query.get(args.id)
				}
				// else if(!args.path || args.path === undefined){
				//
				// 	if(args.host !== undefined)
				// 		query = query
				// 			.filter(app.r.row('metadata')('host').eq(args.host))
				//
				// 	// query = query
				// 	// 	.withFields({metadata: 'path'})
				// 	// 	.distinct()
				//
				// }
				else if(args.domain && args.domain === '*'){

					if(args.host !== undefined){
						query = query
							.filter(app.r.row('metadata')('host').eq(args.host).and(app.r.row('metadata')('path').eq('logs.nginx')))
					}
					else{
						query = query
							.filter(app.r.row('metadata')('path').eq('logs.nginx'))
					}


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

					// if(args.path !== undefined)
						filters.push(app.r.row('metadata')('path').eq('logs.nginx'))

					if(args.type !== undefined)
						filters.push(app.r.row('metadata')('type').eq(args.type))

					if(args.domain !== undefined)
						filters.push(app.r.row('metadata')('domain').eq(args.domain))

					if(args.body_bytes_sent !== undefined)
						filters.push(app.r.row('data')('body_bytes_sent').eq(args.body_bytes_sent))

					if(args.http_referer !== undefined)
						filters.push(app.r.row('data')('http_referer').eq(args.http_referer))

					if(args.http_user_agent !== undefined)
						filters.push(app.r.row('data')('http_user_agent').eq(args.http_user_agent))

					if(args.http_x_forwarded_for !== undefined)
						filters.push(app.r.row('data')('http_x_forwarded_for').eq(args.http_x_forwarded_for))

					if(args.log !== undefined)
						filters.push(app.r.row('data')('log').eq(args.log))

					if(args.method !== undefined)
						filters.push(app.r.row('data')('method').eq(args.method))

					if(args.path !== undefined)
						filters.push(app.r.row('data')('path').eq(args.path))

					if(args.pathname !== undefined)
						filters.push(app.r.row('data')('pathname').eq(args.pathname))

					if(args.remote_addr !== undefined)
						filters.push(app.r.row('data')('remote_addr').eq(args.remote_addr))

					if(args.remote_user !== undefined)
						filters.push(app.r.row('data')('remote_user').eq(args.remote_user))

					if(args.status !== undefined)
						filters.push(app.r.row('data')('status').eq(args.status))

					if(args.time_local !== undefined)
						filters.push(app.r.row('data')('time_local').eq(args.time_local))

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

						debug('to_filter', to_filter)
						// process.exit(1)

						query = query.filter(to_filter)
					}

					// .filter(
					// 	app.r.row('metadata')('host').eq(args.host).and(
					// 		app.r.row('metadata')('path').eq('os.'+args.path).and(
					// 			app.r.row('metadata')('type').eq(args.type)
					// 		)
					// 	)
					// )

				}

				if(!args.id || args.id === undefined){

					// if(!args.path || args.path === undefined){
					// 	query = query
					// 		.withFields({metadata: 'path'})
					// 		.distinct()
					// 	// query = query.distinct()
					// }
					// else
					if(args.domain && args.domain === '*'){
						query = query
							.withFields({metadata: 'domain'})
							.distinct()
						// query = query.distinct()
					}
					else{
						query = query.withFields(app.r.args(fields))
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
			},

			log_qmailsend: async (obj, args, context, info) => {
				debug('arguments %O %O %O %O ', obj, args, context, info.fieldNodes[0].selectionSet.selections)

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
				if(args.id && args.id !== undefined){
					query = query.get(args.id)
				}
				// else if(!args.path || args.path === undefined){
				//
				// 	if(args.host !== undefined)
				// 		query = query
				// 			.filter(app.r.row('metadata')('host').eq(args.host))
				//
				// 	// query = query
				// 	// 	.withFields({metadata: 'path'})
				// 	// 	.distinct()
				//
				// }
				else if(args.domain && args.domain === '*'){

					if(args.host !== undefined){
						query = query
							.filter(app.r.row('metadata')('host').eq(args.host).and(app.r.row('metadata')('path').eq('logs.qmail.send')))
					}
					else{
						query = query
							.filter(app.r.row('metadata')('path').eq('logs.qmail.send'))
					}


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

					// if(args.path !== undefined)
						filters.push(app.r.row('metadata')('path').eq('logs.qmail.send'))

					if(args.type !== undefined)
						filters.push(app.r.row('metadata')('type').eq(args.type))

					if(args.domain !== undefined)
						filters.push(app.r.row('metadata')('domain').eq(args.domain))


					if(args.data_id !== undefined)
						filters.push(app.r.row('data')('id').eq(args.data_id))

					if(args.log !== undefined)
						filters.push(app.r.row('data')('log').eq(args.log))

					if(args.msg !== undefined)
						filters.push(app.r.row('data')('msg').eq(args.msg))

					if(args.tai64 !== undefined)
						filters.push(app.r.row('data')('tai64').eq(args.tai64))

					if(args.to !== undefined)
						filters.push(app.r.row('data')('to').eq(args.to))

					if(args.type !== undefined)
						filters.push(app.r.row('data')('type').eq(args.type))

					if(args.response !== undefined)
						filters.push(app.r.row('data')('response').eq(args.response))

					if(args.status !== undefined)
						filters.push(app.r.row('data')('status').eq(args.status))

					if(args.qp !== undefined)
						filters.push(app.r.row('data')('qp').eq(args.qp))

					if(args.from !== undefined)
						filters.push(app.r.row('data')('from').eq(args.from))

					if(args.uid !== undefined)
						filters.push(app.r.row('data')('uid').eq(args.uid))

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

						debug('to_filter', to_filter, args)
						// process.exit(1)

						query = query.filter(to_filter)
					}

					// .filter(
					// 	app.r.row('metadata')('host').eq(args.host).and(
					// 		app.r.row('metadata')('path').eq('os.'+args.path).and(
					// 			app.r.row('metadata')('type').eq(args.type)
					// 		)
					// 	)
					// )

				}

				if(!args.id || args.id === undefined){

					// if(!args.path || args.path === undefined){
					// 	query = query
					// 		.withFields({metadata: 'path'})
					// 		.distinct()
					// 	// query = query.distinct()
					// }
					// else
					if(args.domain && args.domain === '*'){
						query = query
							.withFields({metadata: 'domain'})
							.distinct()
						// query = query.distinct()
					}
					else{
						query = query.withFields(app.r.args(fields))
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
			},
			log_qmailsend_email: async (obj, args, context, info) => {
				debug('arguments %O %O %O %O ', obj, args, context, info.fieldNodes[0].selectionSet.selections)

				let sub_queries = query

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

					query = query
					.orderBy({index: app.r.desc('timestamp')})

					let filters = []
					if(args.host !== undefined)
						filters.push(app.r.row('metadata')('host').eq(args.host))

					// if(args.path !== undefined)
					filters.push(app.r.row('metadata')('path').eq('logs.qmail.send'))


					if(args.type !== undefined)
						filters.push(app.r.row('metadata')('type').eq(args.type))

					/**
					* qmail+vpopmail local account format
					**/
					let local_account = args.to.split('@')[1]+'-'+args.to.split('@')[0]+'@'+args.to.split('@')[1]
					debug('local_account',local_account)


					if(args.from !== undefined){
						filters.push(app.r.row('metadata')('domain').eq('msg.info'))
						filters.push(app.r.row('data')('from').eq(args.from))
					}
					else if(args.to !== undefined){
						filters.push(app.r.row('metadata')('domain').eq('delivery.starting'))
						filters.push(app.r.row('data')('to').eq(args.to).or(app.r.row('data')('to').eq(local_account)))

						if(args.delivery_type && args.delivery_type !== undefined){
							filters.push(app.r.row('data')('type').eq(args.delivery_type))
						}
					}



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

						debug('to_filter', to_filter, args)
						// process.exit(1)

						query = query.filter(to_filter)
					}

					if(args.from !== undefined){


						query = query
						.merge(function (log) {
					    return {
					      data:{
					        delivery: sub_queries
					          .filter(
					            function (_log) {
					                return _log('metadata')('domain').eq('delivery.starting').and(
					                  _log('metadata')('host').eq(log('metadata')('host')).and(
					                    _log('metadata')('path').eq('logs.qmail.send').and(
					                      _log('data')('msg').eq(log('data')('msg'))
					                    )
					                  )
					                )
													.and(_log('data')('to').eq(args.to).or(
														_log('data')('to').eq(local_account)
													))



					            }

					          )
					        	.merge(function (delivery) {
					            return {
					              data:{
					                status: sub_queries
					                .filter(
					                  function (_delivery) {
					                    return _delivery('metadata')('domain').eq('delivery.status').and(
					                    	_delivery('metadata')('host').eq(delivery('metadata')('host')).and(
					                        _delivery('metadata')('path').eq('logs.qmail.send').and(
					                          _delivery('data')('id').eq(delivery('data')('id'))
					                        )
					                      )
					                    );

					                  }

					                )
					                .coerceTo('array')

					              }
					            }
					          })

					          .coerceTo('array')

					        }
					      }
						})

					// 	.merge(function (log) {
					//     return {
					//       data:{
					//         delivery: sub_queries
					//           .filter(
					//             function (_log) {
					//                 return _log('metadata')('domain').ne('msg.info').and(
					//                   _log('metadata')('host').eq(log('metadata')('host')).and(
					//                     _log('metadata')('path').eq('logs.qmail.send').and(
					//                       _log('data')('msg').eq(log('data')('msg'))
					//                     )
					//                   )
					//                 )
					//                 .and(_log('data')('to').eq(args.to).or(
					// 									_log('data')('to').eq(local_account)
					// 								))
					//
					//             }
					//
					//           )
					//         	.merge(function (delivery) {
					//             return {
					//               data:{
					//                 status: sub_queries
					//                 .filter(
					//                   function (_delivery) {
					//                     return _delivery('metadata')('domain').ne('delivery.starting').and(
					//                     	_delivery('metadata')('host').eq(delivery('metadata')('host')).and(
					//                         _delivery('metadata')('path').eq('logs.qmail.send').and(
					//                           _delivery('data')('id').eq(delivery('data')('id'))
					//                         )
					//                       )
					//                     );
					//
					//                   }
					//
					//                 )
					//                 .coerceTo('array')
					//                 // .nth(0)
					//               }
					//             }
					//           })
					//
					//           .coerceTo('array')
					//         	// .nth(0)
					//         }
					//       }
					// })

					}
					else {
						query = query
						.merge(function (delivery) {
							return {
								data:{
									status: sub_queries
									.filter(
										function (_delivery) {
											return _delivery('metadata')('domain').ne('delivery.starting').and(
												_delivery('metadata')('host').eq(delivery('metadata')('host')).and(
													_delivery('metadata')('path').eq('logs.qmail.send').and(
														_delivery('data')('id').eq(delivery('data')('id'))
													)
												)
											);

										}

									)
									.coerceTo('array')
									// .nth(0)
								}
							}
						})
					}
					// .filter(
					// 	app.r.row('metadata')('host').eq(args.host).and(
					// 		app.r.row('metadata')('path').eq('os.'+args.path).and(
					// 			app.r.row('metadata')('type').eq(args.type)
					// 		)
					// 	)
					// )

				// }

				// if(!args.id || args.id === undefined){
					// if(args.domain && args.domain === '*'){
					// 	query = query
					// 		.withFields({metadata: 'domain'})
					// 		.distinct()
					// 	// query = query.distinct()
					// }
					// else{
					query = query.withFields(app.r.args(fields))
					// }

					if(args.limit > 0)
						query = query.limit(args.limit)
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
			},
		}
	}

	return resolvers
}
