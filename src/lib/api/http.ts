type JsonRecord = Record<string, unknown>;

export function jsonOk<T extends JsonRecord | JsonRecord[]>(data: T, init?: ResponseInit) {
	return Response.json(data, init);
}

export function jsonError(message: string, status = 400) {
	return Response.json({ error: message }, { status });
}

export async function readJsonObject(request: Request) {
	try {
		const body = await request.json();

		if (!body || typeof body !== "object" || Array.isArray(body)) {
			return null;
		}

		return body as JsonRecord;
	} catch {
		return null;
	}
}

export function getString(value: unknown, fallback = "") {
	return typeof value === "string" ? value.trim() : fallback;
}

export function getBoolean(value: unknown, fallback = false) {
	return typeof value === "boolean" ? value : fallback;
}
