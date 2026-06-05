import { describe, expect, it } from 'bun:test';
import * as phrases from './index';

describe('HTTP status phrases', () => {
  it('should export OK phrase', () => {
    expect(phrases.OK).toBe('OK');
  });

  it('should export CREATED phrase', () => {
    expect(phrases.CREATED).toBe('Created');
  });

  it('should export BAD_REQUEST phrase', () => {
    expect(phrases.BAD_REQUEST).toBe('Bad Request');
  });

  it('should export UNAUTHORIZED phrase', () => {
    expect(phrases.UNAUTHORIZED).toBe('Unauthorized');
  });

  it('should export FORBIDDEN phrase', () => {
    expect(phrases.FORBIDDEN).toBe('Forbidden');
  });

  it('should export NOT_FOUND phrase', () => {
    expect(phrases.NOT_FOUND).toBe('Not Found');
  });

  it('should export INTERNAL_SERVER_ERROR phrase', () => {
    expect(phrases.INTERNAL_SERVER_ERROR).toBe('Internal Server Error');
  });

  it('should export all common HTTP status phrases', () => {
    expect(phrases.METHOD_NOT_ALLOWED).toBe('Method Not Allowed');
    expect(phrases.CONFLICT).toBe('Conflict');
    expect(phrases.UNPROCESSABLE_ENTITY).toBe('Unprocessable Entity');
  });

  it('should have distinct values for different statuses', () => {
    expect(phrases.OK).not.toBe(phrases.NOT_FOUND);
    expect(phrases.UNAUTHORIZED).not.toBe(phrases.FORBIDDEN);
    expect(phrases.BAD_REQUEST).not.toBe(phrases.INTERNAL_SERVER_ERROR);
  });
});
