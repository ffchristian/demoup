import { populateObj } from '../../../utils'
import { postgresDB } from '../../data/postgres/postgresDataConnector'
import BaseModel from '../../data/postgres/baseModel'
// import { updateObjAtts } from './../../../utils'
import { handleError, errorKeys } from '../../../utils/errorManagement'
// import { HttpService } from '../../../utils/httpRequestService'

export interface IAssetToCategory {
  assetId?: number | undefined
  categoryId?: number | undefined
}
export interface ICategory {
  id?: number | undefined
  name?: string
  label?: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
  deleted?: boolean
}
// const categoryService = new HttpService(`${process.env.CATEGORY_MS_URL}`)
// const categoryServiceEndpoint = '/category'
export default class AssetToCategory extends BaseModel implements IAssetToCategory {
  assetId?: number | undefined
  categoryId?: number | undefined
  category: ICategory | undefined
  constructor (data: IAssetToCategory | undefined) {
    super(postgresDB.assetToCategory)
    populateObj(data, this)
  }

  async findById (assetId: number, categoryId: number): Promise<any> {
    const connection = await this.findFirstByQuery({ assetId, categoryId })
    // const category = await categoryService.get<ICategory>(`${categoryServiceEndpoint}/${categoryId}`)
    // if connection exists then the network call is done to get the category
    // and populated in the class
    // if not then return an error
    // populateObj({...connection, ...category.data}, this)
    populateObj(connection, this)
  }

  async findAllByQuery (query: any): Promise<any[]> {
    const categories = await this.findByQuery(query)
    // get the list of existing connected category ids
    // request all categories in a array of ids to make one only call
    // const categories = await categoryService.post<ICategory>(`${categoryServiceEndpoint}`, ids)
    // return all categories
    return categories as any
  }

  async save (): Promise<void> {
    try {
      const connection = await this.findById(this.assetId as number, this.categoryId as number)
      // for consistency I would look into the category service if the category exists
      // const category = await categoryService.get<ICategory>(`${categoryServiceEndpoint}/${categoryId}`)
      // and if it does not then I will roll back the asset I just created
      if (connection === undefined || connection === null) {
        const created = await this.create(this)
        populateObj(created, this)
      }
    } catch (error) {
      throw handleError(error, errorKeys.CREATE_ERROR, this.save.name)
    }
  }
}
