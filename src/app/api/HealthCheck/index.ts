import { type FastifyInstance } from 'fastify'
import { type IApiController } from '../IApiController'
import { handleError, errorKeys } from '../../../utils/errorManagement'
import { HealthCheckController } from './healthCheck.controller'

export class HealthCheckApi implements IApiController {
  constructor (private readonly apiPrefix: string) {
    this.apiPrefix = apiPrefix
  }

  public register (server: FastifyInstance): void {
    const healthCheckController = new HealthCheckController()

    try {
      server.get(`${this.apiPrefix}`, async (request, reply) => await healthCheckController.index(request, reply))
    } catch (error) {
      throw handleError(error, errorKeys.HEALTH_CHECK_ERROR, this.register.name)
    }
  }
}
