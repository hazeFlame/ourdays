export const MEDIA_URL_PREFIX = "/media";
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
export const TEMPORARY_IMAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PRODUCTION_MEDIA_BASE_URL = "";

export const IMAGE_UPLOAD_KINDS = [
	"avatar",
	"cover",
	"gallery",
	"letter",
	"photo",
	"private",
	"user-avatar",
] as const;

export type ImageUploadKind = (typeof IMAGE_UPLOAD_KINDS)[number];
export type CharacterImageArchiveKind = "avatar" | "cover" | "gallery";
export type MemoryImageArchiveKind = "letter" | "photo" | "private";

const IMAGE_EXTENSIONS = new Map([
	["image/avif", "avif"],
	["image/gif", "gif"],
	["image/jpeg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
]);

export function isImageUploadKind(value: string): value is ImageUploadKind {
	return IMAGE_UPLOAD_KINDS.includes(value as ImageUploadKind);
}

export function isAllowedImageContentType(value: string) {
	return IMAGE_EXTENSIONS.has(value.toLowerCase());
}

export function getImageExtension(contentType: string) {
	return IMAGE_EXTENSIONS.get(contentType.toLowerCase()) ?? "bin";
}

function safePathSegment(value: string) {
	return value
		.normalize("NFKC")
		.replace(/[^a-zA-Z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80) || "unknown";
}

export function buildTemporaryImageKey({
	contentType,
	kind,
	userId,
}: {
	contentType: string;
	kind: ImageUploadKind;
	userId: string;
}) {
	const extension = getImageExtension(contentType);
	const fileId = crypto.randomUUID();

	return `tmp/${safePathSegment(userId)}/${kind}/${fileId}.${extension}`;
}

export function buildCharacterImageKey({
	characterId,
	kind,
	sourceKey,
}: {
	characterId: string;
	kind: CharacterImageArchiveKind;
	sourceKey: string;
}) {
	const fileName = sourceKey.split("/").filter(Boolean).at(-1) ?? `${crypto.randomUUID()}.bin`;

	return `characters/${safePathSegment(characterId)}/${kind}/${fileName}`;
}

export function buildMemoryImageKey({
	date = new Date(),
	kind,
	letterId,
	sourceKey,
}: {
	date?: Date;
	kind: MemoryImageArchiveKind;
	letterId?: string;
	sourceKey: string;
}) {
	const fileName = sourceKey.split("/").filter(Boolean).at(-1) ?? `${crypto.randomUUID()}.bin`;
	const year = String(date.getFullYear());

	if (kind === "letter") {
		return `letters/${safePathSegment(letterId ?? "general")}/${fileName}`;
	}

	if (kind === "private") {
		return `private/${year}/${fileName}`;
	}

	return `photos/original/${year}/${fileName}`;
}

export function isTemporaryStorageKey(value: string | null | undefined) {
	return Boolean(value?.startsWith("tmp/"));
}

function encodeStorageKey(key: string) {
	return key.split("/").map(encodeURIComponent).join("/");
}

function getPublicMediaBaseUrl() {
	const configured = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
	const fallback =
		process.env.NODE_ENV === "production" ? PRODUCTION_MEDIA_BASE_URL : "";
	const value = configured || fallback;

	return value.replace(/\/+$/, "");
}

function getReadableMediaBaseUrls() {
	return Array.from(
		new Set([getPublicMediaBaseUrl(), PRODUCTION_MEDIA_BASE_URL].filter(Boolean))
	);
}

export function storageKeyToMediaUrl(key: string) {
	const encodedKey = encodeStorageKey(key);
	const mediaBaseUrl = getPublicMediaBaseUrl();

	if (mediaBaseUrl) {
		return `${mediaBaseUrl}/${encodedKey}`;
	}

	return `${MEDIA_URL_PREFIX}/${encodedKey}`;
}

export function mediaUrlToStorageKey(value: string | null | undefined) {
	const text = value?.trim();

	if (!text) {
		return null;
	}

	try {
		const pathname = text.startsWith("/")
			? text
			: new URL(text).pathname;

		if (!pathname.startsWith(`${MEDIA_URL_PREFIX}/`)) {
			if (text.startsWith("/")) {
				return null;
			}

			const url = new URL(text);

			for (const mediaBaseUrl of getReadableMediaBaseUrls()) {
				const baseUrl = new URL(mediaBaseUrl);
				const basePath = baseUrl.pathname.replace(/\/+$/, "");

				if (url.origin !== baseUrl.origin) {
					continue;
				}

				if (basePath && !url.pathname.startsWith(`${basePath}/`)) {
					continue;
				}

				return url.pathname
					.slice(basePath.length + 1)
					.split("/")
					.map(decodeURIComponent)
					.join("/");
			}

			return null;
		}

		return pathname
			.slice(MEDIA_URL_PREFIX.length + 1)
			.split("/")
			.map(decodeURIComponent)
			.join("/");
	} catch {
		return null;
	}
}

export class TemporaryImageArchiveError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TemporaryImageArchiveError";
	}
}

export async function archiveTemporaryImage({
	bucket,
	characterId,
	kind,
	url,
}: {
	bucket: R2Bucket;
	characterId: string;
	kind: CharacterImageArchiveKind;
	url: string | null;
}) {
	const sourceKey = mediaUrlToStorageKey(url);

	if (!url || !sourceKey) {
		return {
			archived: false,
			storageKey: sourceKey,
			url,
		};
	}

	if (!isTemporaryStorageKey(sourceKey)) {
		return {
			archived: false,
			storageKey: sourceKey,
			url,
		};
	}

	const object = await bucket.get(sourceKey);

	if (!object) {
		throw new TemporaryImageArchiveError("图片临时文件已过期，请重新上传。");
	}

	const storageKey = buildCharacterImageKey({
		characterId,
		kind,
		sourceKey,
	});

	await bucket.put(storageKey, object.body, {
		httpMetadata: object.httpMetadata,
		customMetadata: {
			...(object.customMetadata ?? {}),
			archivedFrom: sourceKey,
			characterId,
			kind,
		},
	});

	try {
		await bucket.delete(sourceKey);
	} catch (error) {
		await bucket.delete(storageKey).catch((cleanupError) => {
			console.warn("failed to rollback archived image after source delete failed", {
				cleanupError,
				sourceKey,
				storageKey,
			});
		});
		throw error;
	}

	return {
		archived: true,
		storageKey,
		url: storageKeyToMediaUrl(storageKey),
	};
}

export async function archiveTemporaryMemoryImage({
	bucket,
	date,
	kind,
	letterId,
	url,
}: {
	bucket: R2Bucket;
	date?: Date;
	kind: MemoryImageArchiveKind;
	letterId?: string;
	url: string | null;
}) {
	const sourceKey = mediaUrlToStorageKey(url);

	if (!url || !sourceKey) {
		return {
			archived: false,
			storageKey: sourceKey,
			url,
		};
	}

	if (!isTemporaryStorageKey(sourceKey)) {
		return {
			archived: false,
			storageKey: sourceKey,
			url,
		};
	}

	const object = await bucket.get(sourceKey);

	if (!object) {
		throw new TemporaryImageArchiveError("图片临时文件已过期，请重新上传。");
	}

	const storageKey = buildMemoryImageKey({
		date,
		kind,
		letterId,
		sourceKey,
	});

	await bucket.put(storageKey, object.body, {
		httpMetadata: object.httpMetadata,
		customMetadata: {
			...(object.customMetadata ?? {}),
			archivedFrom: sourceKey,
			kind,
			letterId: letterId ?? "",
		},
	});

	try {
		await bucket.delete(sourceKey);
	} catch (error) {
		await bucket.delete(storageKey).catch((cleanupError) => {
			console.warn("failed to rollback archived memory image after source delete failed", {
				cleanupError,
				sourceKey,
				storageKey,
			});
		});
		throw error;
	}

	return {
		archived: true,
		storageKey,
		url: storageKeyToMediaUrl(storageKey),
	};
}

export async function cleanupTemporaryImages({
	bucket,
	maxObjects = 5000,
	now = new Date(),
	olderThanMs = TEMPORARY_IMAGE_TTL_MS,
	protectedKeys = new Set<string>(),
}: {
	bucket: R2Bucket;
	maxObjects?: number;
	now?: Date;
	olderThanMs?: number;
	protectedKeys?: Set<string>;
}) {
	const cutoff = new Date(now.getTime() - olderThanMs);
	let cursor: string | undefined;
	let deleted = 0;
	let scanned = 0;
	let skipped = 0;

	do {
		const result = await bucket.list({
			cursor,
			limit: Math.min(1000, Math.max(1, maxObjects - scanned)),
			prefix: "tmp/",
		});
		const expiredKeys = result.objects
			.filter((object) => {
				if (object.uploaded >= cutoff) {
					return false;
				}

				if (protectedKeys.has(object.key)) {
					skipped += 1;
					return false;
				}

				return true;
			})
			.map((object) => object.key);

		scanned += result.objects.length;

		if (expiredKeys.length > 0) {
			await bucket.delete(expiredKeys);
			deleted += expiredKeys.length;
		}

		cursor = result.truncated ? result.cursor : undefined;
	} while (cursor && scanned < maxObjects);

	return {
		cutoff: cutoff.toISOString(),
		deleted,
		scanned,
		skipped,
		truncated: Boolean(cursor),
	};
}
