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

type LogQmailSendDeliveryStartingData {
	id: Int
  log: String
  msg: Int
  tai64: String
  to: String
  type: String
}

type LogQmailSendDeliveryStatusData {
	id: Int
  log: String
  response: String
  status: String
  tai64: String
}

type LogQmailSendMsgBounceData {
	log: String
	msg: Int
	qp: Int
	tai64: String
}

type LogQmailSendMsgData {
	log: String
	msg: Int
	tai64: String
}

type LogQmailSendMsgInfoData { bytes: Int
  from: String
  log: String
  msg: Int
  qp: Int
  tai64: String
  uid: Int
}

type LogQmailSendStatusData {
	local: JSONObject
  log: String
  remote: JSONObject
  tai64: String
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
interface LogQmailSendInterface { id: String metadata: LogMetadata }

type LogEducativa implements Log { id: String metadata: LogMetadata data: LogEducativaData! }
type LogQmailSend implements Log { id: String metadata: LogMetadata data: JSONObject! }
type LogNginx implements Log { id: String metadata: LogMetadata data: LogNginxData! }
type LogGeneric implements Log { id: String metadata: LogMetadata data: JSONObject! }

type LogQmailSendDeliveryStarting implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendDeliveryStartingData! }
type LogQmailSendDeliveryStatus implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendDeliveryStatusData! }
type LogQmailSendMsgBounce implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendMsgBounceData! }
# type LogQmailSendMsgEnd implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendMsgData! }
# type LogQmailSendMsgNew implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendMsgData! }
type LogQmailSendMsg implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendMsgData! }
type LogQmailSendMsgInfo implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendMsgInfoData! }
type LogQmailSendStatus implements LogQmailSendInterface { id: String metadata: LogMetadata data: LogQmailSendStatusData! }
type LogQmailSendGeneric implements LogQmailSendInterface { id: String metadata: LogMetadata data: JSONObject! }

extend type Query {
	log_qmailsend_email(
		host:String
		limit: Int = 1
		type: String = "periodical"
	  to: String
		response: String
	  status: String
		from: String
		delivery_type: String
	): [LogQmailSendGeneric!]!

	log_qmailsend(
		id: String
		domain:String
		host:String
		limit: Int = 1
		type: String = "periodical"
		data_id: Int
		log: String
	  msg: Int
	  tai64: String
	  to: String
	  type: String
		response: String
	  status: String
		qp: Int
		from: String
	  uid: Int
	): [LogQmailSendInterface!]!

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
