import { z } from 'zod'

export const CreateMapBoundsSchema = z.object({
  northEast: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  southWest: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
}).refine(
  b => b.northEast.lat >= b.southWest.lat && b.northEast.lng >= b.southWest.lng,
  { message: 'northEast must be north-east of southWest' },
)

export const CreateMapSchema = z.object({
  name: z.string().min(1, 'Map name is required'),
  bounds: CreateMapBoundsSchema,
})

export type CreateMapRequest = z.infer<typeof CreateMapSchema>

export const UpdateMarkerSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type UpdateMarkerRequest = z.infer<typeof UpdateMarkerSchema>

export const GetMarkersBoundsSchema = z.object({
  northEastLat: z.coerce.number().min(-90).max(90),
  northEastLng: z.coerce.number().min(-180).max(180),
  southWestLat: z.coerce.number().min(-90).max(90),
  southWestLng: z.coerce.number().min(-180).max(180),
}).refine(
  b => b.northEastLat >= b.southWestLat && b.northEastLng >= b.southWestLng,
  { message: 'northEast must be north-east of southWest' },
)

export type GetMarkersBoundsRequest = z.infer<typeof GetMarkersBoundsSchema>
