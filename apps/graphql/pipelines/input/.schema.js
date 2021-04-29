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

type OSCpusData { cores: Int
  idle: Float
  irq: Float
  nice: Float
  sys: Float
  user: Float }

type OSBlockdevicesRequestsData { discard_ios: Int
  discard_merges: Int
  read_ios: Int
  read_merges: Int
  write_ios: Int
  write_merges: Int
}

type OSBlockdevicesSectorsData {
	discard_sectors: Int
  read_sectors: Int
  write_sectors: Int
}

type OSBlockdevicesTimeData { discard_ticks: Int
  read_ticks: Int
  time_in_queue: Int
  write_ticks: Int
}

# type OSLoadavgData { 15_min: Float 1_min: Float 5_min: Float }

type OSMemoryData { freemem: Float totalmem: Float }

type OSMountsBlocksData { availabe: Float total: Float used: Float }

type OSNetworkInterfacesBytesData { recived: Float transmited: Float }
type OSNetworkInterfacesPacketsData {
	drop_recived: Float
  drop_transmited: Float
  errs_recived: Float
  errs_transmited: Float
  packets_recived: Float
  packets_transmited: Float
}

type OSUptimeData { seconds: Float }

# type OSCpus { id: String metadata: Metadata data: OSCpusData! }
# type OSGeneric { id: String metadata: Metadata data: JSONObject! }

# union OS = OSCpus | OSGeneric
# type OS { id: String metadata: Metadata data: JSONObject! }

interface OS { id: String metadata: Metadata }

type OSCpus implements OS { id: String metadata: Metadata data: OSCpusData! }
type OSBlockdevicesRequests implements OS { id: String metadata: Metadata data: OSBlockdevicesRequestsData! }
type OSBlockdevicesSectors implements OS { id: String metadata: Metadata data: OSBlockdevicesSectorsData! }
type OSBlockdevicesTime implements OS { id: String metadata: Metadata data: OSBlockdevicesTimeData! }
# type OSLoadavg implements OS { id: String metadata: Metadata data: OSLoadavgData! }
type OSMemory implements OS { id: String metadata: Metadata data: OSMemoryData! }
type OSMountsBlocks implements OS { id: String metadata: Metadata data: OSMountsBlocksData! }
type OSMountsUsed implements OS { id: String metadata: Metadata data: JSONObject! }
type OSNetworkInterfacesBytes implements OS { id: String metadata: Metadata data: OSNetworkInterfacesBytesData! }
type OSNetworkInterfacesPackets implements OS { id: String metadata: Metadata data: OSNetworkInterfacesPacketsData! }
type OSUptime implements OS { id: String metadata: Metadata data: OSUptimeData! }

type OSGeneric implements OS { id: String metadata: Metadata data: JSONObject! }


type Query {
	hosts: [Host!]!
	host(id: String): Host!
	os(id: String path:String limit: Int = 1 type: String = "periodical"): [OS]!
}

schema {
    query: Query
}

# Types with identical fields:
# Lo Eth0
`
