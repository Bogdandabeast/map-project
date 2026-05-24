import type { MapController } from '../controller/MapController'

export type MapInitState
  = | { type: 'UNINITIALIZED' }
    | { type: 'LOADING_ASSETS' }
    | { type: 'INSTANTIATING' }
    | { type: 'READY', controller: MapController }
    | { type: 'ERROR', error: string }

export type MapInitEvent
  = | { type: 'START_INIT' }
    | { type: 'ASSETS_LOADED' }
    | { type: 'CONTROLLER_READY', controller: MapController }
    | { type: 'INIT_FAILED', error: string }

export function mapInitReducer(state: MapInitState, event: MapInitEvent): MapInitState {
  if (event.type === 'INIT_FAILED') {
    return { type: 'ERROR', error: event.error }
  }

  switch (state.type) {
    case 'UNINITIALIZED':
      if (event.type === 'START_INIT') {
        return { type: 'LOADING_ASSETS' }
      }
      return state

    case 'LOADING_ASSETS':
      if (event.type === 'ASSETS_LOADED') {
        return { type: 'INSTANTIATING' }
      }
      return state

    case 'INSTANTIATING':
      if (event.type === 'CONTROLLER_READY') {
        return { type: 'READY', controller: event.controller }
      }
      return state

    case 'READY':
      return state

    case 'ERROR':
      return state

    default:
      return state
  }
}

export const mapInitMachine = {
  initialState: { type: 'UNINITIALIZED' } as MapInitState,
  reducer: mapInitReducer,
}
