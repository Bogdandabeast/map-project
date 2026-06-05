import type { PlanRepository, Plan, GeoQuery } from './types';
import { getBoundingBox } from '../lib/geo';

/** Raw row shape returned by D1 queries (snake_case columns) */
interface PlanRow {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  user_id: string;
  created_at: string;
  distance?: number;
}

/** Map a D1 row to the Plan domain type. */
function mapRow(row: PlanRow): Plan {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

const HAVERSINE_SQL = `
  SELECT *, (
    6371 * acos(
      cos(radians(?1)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(?2)) +
      sin(radians(?3)) * sin(radians(latitude))
    )
  ) AS distance
  FROM plans
  WHERE latitude BETWEEN ?4 AND ?5
    AND longitude BETWEEN ?6 AND ?7
  HAVING distance < ?8
  ORDER BY distance
  LIMIT ?9
`;

export class D1PlanRepository implements PlanRepository {
  private db: D1Database;

  constructor(d1Binding: D1Database) {
    this.db = d1Binding;
  }

  async findByGeo(query: GeoQuery): Promise<Plan[]> {
    const { latMin, latMax, lngMin, lngMax } = getBoundingBox(
      query.latitude,
      query.longitude,
      query.radiusKm,
    );

    const limit = query.limit ?? 50;

    const results = await this.db
      .prepare(HAVERSINE_SQL)
      .bind(
        query.latitude,
        query.longitude,
        query.latitude,
        latMin,
        latMax,
        lngMin,
        lngMax,
        query.radiusKm,
        limit,
      )
      .all<PlanRow>();

    return (results.results ?? []).map(mapRow);
  }

  async create(plan: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO plans (id, title, description, latitude, longitude, user_id, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(
        id,
        plan.title,
        plan.description,
        plan.latitude,
        plan.longitude,
        plan.userId,
        createdAt,
      )
      .run();

    return {
      id,
      title: plan.title,
      description: plan.description,
      latitude: plan.latitude,
      longitude: plan.longitude,
      userId: plan.userId,
      createdAt,
    };
  }

  async findById(id: string): Promise<Plan | null> {
    const row = await this.db
      .prepare('SELECT * FROM plans WHERE id = ?1')
      .bind(id)
      .first<PlanRow>();

    return row ? mapRow(row) : null;
  }

  async findByUserId(userId: string): Promise<Plan[]> {
    const results = await this.db
      .prepare('SELECT * FROM plans WHERE user_id = ?1')
      .bind(userId)
      .all<PlanRow>();

    return (results.results ?? []).map(mapRow);
  }
}
