'use strict'

let debug = require('debug')('mngr-ui-admin:apps:root:Pipeline'),
    debug_internals = require('debug')('mngr-ui-admin:apps:root:Pipeline:Internals');

const	path = require('path')
const InputRethinkDBGraphQL = require(path.join(process.cwd(), '/libs/pipeline/inputs/rethinkdb-graphql'))

// const InputPollerRethinkDBTables = require('./input/rethinkdb.tables')

let cron = require('node-cron')


module.exports = function(payload){
  let {conn} = payload

	let conf = require(path.join(process.cwd(), 'libs/pipeline.inputClients'))({
		input: {
			id: "hosts",

			clients: [
				new InputRethinkDBGraphQL(Object.merge(
          Object.clone(conn),
          {
            type: 'all',
						schema: require('./input/schema'),
						// schema: `type Query {
						// 	hosts: [Host!]!
						//   host(id: String): Host!
						// }
						//
						// type Host {
						// 	metadata: Metadata
						// }
						// type Metadata {
						// 	host: String
						// 	id: String
						// 	path: String
						// 	timestamp: Float
						// }
						// `
          }
        ))
				// new JSPipelineInputImap(Object.merge(imap_conn, {
				// 	requests : {
				// 		periodical: [
				// 			{
				// 				dmarc: function(req, next, app){
				// 					this.search({ uri: 'DMARC', opts: ['UNSEEN', '!DELETED'], type: 'search', id: 'dmarc.rua' })
				// 				}
				// 			}
				//
				// 		]
				// 	},
				// }))
			],

			// type: 'minute', // second || minute || hour || day || once
			requests: {
				// periodical: 5000,
				periodical: function(dispatch){
					// return cron.schedule('14,29,44,59 * * * * *', dispatch);//every 15 secs
					return cron.schedule('*/10 * * * * *', dispatch);//every 20 secs
				},
			},
			suspended: true,
		},

		filters: [],

		output: [

		],

	})

	return conf
}
