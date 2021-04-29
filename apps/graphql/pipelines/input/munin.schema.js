/**
* https://walmartlabs.github.io/json-to-simple-graphql-schema/
**/
'use strict'

module.exports = `

# interface Munin { id: String metadata: Metadata config: JSONObject!}

# type MuninGeneric implements Munin { id: String metadata: Metadata data: JSONObject! config: JSONObject!}

type Munin { id: String metadata: Metadata data: JSONObject! config: JSONObject!}

extend type Query {
	munin(id: String host:String path:String limit: Int = 1 type: String = "periodical"): [Munin!]!
}
`
