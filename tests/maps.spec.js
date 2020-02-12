const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')
const request = supertest(app)
const Maps = mongoose.model('maps')

describe('maps API', () => {
  afterEach(async () => {
    await Maps.deleteMany({}, () => {})
  })

  afterAll(() => {
    mongoose.connection.close()
  })

  describe('GET /api/maps', () => {
    it('should return an empty array if no maps', async () => {
      const response = await request.get('/api/maps')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('should return an array containing a map', async () => {
      Maps.create({ name: 'testMap1', data: [[0, 0], [0, 0]] })
      const response = await request.get('/api/maps')

      expect(response.status).toBe(200)
      expect(response.body.length).toBe(1)
      expect(response.body[0].name).toBe('testMap1')
      expect(response.body[0].data).toEqual([[0, 0], [0, 0]])
    })

    it('should return an array of multiple maps', async () => {
      Maps.create({ name: 'testMap1', data: [[0, 0], [0, 1]] })
      Maps.create({ name: 'testMap2', data: [[0, 0], [1, 0]] })
      const response = await request.get('/api/maps')

      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
      expect(response.body[1].name).toBe('testMap2')
      expect(response.body[1].data).toEqual([[0, 0], [1, 0]])
    })
  })

  describe('POST /api/maps', () => {
    it('should add a map to the database', async () => {
      const data = {
        name: 'postTestMap',
        data: [[0, 0], [1, 1]]
      }
      const response = await request.post('/api/maps').send(data)

      expect(response.status).toBe(201)
      expect(response.body.error).toBe(false)
      expect(response.body.map.name).toBe('postTestMap')
      expect(response.body.map.data).toEqual([[0, 0], [1, 1]])
      expect(response.body.map._id).toBeDefined()

      const maps = await Maps.find()
      expect(maps.length).toBe(1)
    })
  })
})
