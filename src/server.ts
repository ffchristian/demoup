import * as os from 'os'
import { HealthCheckApi } from './app/api/HealthCheck'
import { AssetApi } from './app/api/Asset'
import { type IInitializable } from './infrastructure/IInitializable'
import { ApiFastifyServer } from './infrastructure/ApiFastifyServer'

// IInitializable is a generic interface to bind server
// this means this project can host different servers in different ports
export const servers: IInitializable[] = new Array<IInitializable>()
const apiPrefix = '/api'
// In this project /api is bound to fastify
// thus all controllers are here bound to the api to be served
// add here any controller needed to be served by the API
const apiFastifyServer = new ApiFastifyServer([
  new HealthCheckApi(apiPrefix),
  new AssetApi(apiPrefix)
])

servers.push(apiFastifyServer)

// as all server use the interface "IInitializable" all all threated as generic being able to be init with same code
// and the custom code goes into the implementation of the server
const initAll = async (server: IInitializable): Promise<void> => {
  console.log('%s initializing...', server.name)
  await server.Initialize()
  console.log('%s initialized!', server.name)
}
if (process.env.STOP_SERVER_STARTUP === undefined) {
  for (const server of servers) {
    initAll(server)
      .then(() => {
        console.log(`loaded server: ${server.name}`)
        console.log(`Debugging a TypeScript NodeJS@${process.version} API on ${os.hostname()} (${process.platform}/${process.arch})`)
      })
      .catch(error => {
        console.log(error)
      })
  }
}
