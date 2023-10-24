import { populateObj } from '../../../utils'
import { postgresDB } from '../../data/postgres/postgresDataConnector'
import BaseModel, { type IQueryOptions } from '../../data/postgres/baseModel'
// import { updateObjAtts } from './../../../utils'
import { handleError, errorKeys } from '../../../utils/errorManagement'

enum typeAsset {
  IMAGE,
  VIDEO,
  DOC
}
export interface IAsset {
  id?: number | undefined
  name: string
  extension: string
  description: string
  type?: typeAsset
  location?: string
  active?: boolean
  createdAt?: Date
  updatedAt?: Date
  deleted?: boolean
  categories?: any
  categoryId?: number | undefined
}

export default class Asset extends BaseModel implements IAsset {
  constructor (data: IAsset | undefined) {
    super(postgresDB.asset)
    populateObj(data, this)
  }

  id?: number | undefined
  name!: string
  extension!: string
  description!: string
  type!: typeAsset
  location!: string
  active?: boolean = true
  createdAt?: Date
  updatedAt?: Date
  deleted?: boolean = false
  categories?: any
  categoryId?: number | undefined

  async findById (id: number): Promise<void> {
    const asset = await this.findFirstByQuery({ id })
    if (asset === undefined || asset === null) throw new Error(errorKeys.ENTITY_NOT_FOUND)
    populateObj(asset, this)
  }

  async findAllByQuery (query: any, options: IQueryOptions): Promise<any[]> {
    const assets = await this.findByQuery(query, options)
    return assets as any
  }

  async save (): Promise<void> {
    try {
      const created = await this.create(this)
      populateObj(created, this)
    } catch (error) {
      throw handleError(error, errorKeys.CREATE_ERROR, this.save.name)
    }
  }
}
