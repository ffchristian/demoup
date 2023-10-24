import { PrismaClient } from '@prisma/client'
class PostgresDataConnector {
  public database: PrismaClient
  constructor () {
    this.database = new PrismaClient()
  }
}

const instance = new PostgresDataConnector()
Object.freeze(instance)
export const postgresDB = instance.database
