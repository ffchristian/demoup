import { type FastifyInstance } from 'fastify'
import { type IApiController } from '../IApiController'
import { AssetController } from './asset.controller'
import { handleError, errorKeys } from '../../../utils/errorManagement'

export class AssetApi implements IApiController {
  controller: string = 'asset'
  constructor (private readonly apiPrefix: string) {
    this.apiPrefix = apiPrefix
  }

  public register (server: FastifyInstance): void {
    const assetController = new AssetController()

    try {
      server.get(`${this.apiPrefix}/asset`, async (request, reply) => await assetController.index(request, reply))
      server.options(`${this.apiPrefix}/asset`, async (request, reply) => await assetController.indexOptions(request, reply))
      server.get(`${this.apiPrefix}/asset/:id`, async (request, reply) => await assetController.get(request, reply))
      server.post(`${this.apiPrefix}/asset`, async (request, reply) => await assetController.create(request, reply))
      server.delete(`${this.apiPrefix}/asset/:id`, async (request, reply) => await assetController.delete(request, reply))
      // TODO: put update
      // TODO: put add or remove a category
      // TODO: collections related
      // TODO: complete all options as documentation
    } catch (error) {
      throw handleError(error, errorKeys.HEALTH_CHECK_ERROR, this.register.name)
    }
  }
}
