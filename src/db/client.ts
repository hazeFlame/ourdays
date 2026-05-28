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

export function getDb(): Database {
	const { env } = getCloudflareContext();
	return createDb((env as AppBindings).DB);
}
