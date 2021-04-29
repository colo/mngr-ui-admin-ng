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
  tag: [String ] }

type UserInfo { gid: Int
  homedir: String
  shell: String
  uid: Int
  username: String }

type Cpus { model: String speed: Int }

type Data { EOL: String
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

type Host { id: String metadata: Metadata data: Data }

type Query {
	hosts: [Host!]!
	host(id: String): Host!
}

# Types with identical fields:
# Lo Eth0
`
