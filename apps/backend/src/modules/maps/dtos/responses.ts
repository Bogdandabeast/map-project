export interface MapDTO {
  id: string
  name: string
  bounds: {
    northEast: { lat: number, lng: number }
    southWest: { lat: number, lng: number }
  }
}

export interface MarkerDTO {
  id: string
  mapId: string
  name: string | null
  lat: number
  lng: number
}
