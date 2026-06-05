import { describe, expect, it, mock } from 'bun:test';
import { D1PlanRepository } from '../src/repositories/d1-plan-repository';
import type { Plan, GeoQuery } from '../src/repositories/types';

/**
 * Creates a minimal mock of D1Database with enough surface for the repository.
 */
function createMockD1Binding(
  overrides: {
    prepareResult?: unknown;
    allResult?: { results: unknown[] };
    firstResult?: unknown;
    runResult?: unknown;
  } = {},
) {
  const mockBinding = {
    prepare: mock(() => mockBinding),
    bind: mock(() => mockBinding),
    all: mock(() =>
      Promise.resolve(overrides.allResult ?? { results: [] }),
    ),
    first: mock(() =>
      Promise.resolve(overrides.firstResult ?? null),
    ),
    run: mock(() =>
      Promise.resolve(overrides.runResult ?? { success: true }),
    ),
    raw: mock(() =>
      Promise.resolve(overrides.allResult?.results ?? []),
    ),
    exec: mock(() => Promise.resolve(null)),
    batch: mock(() => Promise.resolve([])),
  };

  return mockBinding;
}

describe('D1PlanRepository', () => {
  describe('findByGeo', () => {
    it('should call D1 prepare with haversine SQL', async () => {
      const mockD1 = createMockD1Binding();

      const repo = new D1PlanRepository(mockD1 as any);
      const query: GeoQuery = {
        latitude: 40.4168,
        longitude: -3.7038,
        radiusKm: 5,
      };

      await repo.findByGeo(query);

      expect(mockD1.prepare).toHaveBeenCalled();
      const sqlArg = (mockD1.prepare as any).mock.calls[0][0] as string;
      expect(sqlArg).toInclude('acos');
      expect(sqlArg).toInclude('radians');
      expect(sqlArg).toInclude('BETWEEN');
    });

    it('should return an empty array when no results', async () => {
      const mockD1 = createMockD1Binding({
        allResult: { results: [] },
      });

      const repo = new D1PlanRepository(mockD1 as any);

      const result = await repo.findByGeo({
        latitude: 40.4168,
        longitude: -3.7038,
        radiusKm: 1,
      });

      expect(result).toEqual([]);
    });

    it('should return plan objects from D1 results', async () => {
      const mockPlan = {
        id: 'plan-1',
        title: 'Madrid Tour',
        description: 'Tour',
        latitude: 40.417,
        longitude: -3.704,
        user_id: 'user-1',
        created_at: '2025-06-01T12:00:00Z',
        distance: 0.1,
      };

      const mockD1 = createMockD1Binding({
        allResult: { results: [mockPlan] },
      });

      const repo = new D1PlanRepository(mockD1 as any);

      const result = await repo.findByGeo({
        latitude: 40.4168,
        longitude: -3.7038,
        radiusKm: 5,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'plan-1');
      expect(result[0]).toHaveProperty('title', 'Madrid Tour');
      expect(result[0]).toHaveProperty('latitude');
      expect(result[0]).toHaveProperty('longitude');
      expect(result[0]).toHaveProperty('userId');
    });

    it('should apply limit from GeoQuery', async () => {
      const mockD1 = createMockD1Binding();

      const repo = new D1PlanRepository(mockD1 as any);

      await repo.findByGeo({
        latitude: 40.4168,
        longitude: -3.7038,
        radiusKm: 5,
        limit: 3,
      });

      // Verify bind was called — limit is passed as a bind parameter
      expect(mockD1.bind).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should insert a new plan and return it', async () => {
      const mockD1 = createMockD1Binding({
        runResult: { success: true },
      });

      const repo = new D1PlanRepository(mockD1 as any);

      const plan = await repo.create({
        title: 'New Plan',
        description: 'A new plan',
        latitude: 40.0,
        longitude: -3.0,
        userId: 'user-1',
      });

      expect(plan).toHaveProperty('id');
      expect(typeof plan.id).toBe('string');
      expect(plan.title).toBe('New Plan');
      expect(plan.latitude).toBe(40.0);
      expect(plan.userId).toBe('user-1');
      expect(plan).toHaveProperty('createdAt');
    });
  });

  describe('findById', () => {
    it('should return a plan when found', async () => {
      const mockPlan = {
        id: 'plan-1',
        title: 'Found Plan',
        description: 'Desc',
        latitude: 40.0,
        longitude: -3.0,
        user_id: 'user-1',
        created_at: '2025-06-01T12:00:00Z',
      };

      const mockD1 = createMockD1Binding({
        firstResult: mockPlan,
      });

      const repo = new D1PlanRepository(mockD1 as any);
      const result = await repo.findById('plan-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('plan-1');
      expect(result!.title).toBe('Found Plan');
    });

    it('should return null when not found', async () => {
      const mockD1 = createMockD1Binding({
        firstResult: null,
      });

      const repo = new D1PlanRepository(mockD1 as any);
      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return plans for a user', async () => {
      const mockPlans = [
        {
          id: 'plan-1',
          title: 'Plan A',
          description: '',
          latitude: 40.0,
          longitude: -3.0,
          user_id: 'user-1',
          created_at: '2025-06-01T12:00:00Z',
        },
        {
          id: 'plan-2',
          title: 'Plan B',
          description: '',
          latitude: 41.0,
          longitude: -4.0,
          user_id: 'user-1',
          created_at: '2025-06-02T12:00:00Z',
        },
      ];

      const mockD1 = createMockD1Binding({
        allResult: { results: mockPlans },
      });

      const repo = new D1PlanRepository(mockD1 as any);
      const result = await repo.findByUserId('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user-1');
      expect(result[1].userId).toBe('user-1');
    });

    it('should return empty array when user has no plans', async () => {
      const mockD1 = createMockD1Binding({
        allResult: { results: [] },
      });

      const repo = new D1PlanRepository(mockD1 as any);
      const result = await repo.findByUserId('user-none');

      expect(result).toEqual([]);
    });
  });
});
