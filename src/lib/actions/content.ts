"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import {
	anniversaries,
	letters,
	photos,
	settings,
	timelineEvents,
} from "@/db/schema";
import { requireUser } from "@/lib/auth-session";
import {
	archiveTemporaryMemoryImage,
	mediaUrlToStorageKey,
	type MemoryImageArchiveKind,
} from "@/lib/r2";
import type { Visibility } from "@/lib/content";

type ActionResult = {
	error?: string;
	ok?: boolean;
};

type PhotoInput = {
	description?: string;
	imageUrl?: string;
	location?: string;
	sortOrder?: string;
	takenAt?: string;
	title?: string;
	visibility?: string;
};

type LetterInput = {
	author?: string;
	content?: string;
	title?: string;
	visibility?: string;
	writtenAt?: string;
};

type TimelineInput = {
	description?: string;
	eventDate?: string;
	location?: string;
	photoId?: string;
	title?: string;
	visibility?: string;
};

type AnniversaryInput = {
	date?: string;
	description?: string;
	isPrimary?: boolean;
	title?: string;
	type?: string;
};

const memoryPaths = [
	"/",
	"/admin",
	"/anniversaries",
	"/letters",
	"/photos",
	"/private",
	"/timeline",
];

function revalidateMemoryPaths() {
	for (const path of memoryPaths) {
		revalidatePath(path);
	}
}

function cleanText(value: string | undefined | null, fallback = "") {
	return (value ?? "").trim() || fallback;
}

function optionalText(value: string | undefined | null) {
	const text = cleanText(value);
	return text || null;
}

function parseVisibility(value: string | undefined): Visibility {
	return value === "private" ? "private" : "public";
}

function parseDate(value: string | undefined | null) {
	const text = cleanText(value);

	if (!text) {
		return null;
	}

	const date = new Date(`${text}T00:00:00`);
	return Number.isNaN(date.getTime()) ? null : date;
}

function parseRequiredDate(value: string | undefined | null) {
	return parseDate(value) ?? new Date();
}

function parseSortOrder(value: string | undefined) {
	const parsed = Number.parseInt(value ?? "0", 10);
	return Number.isNaN(parsed) ? 0 : parsed;
}

function getR2Bucket() {
	const { env } = getCloudflareContext();
	return (env as CloudflareEnv).R2;
}

async function archiveImage({
	date,
	imageUrl,
	kind,
	letterId,
}: {
	date?: Date;
	imageUrl: string;
	kind: MemoryImageArchiveKind;
	letterId?: string;
}) {
	const bucket = getR2Bucket();
	const archived = await archiveTemporaryMemoryImage({
		bucket,
		date,
		kind,
		letterId,
		url: imageUrl,
	});

	const storageKey = archived.storageKey ?? mediaUrlToStorageKey(imageUrl);

	if (!storageKey) {
		throw new Error("无法识别图片地址，请重新上传。");
	}

	return storageKey;
}

export async function createPhoto(input: PhotoInput): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);
	const imageUrl = cleanText(input.imageUrl);

	if (!title) {
		return { error: "请填写照片标题。" };
	}

	if (!imageUrl) {
		return { error: "请先上传一张照片。" };
	}

	try {
		const visibility = parseVisibility(input.visibility);
		const takenAt = parseDate(input.takenAt);
		const storageKey = await archiveImage({
			date: takenAt ?? undefined,
			imageUrl,
			kind: visibility === "private" ? "private" : "photo",
		});

		await getDb().insert(photos).values({
			id: crypto.randomUUID(),
			title,
			description: optionalText(input.description),
			storageKey,
			thumbnailKey: null,
			takenAt,
			location: optionalText(input.location),
			visibility,
			sortOrder: parseSortOrder(input.sortOrder),
			createdAt: new Date(),
		});

		revalidateMemoryPaths();
		return { ok: true };
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "照片保存失败。",
		};
	}
}

export async function updatePhoto(
	id: string,
	input: PhotoInput
): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);

	if (!title) {
		return { error: "请填写照片标题。" };
	}

	try {
		const visibility = parseVisibility(input.visibility);
		const takenAt = parseDate(input.takenAt);
		const imageUrl = cleanText(input.imageUrl);
		const updateData: Partial<typeof photos.$inferInsert> = {
			title,
			description: optionalText(input.description),
			takenAt,
			location: optionalText(input.location),
			visibility,
			sortOrder: parseSortOrder(input.sortOrder),
		};

		if (imageUrl) {
			updateData.storageKey = await archiveImage({
				date: takenAt ?? undefined,
				imageUrl,
				kind: visibility === "private" ? "private" : "photo",
			});
		}

		await getDb().update(photos).set(updateData).where(eq(photos.id, id));
		revalidateMemoryPaths();
		return { ok: true };
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "照片更新失败。",
		};
	}
}

export async function deletePhoto(id: string): Promise<ActionResult> {
	await requireUser();

	try {
		await getDb().delete(photos).where(eq(photos.id, id));
		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "照片删除失败。" };
	}
}

export async function createLetter(input: LetterInput): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);
	const content = cleanText(input.content);

	if (!title || !content) {
		return { error: "请填写情书标题和正文。" };
	}

	try {
		await getDb().insert(letters).values({
			id: crypto.randomUUID(),
			title,
			content,
			author: optionalText(input.author),
			visibility: parseVisibility(input.visibility ?? "private"),
			writtenAt: parseDate(input.writtenAt),
			createdAt: new Date(),
		});

		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "情书保存失败。" };
	}
}

export async function updateLetter(
	id: string,
	input: LetterInput
): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);
	const content = cleanText(input.content);

	if (!title || !content) {
		return { error: "请填写情书标题和正文。" };
	}

	try {
		await getDb()
			.update(letters)
			.set({
				title,
				content,
				author: optionalText(input.author),
				visibility: parseVisibility(input.visibility ?? "private"),
				writtenAt: parseDate(input.writtenAt),
			})
			.where(eq(letters.id, id));

		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "情书更新失败。" };
	}
}

export async function deleteLetter(id: string): Promise<ActionResult> {
	await requireUser();

	try {
		await getDb().delete(letters).where(eq(letters.id, id));
		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "情书删除失败。" };
	}
}

export async function createTimelineEvent(
	input: TimelineInput
): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);

	if (!title) {
		return { error: "请填写时间线标题。" };
	}

	try {
		await getDb().insert(timelineEvents).values({
			id: crypto.randomUUID(),
			title,
			description: optionalText(input.description),
			eventDate: parseRequiredDate(input.eventDate),
			photoId: optionalText(input.photoId),
			location: optionalText(input.location),
			visibility: parseVisibility(input.visibility),
			createdAt: new Date(),
		});

		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "时间线事件保存失败。" };
	}
}

export async function updateTimelineEvent(
	id: string,
	input: TimelineInput
): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);

	if (!title) {
		return { error: "请填写时间线标题。" };
	}

	try {
		await getDb()
			.update(timelineEvents)
			.set({
				title,
				description: optionalText(input.description),
				eventDate: parseRequiredDate(input.eventDate),
				photoId: optionalText(input.photoId),
				location: optionalText(input.location),
				visibility: parseVisibility(input.visibility),
			})
			.where(eq(timelineEvents.id, id));

		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "时间线事件更新失败。" };
	}
}

export async function deleteTimelineEvent(id: string): Promise<ActionResult> {
	await requireUser();

	try {
		await getDb().delete(timelineEvents).where(eq(timelineEvents.id, id));
		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "时间线事件删除失败。" };
	}
}

export async function createAnniversary(
	input: AnniversaryInput
): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);
	const date = cleanText(input.date);

	if (!title || !date) {
		return { error: "请填写纪念日标题和日期。" };
	}

	try {
		await getDb().insert(anniversaries).values({
			id: crypto.randomUUID(),
			title,
			date,
			type: cleanText(input.type, "annual"),
			description: optionalText(input.description),
			isPrimary: Boolean(input.isPrimary),
			createdAt: new Date(),
		});

		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "纪念日保存失败。" };
	}
}

export async function updateAnniversary(
	id: string,
	input: AnniversaryInput
): Promise<ActionResult> {
	await requireUser();

	const title = cleanText(input.title);
	const date = cleanText(input.date);

	if (!title || !date) {
		return { error: "请填写纪念日标题和日期。" };
	}

	try {
		await getDb()
			.update(anniversaries)
			.set({
				title,
				date,
				type: cleanText(input.type, "annual"),
				description: optionalText(input.description),
				isPrimary: Boolean(input.isPrimary),
			})
			.where(eq(anniversaries.id, id));

		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "纪念日更新失败。" };
	}
}

export async function deleteAnniversary(id: string): Promise<ActionResult> {
	await requireUser();

	try {
		await getDb().delete(anniversaries).where(eq(anniversaries.id, id));
		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "纪念日删除失败。" };
	}
}

export async function updateSettings(
	input: Record<string, string>
): Promise<ActionResult> {
	await requireUser();

	try {
		const db = getDb();
		const now = new Date();

		for (const key of [
			"siteTitle",
			"coupleNames",
			"heroTitle",
			"heroSubtitle",
			"loveStartDate",
			"heroImageUrl",
		]) {
			const value = cleanText(input[key]);

			await db
				.insert(settings)
				.values({ key, value, updatedAt: now })
				.onConflictDoUpdate({
					target: settings.key,
					set: { value, updatedAt: now },
				});
		}

		revalidateMemoryPaths();
		return { ok: true };
	} catch {
		return { error: "站点设置更新失败。" };
	}
}
