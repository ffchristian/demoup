import { type IInitializable } from './IInitializable'
import Fastify from 'fastify'
import compress from '@fastify/compress'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import middie from '@fastify/middie'
// import multipart from "@fastify/multipart";
import { type IApiController } from '../app/api/IApiController'
import { type FastifyReply } from 'fastify/types/reply'
export class ApiFastifyServer implements IInitializable {
  public name: string = 'ApiFastifyServer'
  public fastifyServer = Fastify()

  constructor (public apiControllers: IApiController[]) {

  }

  async Initialize (): Promise<any> {
    await this.fastifyServer.register(helmet)
    await this.fastifyServer.register(compress)
    await this.fastifyServer.register(middie)
    // file upload handler
    // await this.fastifyServer.register(multipart, {
    //   throwFileSizeLimit: false,
    //   limits: {
    //     fileSize: 104857600
    //   }
    // });
    await this.fastifyServer.register(cors, {
      // TODO: remove * once the domain is defined
      origin: ['*', /^https?:\/\/domain.com(:[\d]+)?$/],
      allowedHeaders: [
        'Content-Type', // Allows the client to specify the content type of the data being sent
        'Authorization', // For passing authentication information
        'X-Requested-With', // Commonly used to identify Ajax requests
        'Accept', // Used to specify certain media types which are acceptable for the response
        'Origin', // Indicates the origin of the cross-site access request or preflight request
        'User-Agent', // Provides information about the user agent (browser) making the request
        'DNT', // Do Not Track header, user’s tracking preference
        'Access-Control-Request-Method', // Used when issuing a preflight request to let the server know what HTTP method will be used when the actual request is made
        'Access-Control-Request-Headers', // Used when issuing a preflight request to let the server know what HTTP headers will be used when the actual request is made
        'Cache-Control', // Directives for caching mechanisms in both requests and responses
        'Expires' // Gives the date/time after which the response is considered stale
      ]
    })
    // TODO: connecting to an authenticator microservice
    // await this.fastifyServer.use((req, res, next) => {
    //   // const errorCode = 500
    //   // JWTAuthChecker(req.headers.authorization ?? '')
    //   //   .then(loginData => {
    //   //     (req as any).loginData = loginData
    //   //     next()
    //   //   })
    //   //   .catch(error => {
    //   //     res.statusCode = errorCode
    //   //     return res.end(handleError(error, errorKeys.AUTH_ERROR))
    //   //   })
    // })

    this.apiControllers.forEach((apiController) => {
      if (this.fastifyServer !== undefined) {
        apiController.register(this.fastifyServer)
      }
    })

    try {
      await this.fastifyServer.listen({ host: '0.0.0.0', port: parseInt(process.env.API_PORT ?? '3000') })
      const address = this.fastifyServer.server.address()
      console.log(`🚀 Server ready at ${JSON.stringify(address)}`)
    } catch (err) {
      this.fastifyServer.log.error(err)
      process.exit(1)
    }
  }
}

export const customReply = async (reply: FastifyReply, code: number, payload: any): Promise<FastifyReply> => {
  return await reply
    .header('Content-Type', 'application/json')
    .code(code)
    .send(typeof payload === 'string' ? payload : JSON.stringify(payload))
}
