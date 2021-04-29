/**
* https://walmartlabs.github.io/json-to-simple-graphql-schema/
**/
'use strict'

module.exports = `
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

type If { address: String
  cidr: String
  family: String
  internal: Boolean
  mac: String
  netmask: String }

type Eth { if: [If ] }

type NetworkInterfaces { lo: Eth eth0: Eth }

type Cpus { model: String speed: Int }

type Signals { SIGABRT: Int
  SIGALRM: Int
  SIGBUS: Int
  SIGCHLD: Int
  SIGCONT: Int
  SIGFPE: Int
  SIGHUP: Int
  SIGILL: Int
  SIGINT: Int
  SIGIO: Int
  SIGIOT: Int
  SIGKILL: Int
  SIGPIPE: Int
  SIGPOLL: Int
  SIGPROF: Int
  SIGPWR: Int
  SIGQUIT: Int
  SIGSEGV: Int
  SIGSTKFLT: Int
  SIGSTOP: Int
  SIGSYS: Int
  SIGTERM: Int
  SIGTRAP: Int
  SIGTSTP: Int
  SIGTTIN: Int
  SIGTTOU: Int
  SIGUNUSED: Int
  SIGURG: Int
  SIGUSR1: Int
  SIGUSR2: Int
  SIGVTALRM: Int
  SIGWINCH: Int
  SIGXCPU: Int
  SIGXFSZ: Int }

type Priority { PRIORITY_ABOVE_NORMAL: Int
  PRIORITY_BELOW_NORMAL: Int
  PRIORITY_HIGH: Int
  PRIORITY_HIGHEST: Int
  PRIORITY_LOW: Int
  PRIORITY_NORMAL: Int }

type Errno { E2BIG: Int
  EACCES: Int
  EADDRINUSE: Int
  EADDRNOTAVAIL: Int
  EAFNOSUPPORT: Int
  EAGAIN: Int
  EALREADY: Int
  EBADF: Int
  EBADMSG: Int
  EBUSY: Int
  ECANCELED: Int
  ECHILD: Int
  ECONNABORTED: Int
  ECONNREFUSED: Int
  ECONNRESET: Int
  EDEADLK: Int
  EDESTADDRREQ: Int
  EDOM: Int
  EDQUOT: Int
  EEXIST: Int
  EFAULT: Int
  EFBIG: Int
  EHOSTUNREACH: Int
  EIDRM: Int
  EILSEQ: Int
  EINPROGRESS: Int
  EINTR: Int
  EINVAL: Int
  EIO: Int
  EISCONN: Int
  EISDIR: Int
  ELOOP: Int
  EMFILE: Int
  EMLINK: Int
  EMSGSIZE: Int
  EMULTIHOP: Int
  ENAMETOOLONG: Int
  ENETDOWN: Int
  ENETRESET: Int
  ENETUNREACH: Int
  ENFILE: Int
  ENOBUFS: Int
  ENODATA: Int
  ENODEV: Int
  ENOENT: Int
  ENOEXEC: Int
  ENOLCK: Int
  ENOLINK: Int
  ENOMEM: Int
  ENOMSG: Int
  ENOPROTOOPT: Int
  ENOSPC: Int
  ENOSR: Int
  ENOSTR: Int
  ENOSYS: Int
  ENOTCONN: Int
  ENOTDIR: Int
  ENOTEMPTY: Int
  ENOTSOCK: Int
  ENOTSUP: Int
  ENOTTY: Int
  ENXIO: Int
  EOPNOTSUPP: Int
  EOVERFLOW: Int
  EPERM: Int
  EPIPE: Int
  EPROTO: Int
  EPROTONOSUPPORT: Int
  EPROTOTYPE: Int
  ERANGE: Int
  EROFS: Int
  ESPIPE: Int
  ESRCH: Int
  ESTALE: Int
  ETIME: Int
  ETIMEDOUT: Int
  ETXTBSY: Int
  EWOULDBLOCK: Int
  EXDEV: Int }

type Dlopen { RTLD_DEEPBIND: Int
  RTLD_GLOBAL: Int
  RTLD_LAZY: Int
  RTLD_LOCAL: Int
  RTLD_NOW: Int }

type Constants { UV_UDP_REUSEADDR: Int
  signals: Signals
  priority: Priority
  errno: Errno
  dlopen: Dlopen }

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
  networkInterfaces: NetworkInterfaces
  cpus: [Cpus!]!
  constants: Constants }

type Host { id: String metadata: Metadata data: Data }

type Query {
	hosts: [Host!]!
	host(id: String): Host!
}

# Types with identical fields:
# Lo Eth0
`
