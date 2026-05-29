import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

type AppBindings = CloudflareEnv & {
	DB: D1Database;
};

export type Database = DrizzleD1Database<typeof schema>;

export function createDb(database: D1Database): Database {
	return drizzle(database, { schema });
}

let cachedDb: Database | null = null;

export function getDb(): Database {
	if (cachedDb) {
		return cachedDb;
	}

	const { env } = getCloudflareContext();
	cachedDb = createDb((env as AppBindings).DB);
	return cachedDb;
}
