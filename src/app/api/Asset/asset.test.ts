import request from 'supertest'
import { type FastifyInstance } from 'fastify/types/instance'
import { servers } from '../../../server'
process.env.POSTGRES_URL = 'postgresql://postgres:changeme@localhost:5432/demoUp?schema=asset_schema'

let fastifyInstance: FastifyInstance
beforeAll(async () => {
  await servers[0].Initialize()
  fastifyInstance = (servers[0] as any).fastifyServer
})

describe('Asset CRUD operations', () => {
  const endpoint = '/asset'
  const payload = {
    id: undefined,
    name: 'DEMO_ASSET',
    extension: '.mpeg',
    type: 'VIDEO',
    description: 'this is a description',
    location: 'true',
    categoryId: 4
  }
  it('should create an Asset', async () => {
    const response = await request(fastifyInstance.server)
      .post(`/api${endpoint}`)
      .send(payload)
    const responseData: any = JSON.parse(response.text)
    payload.id = responseData.id
    expect(response.status).toBe(201)
    expect(responseData.name).toBe(payload.name)
    expect(responseData.extension).toBe(payload.extension)
    expect(responseData.description).toBe(payload.description)
    expect(responseData.location).toBe(payload.location)
    expect(responseData.categoryId).toBe(payload.categoryId)
    expect(responseData.id).not.toBe(undefined)
  })
  it('should be able to get the asset by id', async () => {
    const response = await request(fastifyInstance.server).get(`/api${endpoint}/${payload.id}}`)
    const responseData: any = JSON.parse(response.text)
    expect(response.status).toBe(200)
    expect(responseData.name).toBe(payload.name)
    expect(responseData.extension).toBe(payload.extension)
    expect(responseData.description).toBe(payload.description)
    expect(responseData.location).toBe(payload.location)
    expect(responseData.id).not.toBe(undefined)
    expect(responseData.categories.length).toBeGreaterThanOrEqual(1)
    for (const category of responseData.categories) {
      expect(category.assetId).toBe(payload.id)
      expect(category.categoryId).toBe(payload.categoryId)
    }
  })
  it('should return 404 if the asset does not exist', async () => {
    const response = await request(fastifyInstance.server).get(`/api${endpoint}/12345321}`)
    expect(response.status).toBe(404)
  })
  it('should be able to delete the asset by id', async () => {
    const response = await request(fastifyInstance.server).delete(`/api${endpoint}/${payload.id}}`)
    const responseData: any = JSON.parse(response.text)
    expect(response.status).toBe(200)
    expect(responseData.name).toBe(payload.name)
    expect(responseData.extension).toBe(payload.extension)
    expect(responseData.description).toBe(payload.description)
    expect(responseData.location).toBe(payload.location)
    expect(responseData.id).not.toBe(undefined)
    expect(responseData.categories.length).toBeGreaterThanOrEqual(1)
    for (const category of responseData.categories) {
      expect(category.assetId).toBe(payload.id)
      expect(category.categoryId).toBe(payload.categoryId)
    }
  })
})

afterAll(async () => {
  await fastifyInstance.close()
})
