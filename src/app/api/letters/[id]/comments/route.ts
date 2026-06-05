import { eq, asc } from "drizzle-orm";

import { getDb } from "@/db/client";
import { letterComments } from "@/db/schema";
import { jsonError, jsonOk, readJsonObject, getString } from "@/lib/api/http";
import { getUserFromRequest } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(
	request: Request,
	context: { params: Params }
) {
	const { id: letterId } = await context.params;

	try {
		const db = getDb();
		const comments = await db
			.select()
			.from(letterComments)
			.where(eq(letterComments.letterId, letterId))
			.orderBy(asc(letterComments.createdAt));

		return jsonOk(comments);
	} catch (error) {
		console.error("Failed to fetch comments:", error);
		return jsonError("获取留言失败", 500);
	}
}

export async function POST(
	request: Request,
	context: { params: Params }
) {
	const { id: letterId } = await context.params;

	const body = await readJsonObject(request);
	if (!body) {
		return jsonError("请求体格式不正确");
	}

	const content = getString(body.content);
	let author = getString(body.author);

	if (!content) {
		return jsonError("留言内容不能为空");
	}

	// Try to get authenticated user to verify/override author if needed,
	// or default to logged-in user name.
	const user = await getUserFromRequest(request);
	if (user) {
		if (!author) {
			author = user.name || "登录用户";
		}
	} else {
		if (!author) {
			author = "调皮的游客";
		}
	}

	try {
		const db = getDb();
		const id = crypto.randomUUID();
		const newComment = {
			id,
			letterId,
			author,
			content,
			createdAt: new Date(),
		};

		await db.insert(letterComments).values(newComment);

		return jsonOk(newComment, { status: 201 });
	} catch (error) {
		console.error("Failed to post comment:", error);
		return jsonError("提交留言失败", 500);
	}
}
