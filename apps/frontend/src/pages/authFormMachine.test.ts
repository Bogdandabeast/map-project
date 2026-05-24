import { describe, it, expect } from 'vitest';
import { authFormReducer, authFormInitialState, AuthFormState, AuthFormEvent } from './authFormMachine';

describe('authFormReducer', () => {
  it('should transition from IDLE to VALIDATING on SUBMIT', () => {
    const state: AuthFormState = authFormInitialState;
    const event: AuthFormEvent = { type: 'SUBMIT' };
    const nextState = authFormReducer(state, event);
    expect(nextState).toEqual({ type: 'VALIDATING' });
  });

  it('should transition from VALIDATING to SUBMITTING on VALIDATION_PASSED', () => {
    const state: AuthFormState = { type: 'VALIDATING' };
    const event: AuthFormEvent = { type: 'VALIDATION_PASSED' };
    const nextState = authFormReducer(state, event);
    expect(nextState).toEqual({ type: 'SUBMITTING' });
  });

  it('should transition from VALIDATING to ERROR on VALIDATION_FAILED', () => {
    const state: AuthFormState = { type: 'VALIDATING' };
    const errors = { email: ['Invalid email'] };
    const event: AuthFormEvent = { type: 'VALIDATION_FAILED', errors };
    const nextState = authFormReducer(state, event);
    expect(nextState).toEqual({ type: 'ERROR', errors });
  });

  it('should transition from SUBMITTING to SUCCESS on API_SUCCESS', () => {
    const state: AuthFormState = { type: 'SUBMITTING' };
    const event: AuthFormEvent = { type: 'API_SUCCESS' };
    const nextState = authFormReducer(state, event);
    expect(nextState).toEqual({ type: 'SUCCESS' });
  });

  it('should transition from SUBMITTING to ERROR on API_FAILED', () => {
    const state: AuthFormState = { type: 'SUBMITTING' };
    const error = 'Invalid credentials';
    const event: AuthFormEvent = { type: 'API_FAILED', error };
    const nextState = authFormReducer(state, event);
    expect(nextState).toEqual({ type: 'ERROR', errors: {}, apiError: error });
  });

  it('should transition from ERROR to IDLE on RESET', () => {
    const state: AuthFormState = { type: 'ERROR', errors: { email: ['Err'] }, apiError: 'ApiErr' };
    const event: AuthFormEvent = { type: 'RESET' };
    const nextState = authFormReducer(state, event);
    expect(nextState).toEqual(authFormInitialState);
  });

  it('should transition from SUCCESS to IDLE on RESET', () => {
    const state: AuthFormState = { type: 'SUCCESS' };
    const event: AuthFormEvent = { type: 'RESET' };
    const nextState = authFormReducer(state, event);
    expect(nextState).toEqual(authFormInitialState);
  });

  it('should ignore SUBMIT if not in IDLE state', () => {
    const states: AuthFormState[] = [
      { type: 'VALIDATING' },
      { type: 'SUBMITTING' },
      { type: 'SUCCESS' },
      { type: 'ERROR', errors: {} },
    ];
    const event: AuthFormEvent = { type: 'SUBMIT' };
    
    states.forEach(state => {
      expect(authFormReducer(state, event)).toEqual(state);
    });
  });
});
