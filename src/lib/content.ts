import { desc, eq } from "drizzle-orm";

import {
	anniversaries,
	letters,
	photos,
	settings,
	timelineEvents,
	user,
} from "@/db/schema";
import { getDb } from "@/db/client";
import { getNextAnniversaryDate } from "@/lib/date";
import { storageKeyToMediaUrl } from "@/lib/r2";

export type Visibility = "public" | "private";

export type MemoryPhoto = {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	takenAt: Date | null;
	visibility: string;
	url: string | null;
	thumbnailUrl: string | null;
	sortOrder: number;
	createdAt: Date;
	createdBy: string | null;
};

export type MemoryLetter = {
	id: string;
	title: string;
	content: string;
	author: string | null;
	visibility: string;
	writtenAt: Date | null;
	createdAt: Date;
	createdBy: string | null;
};

export type MemoryTimelineEvent = {
	id: string;
	title: string;
	description: string | null;
	eventDate: Date;
	location: string | null;
	visibility: string;
	photoId: string | null;
	createdAt: Date;
	createdBy: string | null;
};

export type MemoryAnniversary = {
	id: string;
	title: string;
	date: string;
	type: string;
	description: string | null;
	isPrimary: boolean;
	createdAt: Date;
	createdBy: string | null;
};

export type SiteSettings = {
	siteTitle: string;
	coupleNames: string;
	heroTitle: string;
	heroSubtitle: string;
	loveStartDate: string;
	heroImageUrl: string | null;
};

const fallbackPhotos: MemoryPhoto[] = [
	{
		id: "fallback-morning",
		title: "第一次认真散步",
		description: "把普通的街角，变成只属于我们的坐标。",
		location: "海边小路",
		takenAt: new Date("2024-05-20T00:00:00.000Z"),
		visibility: "public",
		url: null,
		thumbnailUrl: null,
		sortOrder: 10,
		createdAt: new Date("2024-05-20T00:00:00.000Z"),
		createdBy: null,
	},
	{
		id: "fallback-night",
		title: "晚风和电影票",
		description: "那天的晚风很轻，回家的路很长。",
		location: "老电影院",
		takenAt: new Date("2024-08-14T00:00:00.000Z"),
		visibility: "public",
		url: null,
		thumbnailUrl: null,
		sortOrder: 8,
		createdAt: new Date("2024-08-14T00:00:00.000Z"),
		createdBy: null,
	},
	{
		id: "fallback-sun",
		title: "一起等日落",
		description: "光落下来的时候，我们没有急着走。",
		location: "山顶",
		takenAt: new Date("2024-10-02T00:00:00.000Z"),
		visibility: "public",
		url: null,
		thumbnailUrl: null,
		sortOrder: 6,
		createdAt: new Date("2024-10-02T00:00:00.000Z"),
		createdBy: null,
	},
];

const fallbackLetters: MemoryLetter[] = [
	{
		id: "fallback-letter",
		title: "给未来的我们",
		content:
			"愿我们以后翻到这里时，还会记得最开始那种小心翼翼又很笃定的喜欢。",
		author: "我们",
		visibility: "public",
		writtenAt: new Date("2024-05-20T00:00:00.000Z"),
		createdAt: new Date("2024-05-20T00:00:00.000Z"),
		createdBy: null,
	},
];

const fallbackTimeline: MemoryTimelineEvent[] = [
	{
		id: "fallback-meet",
		title: "故事开始",
		description: "从一句普通的问候开始，后来每一天都有了新的重量。",
		eventDate: new Date("2024-05-20T00:00:00.000Z"),
		location: "春天",
		visibility: "public",
		photoId: null,
		createdAt: new Date("2024-05-20T00:00:00.000Z"),
		createdBy: null,
	},
	{
		id: "fallback-trip",
		title: "第一次一起旅行",
		description: "路线绕了一点，但我们都觉得刚刚好。",
		eventDate: new Date("2024-10-02T00:00:00.000Z"),
		location: "远方",
		visibility: "public",
		photoId: null,
		createdAt: new Date("2024-10-02T00:00:00.000Z"),
		createdBy: null,
	},
];

const fallbackAnniversaries: MemoryAnniversary[] = [
	{
		id: "fallback-start",
		title: "在一起纪念日",
		date: "2024-05-20",
		type: "annual",
		description: "每一年都要认真庆祝的日子。",
		isPrimary: true,
		createdAt: new Date("2024-05-20T00:00:00.000Z"),
		createdBy: null,
	},
];

const fallbackSettings: SiteSettings = {
	siteTitle: "淫荡的宁宁",
	coupleNames: "你和我",
	heroTitle: "淫荡的宁宁",
	heroSubtitle: "把相爱这件小事，认真收藏成一个会发光的地方。",
	loveStartDate: "2024-05-20",
	heroImageUrl: null,
};

function toPhoto(row: typeof photos.$inferSelect, createdByName?: string | null): MemoryPhoto {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		location: row.location,
		takenAt: row.takenAt,
		visibility: row.visibility,
		url: storageKeyToMediaUrl(row.storageKey),
		thumbnailUrl: row.thumbnailKey ? storageKeyToMediaUrl(row.thumbnailKey) : null,
		sortOrder: row.sortOrder,
		createdAt: row.createdAt,
		createdBy: createdByName ?? null,
	};
}

function toLetter(row: typeof letters.$inferSelect, createdByName?: string | null): MemoryLetter {
	return {
		id: row.id,
		title: row.title,
		content: row.content,
		author: row.author,
		visibility: row.visibility,
		writtenAt: row.writtenAt,
		createdAt: row.createdAt,
		createdBy: createdByName ?? null,
	};
}

function toTimelineEvent(
	row: typeof timelineEvents.$inferSelect,
	createdByName?: string | null
): MemoryTimelineEvent {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		eventDate: row.eventDate,
		location: row.location,
		visibility: row.visibility,
		photoId: row.photoId,
		createdAt: row.createdAt,
		createdBy: createdByName ?? null,
	};
}

function toAnniversary(row: typeof anniversaries.$inferSelect, createdByName?: string | null): MemoryAnniversary {
	return {
		id: row.id,
		title: row.title,
		date: row.date,
		type: row.type,
		description: row.description,
		isPrimary: row.isPrimary,
		createdAt: row.createdAt,
		createdBy: createdByName ?? null,
	};
}

async function readOrFallback<T>({
	fallback,
	query,
	useFallbackWhenEmpty = true,
}: {
	fallback: T[];
	query: () => Promise<T[]>;
	useFallbackWhenEmpty?: boolean;
}) {
	try {
		const rows = await query();
		return rows.length === 0 && useFallbackWhenEmpty ? fallback : rows;
	} catch {
		return fallback;
	}
}

export async function getSiteSettings(): Promise<SiteSettings> {
	try {
		const db = getDb();
		const rows = await db.select().from(settings);
		const values = new Map(rows.map((row) => [row.key, row.value]));

		return {
			siteTitle: values.get("siteTitle") || fallbackSettings.siteTitle,
			coupleNames: values.get("coupleNames") || fallbackSettings.coupleNames,
			heroTitle: values.get("heroTitle") || fallbackSettings.heroTitle,
			heroSubtitle: values.get("heroSubtitle") || fallbackSettings.heroSubtitle,
			loveStartDate:
				values.get("loveStartDate") || fallbackSettings.loveStartDate,
			heroImageUrl: values.get("heroImageUrl") || fallbackSettings.heroImageUrl,
		};
	} catch {
		return fallbackSettings;
	}
}

export async function getPublicPhotos(limit?: number) {
	return readOrFallback({
		fallback: limit ? fallbackPhotos.slice(0, limit) : fallbackPhotos,
		query: async () => {
			const query = getDb()
				.select()
				.from(photos)
				.where(eq(photos.visibility, "public"))
				.orderBy(desc(photos.sortOrder), desc(photos.takenAt), desc(photos.createdAt));
			const rows = limit ? await query.limit(limit) : await query;
			return rows.map((row) => toPhoto(row));
		},
	});
}

export async function getAllPhotos() {
	return readOrFallback({
		fallback: [],
		query: async () => {
			const rows = await getDb()
				.select({
					photo: photos,
					createdByName: user.name,
				})
				.from(photos)
				.leftJoin(user, eq(photos.createdByUserId, user.id))
				.orderBy(desc(photos.sortOrder), desc(photos.createdAt));
			return rows.map(({ photo, createdByName }) => toPhoto(photo, createdByName));
		},
		useFallbackWhenEmpty: false,
	});
}

export async function getPublicLetters(limit?: number) {
	return readOrFallback({
		fallback: limit ? fallbackLetters.slice(0, limit) : fallbackLetters,
		query: async () => {
			const query = getDb()
				.select({
					letter: letters,
					createdByName: user.name,
				})
				.from(letters)
				.leftJoin(user, eq(letters.createdByUserId, user.id))
				.where(eq(letters.visibility, "public"))
				.orderBy(desc(letters.createdAt));
			const rows = limit ? await query.limit(limit) : await query;
			return rows.map(({ letter, createdByName }) => toLetter(letter, createdByName));
		},
	});
}

export async function getAllLetters() {
	return readOrFallback({
		fallback: [],
		query: async () => {
			const rows = await getDb()
				.select({
					letter: letters,
					createdByName: user.name,
				})
				.from(letters)
				.leftJoin(user, eq(letters.createdByUserId, user.id))
				.orderBy(desc(letters.createdAt));
			return rows.map(({ letter, createdByName }) => toLetter(letter, createdByName));
		},
		useFallbackWhenEmpty: false,
	});
}

export async function getPublicTimelineEvents(limit?: number) {
	return readOrFallback({
		fallback: limit ? fallbackTimeline.slice(0, limit) : fallbackTimeline,
		query: async () => {
			const query = getDb()
				.select({
					event: timelineEvents,
					createdByName: user.name,
				})
				.from(timelineEvents)
				.leftJoin(user, eq(timelineEvents.createdByUserId, user.id))
				.where(eq(timelineEvents.visibility, "public"))
				.orderBy(desc(timelineEvents.createdAt));
			const rows = limit ? await query.limit(limit) : await query;
			return rows.map(({ event, createdByName }) => toTimelineEvent(event, createdByName));
		},
	});
}

export async function getAllTimelineEvents() {
	return readOrFallback({
		fallback: [],
		query: async () => {
			const rows = await getDb()
				.select({
					event: timelineEvents,
					createdByName: user.name,
				})
				.from(timelineEvents)
				.leftJoin(user, eq(timelineEvents.createdByUserId, user.id))
				.orderBy(desc(timelineEvents.createdAt));
			return rows.map(({ event, createdByName }) => toTimelineEvent(event, createdByName));
		},
		useFallbackWhenEmpty: false,
	});
}

export async function getAnniversaries() {
	return readOrFallback({
		fallback: fallbackAnniversaries,
		query: async () => {
			const rows = await getDb()
				.select()
				.from(anniversaries)
				.orderBy(desc(anniversaries.isPrimary), desc(anniversaries.date));
			return rows.map((row) => toAnniversary(row));
		},
	});
}

export async function getAdminAnniversaries() {
	return readOrFallback({
		fallback: [],
		query: async () => {
			const rows = await getDb()
				.select({
					anniversary: anniversaries,
					createdByName: user.name,
				})
				.from(anniversaries)
				.leftJoin(user, eq(anniversaries.createdByUserId, user.id))
				.orderBy(desc(anniversaries.isPrimary), desc(anniversaries.date));
			return rows.map(({ anniversary, createdByName }) => toAnniversary(anniversary, createdByName));
		},
		useFallbackWhenEmpty: false,
	});
}

export function getLoveDays(startDate: string, now = new Date()) {
	const start = new Date(`${startDate}T00:00:00`);
	const startMs = start.getTime();

	if (Number.isNaN(startMs)) {
		return 0;
	}

	return Math.max(
		1,
		Math.floor((now.getTime() - startMs) / (24 * 60 * 60 * 1000)) + 1
	);
}

export function getNextAnniversary(
	items: MemoryAnniversary[],
	now = new Date()
) {
	const candidates = items
		.map((item) => {
			const nextDate = getNextAnniversaryDate(item.date, item.type, now);
			return { item, nextDate };
		})
		.filter((candidate): candidate is { item: MemoryAnniversary; nextDate: Date } => Boolean(candidate.nextDate))
		.sort((left, right) => left.nextDate.getTime() - right.nextDate.getTime());

	return candidates[0] ?? null;
}
