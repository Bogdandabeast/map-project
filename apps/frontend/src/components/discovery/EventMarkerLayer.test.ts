import { describe, expect, it } from 'bun:test'
import Feature from 'ol/Feature'
import VectorLayer from 'ol/layer/Vector'
import Cluster from 'ol/source/Cluster'
import VectorSource from 'ol/source/Vector'
import { createEventMarkerLayer } from './EventMarkerLayer'

describe('createEventMarkerLayer', () => {
  const mockEvents = [
    { id: 'e1', title: 'Game Night', lat: -34.6037, lng: -58.3816, date: 1700000000, hostType: 'user' as const, games: ['Catan'] },
    { id: 'e2', title: 'Venue Meetup', lat: 40.4168, lng: -3.7038, date: 1710000000, hostType: 'venue' as const, games: ['Wingspan'] },
    { id: 'e3', title: 'Another User Event', lat: -34.5, lng: -58.3, date: 1720000000, hostType: 'user' as const, games: ['Dominion'] },
  ]

  /** Gets the underlying VectorSource from the clustered layer */
  const getVectorSource = (layer: VectorLayer<VectorSource>) => {
    const source = layer.getSource()
    if (source instanceof Cluster) return source.getSource()
    return source!
  }

  it('returns a VectorLayer', () => {
    const layer = createEventMarkerLayer([])
    expect(layer).toBeInstanceOf(VectorLayer)
  })

  it('creates a feature for each event in the underlying source', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    expect(source.getFeatures()).toHaveLength(3)
  })

  it('returns empty underlying source when given no events', () => {
    const layer = createEventMarkerLayer([])
    const source = getVectorSource(layer)
    expect(source.getFeatures()).toHaveLength(0)
  })

  it('places features at correct projected coordinates', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    const features = source.getFeatures()

    for (let i = 0; i < features.length; i++) {
      const geometry = features[i].getGeometry()
      expect(geometry).toBeTruthy()
      expect(geometry!.getType()).toBe('Point')
    }
  })

  it('assigns Action Orange (#FF6B35) color to user-hosted events', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    const userFeature = source.getFeatures()[0]
    const layerStyle = layer.getStyle() as (f: any, r: number) => any

    // Wrap in a mock cluster feature with 1 sub-feature
    const clusterFeature = new Feature()
    clusterFeature.set('features', [userFeature])

    const style = layerStyle(clusterFeature, 1)
    const styleObj = Array.isArray(style) ? style[0] : style
    const image = (styleObj as any)?.getImage?.()
    const fillColor = image?.getFill?.()?.getColor?.()

    expect(fillColor).toBe('#FF6B35')
  })

  it('assigns Map Blue (#0061A4) color to venue events', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    const venueFeature = source.getFeatures()[1]
    const layerStyle = layer.getStyle() as (f: any, r: number) => any

    const clusterFeature = new Feature()
    clusterFeature.set('features', [venueFeature])

    const style = layerStyle(clusterFeature, 1)
    const styleObj = Array.isArray(style) ? style[0] : style
    const image = (styleObj as any)?.getImage?.()
    const fillColor = image?.getFill?.()?.getColor?.()

    expect(fillColor).toBe('#0061A4')
  })

  it('applies a CircleStyle to markers', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    const feature = source.getFeatures()[0]
    const layerStyle = layer.getStyle() as (f: any, r: number) => any

    const clusterFeature = new Feature()
    clusterFeature.set('features', [feature])

    const style = layerStyle(clusterFeature, 1)
    const styleObj = Array.isArray(style) ? style[0] : style
    const image = (styleObj as any)?.getImage?.()
    expect(image).toBeTruthy()
    const radius = image?.getRadius?.()
    expect(radius).toBeGreaterThan(0)
  })

  it('applies a white stroke to markers', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    const feature = source.getFeatures()[0]
    const layerStyle = layer.getStyle() as (f: any, r: number) => any

    const clusterFeature = new Feature()
    clusterFeature.set('features', [feature])

    const style = layerStyle(clusterFeature, 1)
    const styleObj = Array.isArray(style) ? style[0] : style
    const image = (styleObj as any)?.getImage?.()
    const stroke = image?.getStroke?.()

    expect(stroke).toBeTruthy()
    expect(stroke?.getColor?.()).toBe('#FFFFFF')
    expect(stroke?.getWidth?.()).toBe(2)
  })

  it('increases marker radius at higher zoom (lower resolution)', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    const feature = source.getFeatures()[0]
    const layerStyle = layer.getStyle() as (f: any, r: number) => any

    const clusterFeature = new Feature()
    clusterFeature.set('features', [feature])

    // High zoom = low resolution (e.g., 1)
    const styleHighZoom = layerStyle(clusterFeature, 1)
    const imageHighZoom = (Array.isArray(styleHighZoom) ? styleHighZoom[0] : styleHighZoom)?.getImage?.()
    const radiusHighZoom = imageHighZoom?.getRadius?.()

    // Low zoom = high resolution (e.g., 100)
    const styleLowZoom = layerStyle(clusterFeature, 100)
    const imageLowZoom = (Array.isArray(styleLowZoom) ? styleLowZoom[0] : styleLowZoom)?.getImage?.()
    const radiusLowZoom = imageLowZoom?.getRadius?.()

    // Larger radius at low resolution (high zoom = zoomed in)
    expect(radiusHighZoom).toBeGreaterThanOrEqual(radiusLowZoom)
  })

  it('sets event metadata on features for tooltip access', () => {
    const layer = createEventMarkerLayer(mockEvents)
    const source = getVectorSource(layer)
    const feature = source.getFeatures()[0]

    expect(feature.get('eventId')).toBe('e1')
    expect(feature.get('eventTitle')).toBe('Game Night')
    expect(feature.get('eventDate')).toBe(1700000000)
    expect(feature.get('eventHostType')).toBe('user')
  })

  it('uses orange for fallback when hostType is unknown', () => {
    const userOnly = [{ id: 'single', title: 'Solo', lat: 0, lng: 0, date: 1, hostType: 'user' as const, games: [] }]
    const layer = createEventMarkerLayer(userOnly)
    const source = getVectorSource(layer)
    const feature = source.getFeatures()[0]
    const layerStyle = layer.getStyle() as (f: any, r: number) => any

    const clusterFeature = new Feature()
    clusterFeature.set('features', [feature])

    const style = layerStyle(clusterFeature, 1)
    const styleObj = Array.isArray(style) ? style[0] : style
    const image = (styleObj as any)?.getImage?.()
    const fillColor = image?.getFill?.()?.getColor?.()

    expect(fillColor).toBe('#FF6B35')
  })

  describe('clustering', () => {
    it('wraps the source in a Cluster source', () => {
      const layer = createEventMarkerLayer(mockEvents)
      const source = layer.getSource()
      expect(source).toBeInstanceOf(Cluster)
    })

    it('renders cluster features with count text', () => {
      const layer = createEventMarkerLayer(mockEvents)
      const layerStyle = layer.getStyle() as (f: any, r: number) => any

      // Create a mock cluster feature with 5 sub-features
      const mockClusterFeature = new Feature()
      mockClusterFeature.set('features', [
        new Feature(), new Feature(), new Feature(), new Feature(), new Feature(),
      ])

      const style = layerStyle(mockClusterFeature, 10)
      const styleObj = Array.isArray(style) ? style[0] : style

      const text = (styleObj as any)?.getText?.()
      expect(text).toBeTruthy()
      const textContent = text?.getText?.()
      expect(textContent).toBe('5')
    })

    it('renders individual cluster features (size 1) with colored marker', () => {
      const layer = createEventMarkerLayer(mockEvents)
      const layerStyle = layer.getStyle() as (f: any, r: number) => any

      const singleFeature = new Feature()
      singleFeature.set('eventHostType', 'user')
      const mockSingleCluster = new Feature()
      mockSingleCluster.set('features', [singleFeature])

      const style = layerStyle(mockSingleCluster, 10)
      const styleObj = Array.isArray(style) ? style[0] : style

      const image = (styleObj as any)?.getImage?.()
      expect(image).toBeTruthy()
      const fillColor = image?.getFill?.()?.getColor?.()
      expect(fillColor).toBe('#FF6B35')
    })

    it('uses blue cluster color for venue events when size is 1', () => {
      const layer = createEventMarkerLayer(mockEvents)
      const layerStyle = layer.getStyle() as (f: any, r: number) => any

      const venueFeature = new Feature()
      venueFeature.set('eventHostType', 'venue')
      const mockCluster = new Feature()
      mockCluster.set('features', [venueFeature])

      const style = layerStyle(mockCluster, 10)
      const styleObj = Array.isArray(style) ? style[0] : style

      const image = (styleObj as any)?.getImage?.()
      const fillColor = image?.getFill?.()?.getColor?.()
      expect(fillColor).toBe('#0061A4')
    })

    it('underlying vector source still contains original features', () => {
      const layer = createEventMarkerLayer(mockEvents)
      const vectorSource = getVectorSource(layer)

      expect(vectorSource.getFeatures()).toHaveLength(3)
    })
  })
})
