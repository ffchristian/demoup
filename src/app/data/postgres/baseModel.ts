import { handleError, errorKeys } from '../../../utils/errorManagement'

export interface IQueryOptions {
  skip?: number
  take?: number
  page?: number
  filterBy?: string[]
  filter?: string
  sortBy?: string
  sortOrder?: string
  include?: any
  select?: any
}
let postgresDBModel: any
export default class BaseModel {
  constructor (postgresDB: any) {
    postgresDBModel = postgresDB
  }

  public async findFirstByQuery (query: any = {}, { include, orderBy }: { include?: any, orderBy?: any } = {}): Promise<Record<string, unknown>> {
    try {
      const data = await postgresDBModel.findFirst({ where: { ...query }, include, orderBy })
      return data
    } catch (error) {
      throw handleError(error, errorKeys.QUERY_ERROR, this.findFirstByQuery.name)
    }
  }

  public async create (data: any, include?: any): Promise<Record<string, unknown>> {
    try {
      const created = await postgresDBModel.create({ data, include })
      return created
    } catch (error) {
      throw handleError(error, errorKeys.CREATE_ERROR, this.create.name)
    }
  }

  public async findByQuery (query: any = {}, { skip, take, page, filterBy, filter, sortBy, sortOrder, include, select }: IQueryOptions = {}): Promise<Array<Record<string, unknown>>> {
    try {
      const filterQuery: any[] = []
      // Array with a combination of conditions (according to the field) for filtering
      filterBy?.forEach((field) => {
        filterQuery.push({ [field]: { contains: filter, mode: 'insensitive' } })
      })
      // Query with pagination
      if (page !== undefined && take !== undefined) {
        skip = (page - 1) * take
        // Pagination, filtering and sorting
        query = (filterBy !== undefined && sortBy !== undefined)
          ? { skip, take, where: Object.assign(query, { OR: filterQuery }), select, include, orderBy: { [sortBy]: sortOrder } }
        // Pagination and filtering
          : (filterBy !== undefined)
              ? { skip, take, where: Object.assign(query, { OR: filterQuery }), select, include }
              // Pagination and sorting
              : (sortBy !== undefined)
                  ? { skip, take, where: query, select, include, orderBy: { [sortBy]: sortOrder } }
                // Simple pagination
                  : { skip, take, where: query, select, include }
      } else {
        // Query without pagination
        query = (sortBy !== undefined && sortOrder !== undefined)
          ? { where: query, select, include, orderBy: { [sortBy]: sortOrder } }
          : { where: query, select, include }
      }
      const instance = await postgresDBModel.findMany(query)
      if (instance === undefined || instance === null) {
        throw new Error(errorKeys.ENTITY_NOT_FOUND)
      }
      return instance
    } catch (error) {
      throw handleError(error, errorKeys.QUERY_ERROR, this.findByQuery.name)
    }
  }

  public async hardDelete (id: number): Promise<any> {
    try {
      const entityModel = await postgresDBModel.delete({ where: { id } })
      return entityModel
    } catch (error) {
      throw handleError(error, errorKeys.DELETE_ERROR, this.hardDelete.name)
    }
  }

  public async hardDeleteByQuery (query: any, many: boolean = false): Promise<any | any[]> {
    try {
      if (many) {
        const entities = await postgresDBModel.deleteMany({ where: query })
        return entities
      }
      const entityModel = await postgresDBModel.delete({ where: query })
      return entityModel
    } catch (error) {
      throw handleError(error, errorKeys.DELETE_ERROR, this.hardDelete.name)
    }
  }
}
