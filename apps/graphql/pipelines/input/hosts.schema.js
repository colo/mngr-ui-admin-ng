/**
* https://walmartlabs.github.io/json-to-simple-graphql-schema/
**/
'use strict'

// import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

module.exports = `

type UserInfo { gid: Int
  homedir: String
  shell: String
  uid: Int
  username: String }

type Cpus { model: String speed: Int }

type HostData { EOL: String
  arch: String
  endianness: String
  homedir: String
  hostname: String
  platform: String
  release: String
  tmpDir: String
  tmpdir: String
  totalmem: Int
  type: String
  version: String
  userInfo: UserInfo
  networkInterfaces: JSONObject
  cpus: [Cpus!]!
  constants: JSONObject }

type Host { id: String metadata: Metadata data: HostData }

extend type Query {
	hosts(limit: Int = 0 type: String = "once"): [Host!]!
	host(id: String): Host!
}

`
