import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

type MediaRouteProps = Readonly<{
	params: Promise<{
		key: string[];
	}>;
}>;

function normalizeStorageKey(segments: string[]) {
	if (segments.length === 0) {
		return null;
	}

	if (
		segments.some((segment) => !segment || segment === "." || segment === "..")
	) {
		return null;
	}

	return segments.join("/");
}

async function handleMediaRequest({ params }: MediaRouteProps, includeBody: boolean) {
	const { key: segments } = await params;
	const key = normalizeStorageKey(segments);

	if (!key) {
		return new Response("Not found", { status: 404 });
	}

	const { env } = getCloudflareContext();
	const object = await (env as CloudflareEnv).R2.get(key);

	if (!object) {
		return new Response("Not found", { status: 404 });
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("x-content-type-options", "nosniff");

	if (!headers.has("cache-control")) {
		headers.set("cache-control", "public, max-age=31536000, immutable");
	}

	return new Response(includeBody ? object.body : null, { headers });
}

export async function GET(_request: Request, props: MediaRouteProps) {
	return handleMediaRequest(props, true);
}

export async function HEAD(_request: Request, props: MediaRouteProps) {
	return handleMediaRequest(props, false);
}
