import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(binding: D1Database): Database {
  return drizzle(binding, { schema });
}

export { schema };