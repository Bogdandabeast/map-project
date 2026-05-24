import { useReducer } from 'react'

export interface MachineConfig<S, E> {
  initialState: S
  reducer: (state: S, event: E) => S
}

export function useMachine<S, E>(config: MachineConfig<S, E>): [S, (event: E) => void] {
  const [state, dispatch] = useReducer(config.reducer, config.initialState)

  return [state, dispatch]
}
