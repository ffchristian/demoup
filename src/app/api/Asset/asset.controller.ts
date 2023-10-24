import type { FastifyRequest, FastifyReply } from 'fastify'
import { handleError, errorKeys } from '../../../utils/errorManagement'
import { type Validator, isBodyValid } from '../../../utils/reqBodyChecker'
import AssetModel, { type IAsset } from './asset.model'
import { customReply } from '../../../infrastructure/ApiFastifyServer'
import AssetToCategory from '../AssetToCategory/assetToCategory.model'
export class AssetController {
  public async create (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    let errorCode = 400
    try {
      const createType: Validator<IAsset> = {
        name: { type: 'string' },
        extension: { type: 'string' },
        type: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string' },
        categoryId: { type: 'number' }
      }
      const bodyErrors = isBodyValid(req.body, createType)
      if (bodyErrors.length > 0) {
        errorCode = 424
        throw new Error(JSON.stringify(bodyErrors))
      }
      const categoryId = (req.body as any).categoryId
      delete (req.body as any).categoryId
      const asset = new AssetModel(req.body as IAsset)
      await asset.save()
      const assetToCategory = new AssetToCategory({ assetId: asset.id as number, categoryId })
      asset.categoryId = categoryId
      await assetToCategory.save()
      return await customReply(reply, 201, asset)
    } catch (error) {
      const e = handleError(error, errorKeys.CREATE_ERROR, this.create.name)
      return await customReply(reply, errorCode, e.message)
    }
  }

  public async get (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    let errorCode = 400
    try {
      const asset = new AssetModel(undefined)
      await asset.findById(parseInt((req.params as { id: string }).id))
      const assetToCategory = new AssetToCategory(undefined)
      const categories = await assetToCategory.findAllByQuery({ assetId: asset.id })
      asset.categories = categories
      return await customReply(reply, 200, asset)
    } catch (error) {
      if ((error as any).message === errorKeys.ENTITY_NOT_FOUND) {
        errorCode = 404
      }
      const e = handleError(error, errorKeys.QUERY_ERROR, this.get.name)
      return await customReply(reply, errorCode, e.message)
    }
  }

  public async index (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const errorCode = 400
    try {
      // this endpoint must be paginated so if it handle millions of records the process power
      // can be splitted chunks by chunks
      const page = (req.query as any).req ?? 1
      const take = (req.query as any).take ?? 10
      const assets = await new AssetModel(undefined).findAllByQuery({}, { page, take })
      const assetToCategory = new AssetToCategory(undefined)
      const categories = await assetToCategory.findAllByQuery({ assetId: { in: assets.map(asset => (asset.id)) } })
      for (const asset of assets) {
        asset.categories = categories.filter(category => (category.assetId === asset.id))
      }
      return await customReply(reply, 200, assets)
    } catch (error) {
      const e = handleError(error, errorKeys.QUERY_ERROR, this.get.name)
      return await customReply(reply, errorCode, e.message)
    }
  }

  public async indexOptions (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const description = {
      message: 'returns an array with all assets and categories',
      structure: [
        {
          id: 'number',
          name: 'string',
          extension: 'string',
          description: 'string',
          type: 'VIDEO | IMAGE | DOC',
          location: 'string',
          active: 'boolean',
          createdAt: 'Date',
          updatedAt: 'Date',
          deleted: 'boolean',
          categories: [
            {
              assetId: 'number',
              categoryId: 'number'
            }
          ]
        }
      ]
    }
    return await customReply(reply, 200, description)
  }

  public async delete (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    let errorCode = 400
    try {
      const assetId = parseInt((req.params as { id: string }).id)
      const asset = new AssetModel(undefined)
      await asset.findById(assetId)
      await asset.hardDelete(assetId)
      const assetToCategory = new AssetToCategory(undefined)
      const categories = await assetToCategory.findByQuery({ assetId })
      await assetToCategory.hardDeleteByQuery({ assetId }, true)
      asset.categories = categories
      return await customReply(reply, 200, asset)
    } catch (error) {
      if ((error as any).message === errorKeys.ENTITY_NOT_FOUND) {
        errorCode = 404
      }
      const e = handleError(error, errorKeys.QUERY_ERROR, this.get.name)
      return await customReply(reply, errorCode, e.message)
    }
  }
}
