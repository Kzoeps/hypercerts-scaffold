/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type Auth,
  type Options as XrpcOptions,
  Server as XrpcServer,
  type StreamConfigOrHandler,
  type MethodConfigOrHandler,
  createServer as createXrpcServer,
} from '@atproto/xrpc-server'
import { schemas } from './lexicons.js'

export function createServer(options?: XrpcOptions): Server {
  return new Server(options)
}

export class Server {
  xrpc: XrpcServer
  org: OrgNS

  constructor(options?: XrpcOptions) {
    this.xrpc = createXrpcServer(schemas, options)
    this.org = new OrgNS(this)
  }
}

export class OrgNS {
  _server: Server
  hypercerts: OrgHypercertsNS

  constructor(server: Server) {
    this._server = server
    this.hypercerts = new OrgHypercertsNS(server)
  }
}

export class OrgHypercertsNS {
  _server: Server
  claim: OrgHypercertsClaimNS

  constructor(server: Server) {
    this._server = server
    this.claim = new OrgHypercertsClaimNS(server)
  }
}

export class OrgHypercertsClaimNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}
