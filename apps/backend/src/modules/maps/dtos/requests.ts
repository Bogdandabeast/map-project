import { z } from 'zod'

export const CreateMapSchema = z.object({
  name: z.string().min(1, 'Map name is required'),
  bounds: z.object({
    northEast: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    southWest: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
})

export type CreateMapRequest = z.infer<typeof CreateMapSchema>

export const UpdateMarkerSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export type UpdateMarkerRequest = z.infer<typeof UpdateMarkerSchema>

export const GetMarkersBoundsSchema = z.object({
  northEastLat: z.coerce.number(),
  northEastLng: z.coerce.number(),
  southWestLat: z.coerce.number(),
  southWestLng: z.coerce.number(),
})

export type GetMarkersBoundsRequest = z.infer<typeof GetMarkersBoundsSchema>
