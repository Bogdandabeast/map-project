import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schemas/schema.js';

export function createDb(d1Binding) {
  return drizzle(d1Binding, { schema });
}
