/**
* https://walmartlabs.github.io/json-to-simple-graphql-schema/
**/
'use strict'

// import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

module.exports = `

type Range { end: Float start: Float }

type DmarcMetadata {
	domain: String
  host: String
  id: String
  path: String
  timestamp: Float
  type: String
  tag: [String ]
  range: Range
}

type Report { email: String id: String org: String range: Range }

type Policy { adkim: String
  aspf: String
  domain: String
  fo: String
  p: String
  pct: String
  sp: String
}

type DmarcData { report: Report policy: Policy records: JSONObject }
# type DmarcData { report: JSONObject policy: JSONObject records: JSONObject }

type Dmarc { id: String metadata: DmarcMetadata data: DmarcData! }

extend type Query {
	dmarc(limit: Int = 0 type: String = "periodical" domain: String host: String path: String = "rua" disposition: String order: String = "desc"): [Dmarc!]!
}

`
