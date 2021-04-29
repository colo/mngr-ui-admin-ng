'use strict'

let debug = require('debug')('mngr-ui-admin:apps:root:Pipeline'),
    debug_internals = require('debug')('mngr-ui-admin:apps:root:Pipeline:Internals');

const	path = require('path')
const InputPollerRethinkDB = require(path.join(process.cwd(), '/libs/pipeline/inputs/rethinkdb'))

// const InputPollerRethinkDBTables = require('./input/rethinkdb.tables')

let cron = require('node-cron')

module.exports = function(payload){
  let {conn} = payload

	let conf = require(path.join(process.cwd(), 'libs/pipeline.inputClients'))({
		input: {
			id: "all",

			clients: [
				new InputPollerRethinkDB(Object.merge(
          Object.clone(conn),
          {
            type: 'all'
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
		// 		new JSPipelineOutput(Object.merge({
		// 		id: "output.rethinkdb.educativa.backups.replica",
		//
		// 		buffer:{
		// 			// size: 1,
		// 			// expire: 60001,
		// 			size: -1,//-1 =will add until expire | 0 = no buffer | N > 0 = limit buffer no more than N
		// 			// expire: 60000, //miliseconds until saving
		// 			// periodical: 10000 //how often will check if buffer timestamp has expire
		// 			expire: 1000, //miliseconds until saving
		// 			periodical: 500 //how often will check if buffer timestamp has expire
		// 		},
		//
		// 		table: 'dmarc'
		// 	},
		// 	Object.clone(conn))),
		],

	})

	return conf
}



// module.exports = function(payload){
// 	// //console.log('IO', io)
//   // let {conn, domain, cache, ui} = payload
//   let {conn} = payload
//
//   debug_internals('require %o', payload)
//
//   let conf = {
//   	input: [
//       {
//   			poll: {
//   				suspended: true,//start suspended
//   				id: "all",
//   				conn: [
//             Object.merge(
//               Object.clone(conn),
//               {
//                 // path_key: 'os',
//                 module: InputPollerRethinkDB,
//                 type: 'all'
//               }
//             )
//   				],
//   				connect_retry_count: -1,
//   				connect_retry_periodical: 1000,
//   				// requests: {
//   				// 	periodical: 1000,
//   				// },
//   				requests: {
//       			periodical: function(dispatch){
//   						// //////////console.log('domain periodical running')
//       				return cron.schedule('*/10 * * * * *', dispatch);//every 5 sec
//       			}
//       		},
//   			},
//   		},
//
//   	],
//
//   }
//
//
//   return conf
// }
