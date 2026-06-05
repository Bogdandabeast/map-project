import { describe, expect, it } from 'bun:test';

// Runtime import — will fail if module doesn't exist
import { REPOSITORY_TYPES_VERSION } from '../src/repositories/types';
import type { Plan, PlanRepository, GeoQuery } from '../src/repositories/types';

describe('Module exists', () => {
  it('should export a version constant at runtime', () => {
    expect(REPOSITORY_TYPES_VERSION).toBe('1.0.0');
  });
});

describe('GeoQuery type', () => {
  it('should accept a valid GeoQuery with all fields including optional limit', () => {
    const query: GeoQuery = {
      latitude: 40.4168,
      longitude: -3.7038,
      radiusKm: 5,
      limit: 10,
    };

    expect(query.latitude).toBe(40.4168);
    expect(query.longitude).toBe(-3.7038);
    expect(query.radiusKm).toBe(5);
    expect(query.limit).toBe(10);
  });

  it('should accept a GeoQuery without the optional limit field', () => {
    const query: GeoQuery = {
      latitude: 40.4168,
      longitude: -3.7038,
      radiusKm: 5,
    };

    expect(query.limit).toBeUndefined();
    expect(query.radiusKm).toBe(5);
  });
});

describe('Plan type', () => {
  it('should have expected shape for a plan object', () => {
    const plan: Plan = {
      id: 'plan-123',
      title: 'Madrid City Tour',
      description: 'A walking tour through central Madrid',
      latitude: 40.4168,
      longitude: -3.7038,
      userId: 'user-456',
      createdAt: '2025-06-01T12:00:00Z',
    };

    expect(plan.id).toBe('plan-123');
    expect(plan.title).toBe('Madrid City Tour');
    expect(plan.latitude).toBe(40.4168);
    expect(plan.longitude).toBe(-3.7038);
    expect(plan.userId).toBe('user-456');
  });
});

describe('PlanRepository interface', () => {
  it('should be implementable with all required methods', () => {
    const mockRepo: PlanRepository = {
      findByGeo(_query: GeoQuery): Promise<Plan[]> {
        return Promise.resolve([]);
      },
      create(_plan: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
        return Promise.resolve({
          id: 'new-1',
          title: 'New Plan',
          description: '',
          latitude: 0,
          longitude: 0,
          userId: 'u1',
          createdAt: new Date().toISOString(),
        });
      },
      findById(_id: string): Promise<Plan | null> {
        return Promise.resolve(null);
      },
      findByUserId(_userId: string): Promise<Plan[]> {
        return Promise.resolve([]);
      },
    };

    expect(mockRepo).toBeDefined();
    expect(typeof mockRepo.findByGeo).toBe('function');
    expect(typeof mockRepo.create).toBe('function');
    expect(typeof mockRepo.findById).toBe('function');
    expect(typeof mockRepo.findByUserId).toBe('function');
  });

  it('should accept a GeoQuery object in findByGeo', async () => {
    const results: Plan[] = [];
    const mockRepo: PlanRepository = {
      findByGeo: (_q) => Promise.resolve(results),
      create: (_p) => Promise.resolve(results[0] ?? {} as Plan),
      findById: (_id) => Promise.resolve(null),
      findByUserId: (_uid) => Promise.resolve([]),
    };

    const result = await mockRepo.findByGeo({
      latitude: 40.4168,
      longitude: -3.7038,
      radiusKm: 5,
    });

    expect(result).toBe(results);
  });
});
