import type { FastifyInstance } from 'fastify'

export type Servers = FastifyInstance

export interface IApiController {
  register: (server: Servers) => void
}
