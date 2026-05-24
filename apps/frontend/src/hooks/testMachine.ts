export type TestState = { type: 'IDLE' } | { type: 'ACTIVE' }
export type TestEvent = { type: 'ACTIVATE' } | { type: 'DEACTIVATE' }

export function testReducer(state: TestState, event: TestEvent): TestState {
  switch (state.type) {
    case 'IDLE':
      return event.type === 'ACTIVATE' ? { type: 'ACTIVE' } : state
    case 'ACTIVE':
      return event.type === 'DEACTIVATE' ? { type: 'IDLE' } : state
    default:
      return state
  }
}
