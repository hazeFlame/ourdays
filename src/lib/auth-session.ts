import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";

export async function getCurrentSession() {
	const auth = getAuth();
	return auth.api.getSession({
		headers: await headers(),
	});
}

export async function getCurrentUser() {
	const session = await getCurrentSession();
	return session?.user ?? null;
}

export async function getUserFromRequest(request: Request) {
	const auth = getAuth();
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	return session?.user ?? null;
}

export async function requireSession() {
	const session = await getCurrentSession();

	if (!session?.user) {
		redirect("/login");
	}

	return session;
}

export async function requireUser() {
	const session = await requireSession();
	return session.user;
}

export async function redirectIfAuthenticated(redirectTo = "/") {
	const user = await getCurrentUser();

	if (user) {
		redirect(redirectTo);
	}
}
