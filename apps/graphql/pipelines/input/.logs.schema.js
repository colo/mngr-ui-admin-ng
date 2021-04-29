/**
* https://walmartlabs.github.io/json-to-simple-graphql-schema/
**/
'use strict'

// import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

module.exports = `

type LogNginxData {
	body_bytes_sent: Float
  http_referer: String
  http_user_agent: String
  http_x_forwarded_for: String
  log: String
  method: String
  path: String
  pathname: String
  remote_addr: String
  remote_user: String
  status: Int
  time_local: String
  version: String
  user_agent: JSONObject
  referer: JSONObject
  location: JSONObject
  geoip: JSONObject
}

type LogEducativaData {
	action: String
  cgi: String
  course: Int
  duration: Float
  end: Float
  log: String
  start: Float
  type: String
  user: String
}


type LogMetadata {
	host: String
	domain: String
  id: String
  path: String
	_timestamp: Float
  timestamp: Float
  type: String
  tag: [String ]
}

interface Log { id: String metadata: LogMetadata }

type LogEducativa implements Log { id: String metadata: LogMetadata data: LogEducativaData! }
type LogQmailSend implements Log { id: String metadata: LogMetadata data: JSONObject! }
type LogNginx implements Log { id: String metadata: LogMetadata data: LogNginxData! }
type LogGeneric implements Log { id: String metadata: LogMetadata data: JSONObject! }

extend type Query {
	log_educativa(
		id: String
		domain: String
		host: String
		limit: Int = 1
		type: String = "periodical"
		action: String
	  cgi: String
	  course: Int
	  duration: Int
	  end: Int
	  start: Int
	  type: String
	  user: String
	): [LogEducativa!]!

	log_nginx(
		id: String
		domain:String
		host:String
		limit: Int = 1
		type: String = "periodical"
		body_bytes_sent: Float
	  http_referer: String
	  http_user_agent: String
	  http_x_forwarded_for: String
	  log: String
	  method: String
	  path: String
	  pathname: String
	  remote_addr: String
	  remote_user: String
	  status: Int
	  time_local: String
	): [LogNginx!]!

	log(id: String domain:String host:String path:String limit: Int = 1 type: String = "periodical"): [Log!]!
}
`
