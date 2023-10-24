import type { FastifyRequest, FastifyReply } from 'fastify'
import { handleError, errorKeys } from '../../../utils/errorManagement'
import { postgresDB } from '../../data/postgres/postgresDataConnector'
import { customReply } from '../../../infrastructure/ApiFastifyServer'
export class HealthCheckController {
  public async index (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    try {
      await postgresDB.$queryRaw`SELECT 1`
      const response = [
        { name: 'api', status: 'ok' }
      ]
      return await customReply(reply, 200, response)
    } catch (error) {
      const e = handleError(error, errorKeys.HEALTH_CHECK_ERROR, this.index.name)
      return await customReply(reply, 500, e.message)
    }
  }
}
