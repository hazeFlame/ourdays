import { relations } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable(
	"user",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		emailVerified: integer("email_verified", { mode: "boolean" })
			.notNull()
			.default(false),
		image: text("image"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [uniqueIndex("user_email_unique").on(table.email)]
);

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
		token: text("token").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("session_token_unique").on(table.token),
		index("session_user_id_idx").on(table.userId),
	]
);

export const account = sqliteTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at", {
			mode: "timestamp",
		}),
		refreshTokenExpiresAt: integer("refresh_token_expires_at", {
			mode: "timestamp",
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		index("account_user_id_idx").on(table.userId),
		uniqueIndex("account_provider_account_id_unique").on(
			table.providerId,
			table.accountId
		),
	]
);

export const verification = sqliteTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const photos = sqliteTable(
	"photos",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		storageKey: text("storage_key").notNull(),
		thumbnailKey: text("thumbnail_key"),
		takenAt: integer("taken_at", { mode: "timestamp" }),
		location: text("location"),
		visibility: text("visibility").notNull().default("public"),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
	},
	(table) => [
		index("photos_visibility_idx").on(table.visibility),
		index("photos_sort_order_idx").on(table.sortOrder),
		index("photos_taken_at_idx").on(table.takenAt),
	]
);

export const letters = sqliteTable(
	"letters",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		content: text("content").notNull(),
		author: text("author"),
		visibility: text("visibility").notNull().default("private"),
		writtenAt: integer("written_at", { mode: "timestamp" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
	},
	(table) => [
		index("letters_visibility_idx").on(table.visibility),
		index("letters_written_at_idx").on(table.writtenAt),
	]
);

export const timelineEvents = sqliteTable(
	"timeline_events",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		eventDate: integer("event_date", { mode: "timestamp" }).notNull(),
		photoId: text("photo_id").references(() => photos.id, {
			onDelete: "set null",
		}),
		location: text("location"),
		visibility: text("visibility").notNull().default("public"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
	},
	(table) => [
		index("timeline_events_visibility_idx").on(table.visibility),
		index("timeline_events_event_date_idx").on(table.eventDate),
		index("timeline_events_photo_id_idx").on(table.photoId),
	]
);

export const anniversaries = sqliteTable(
	"anniversaries",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		date: text("date").notNull(),
		type: text("type").notNull().default("annual"),
		description: text("description"),
		isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
	},
	(table) => [
		index("anniversaries_date_idx").on(table.date),
		index("anniversaries_primary_idx").on(table.isPrimary),
	]
);

export const settings = sqliteTable("settings", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const photoRelations = relations(photos, ({ many }) => ({
	timelineEvents: many(timelineEvents),
}));

export const timelineEventRelations = relations(timelineEvents, ({ one }) => ({
	photo: one(photos, {
		fields: [timelineEvents.photoId],
		references: [photos.id],
	}),
}));
