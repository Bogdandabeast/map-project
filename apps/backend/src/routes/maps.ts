import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { createMapHandler } from '../modules/maps/commands/create-map.handler'
import { updateMarkerHandler } from '../modules/maps/commands/update-marker.handler'
import { CreateMapSchema, GetMarkersBoundsSchema, UpdateMarkerSchema } from '../modules/maps/dtos/requests'
import { getMapByIdHandler } from '../modules/maps/queries/get-map-by-id.handler'
import { getMarkersInBoundsHandler } from '../modules/maps/queries/get-markers-in-bounds.handler'

const maps = new Hono()

maps.post('/', zValidator('json', CreateMapSchema), async (c) => {
  const data = c.req.valid('json')
  const result = await createMapHandler(data)
  return c.json(result, 201)
})

maps.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await getMapByIdHandler({ id })
  if (!result)
    return c.json({ error: 'Map not found' }, 404)
  return c.json(result)
})

maps.get('/:id/markers', zValidator('query', GetMarkersBoundsSchema), async (c) => {
  const mapId = c.req.param('id')
  const query = c.req.valid('query')

  const result = await getMarkersInBoundsHandler({
    mapId,
    bounds: {
      northEast: { lat: query.northEastLat, lng: query.northEastLng },
      southWest: { lat: query.southWestLat, lng: query.southWestLng },
    },
  })

  return c.json(result)
})

maps.patch('/markers/:id', zValidator('json', UpdateMarkerSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')

  const result = await updateMarkerHandler({ id, ...data })
  if (!result)
    return c.json({ error: 'Marker not found' }, 404)
  return c.json(result)
})

export default maps
