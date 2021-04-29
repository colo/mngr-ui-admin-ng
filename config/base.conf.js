'use strict'

let App = require('../modules/node-express-app')

App = require('../modules/node-express-app/io')(App)

let os = require('os'),
		path = require('path'),
		bodyParser = require('body-parser'),
		//multer = require('multer'), // v1.0.5
		//upload = multer(), // for parsing multipart/form-data
		cors = require('cors'),
		compression = require('compression');

// let session = require('express-session')
// let MemoryStore = require('memorystore')(session)
// let serialize = require('serialize-to-js').serialize
// let deserialize = require('serialize-to-js').deserialize
let MemoryStore = require('express-session/session/memory')
//
// let debug = require('debug')('apps:os:Base:Conf'),
//     debug_internals = require('debug')('apps:os:Base:Conf');

module.exports = new Class({
  Extends: App,

	app: null,
  logger: null,
  authorization:null,
  authentication: null,

	options: {
		on_demand: false,

		middlewares: [
			compression(),
			bodyParser.json(),
			bodyParser.urlencoded({ extended: true }),
			cors({
				origin: [
					'http://localhost:8083',
					'http://localhost:8080',
				],
				credentials: true,
				'exposedHeaders': ['Link', 'Content-Range', 'set-cookie']
			})
	  ],

		path: '',

		// logs: undefined,
		//
		// authentication: {
		// 	users : [
		// 			{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''}
		// 	],
		// },
		//
		// authorization: {
		// 	config: path.join(__dirname,'./rbac.json'),
		// },


  },

});
