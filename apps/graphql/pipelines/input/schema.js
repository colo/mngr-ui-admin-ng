/**
* https://walmartlabs.github.io/json-to-simple-graphql-schema/
**/
'use strict'

// import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

module.exports = `
scalar JSON
scalar JSONObject

type Metadata { host: String
  id: String
  path: String
  timestamp: Float
  type: String
  tag: [String ]
}

type Doc {
	id: String
	metadata: Metadata
	data: JSONObject!
}

type Query {
	doc(id: String path:String limit: Int = 1 type: String = "periodical"): [Doc!]!
}

schema {
  query: Query
}

`
