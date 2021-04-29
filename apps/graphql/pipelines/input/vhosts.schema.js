/**
* https://walmartlabs.github.io/json-to-simple-graphql-schema/
**/
'use strict'

module.exports = `

# interface Munin { id: String metadata: Metadata config: JSONObject!}

# type MuninGeneric implements Munin { id: String metadata: Metadata data: JSONObject! config: JSONObject!}

type VhostData { port: String schema: String uri: String }

type Vhost { id: String metadata: Metadata data: VhostData}

extend type Query {
	vhosts(id: String port:Int schema:String host:String path:String = "nginx.enabled" limit: Int = 1 type: String = "periodical"): [Vhost!]!
}
`
