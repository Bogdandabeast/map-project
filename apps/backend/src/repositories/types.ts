/** Runtime version marker for test verification */
export const REPOSITORY_TYPES_VERSION = '1.0.0';

/** A plan document stored in the database */
export interface Plan {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  userId: string;
  createdAt: string;
}

/** Query parameters for geo-spatial plan search */
export interface GeoQuery {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}

/** Repository interface for Plan persistence and geo queries */
export interface PlanRepository {
  findByGeo(query: GeoQuery): Promise<Plan[]>;
  create(plan: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan>;
  findById(id: string): Promise<Plan | null>;
  findByUserId(userId: string): Promise<Plan[]>;
}
