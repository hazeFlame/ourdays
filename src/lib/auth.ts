import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { getDb } from "@/db/client";
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

function initAuth() {
	const { env } = getCloudflareContext();
	const bindings = env as AuthBindings;

	return betterAuth({
		baseURL: requireBinding(bindings, "BETTER_AUTH_URL"),
		secret: requireBinding(bindings, "BETTER_AUTH_SECRET"),
		advanced: {
			ipAddress: {
				ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
			},
		},
		database: drizzleAdapter(getDb(), {
			provider: "sqlite",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			minPasswordLength: 4,
		},
	});
}

type AuthInstance = ReturnType<typeof initAuth>;
let cachedAuth: AuthInstance | null = null;

export function getAuth(): AuthInstance {
	if (!cachedAuth) {
		cachedAuth = initAuth();
	}
	return cachedAuth;
}
