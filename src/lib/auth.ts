import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { createDb } from "@/db/client";
import * as schema from "@/db/schema";

type AuthBindings = CloudflareEnv & {
	DB: D1Database;
	BETTER_AUTH_SECRET?: string;
	BETTER_AUTH_URL?: string;
};

function requireBinding(env: AuthBindings, name: keyof AuthBindings): string {
	const value = env[name];

	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`Missing required auth binding: ${String(name)}`);
	}

	return value;
}

export function getAuth() {
	const { env } = getCloudflareContext();
	const bindings = env as AuthBindings;
	const db = createDb(bindings.DB);

	return betterAuth({
		baseURL: requireBinding(bindings, "BETTER_AUTH_URL"),
		secret: requireBinding(bindings, "BETTER_AUTH_SECRET"),
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			minPasswordLength: 8,
		},
	});
}
