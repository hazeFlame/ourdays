import { getCloudflareContext } from "@opennextjs/cloudflare";

import { jsonError, jsonOk, getString } from "@/lib/api/http";
import { getUserFromRequest } from "@/lib/auth-session";
import {
	buildTemporaryImageKey,
	isAllowedImageContentType,
	isImageUploadKind,
	MAX_IMAGE_UPLOAD_BYTES,
	storageKeyToMediaUrl,
} from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	const user = await getUserFromRequest(request);

	if (!user) {
		return jsonError("请先登录", 401);
	}

	let formData: FormData;

	try {
		formData = await request.formData();
	} catch {
		return jsonError("上传内容格式不正确");
	}

	const file = formData.get("file");
	const kind = getString(formData.get("kind"), "gallery");

	if (!isImageUploadKind(kind)) {
		return jsonError("未知的图片用途");
	}

	if (!(file instanceof File)) {
		return jsonError("请选择要上传的图片");
	}

	if (file.size <= 0) {
		return jsonError("图片内容为空");
	}

	if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
		return jsonError("图片不能超过 8MB");
	}

	const contentType = file.type.toLowerCase();

	if (!isAllowedImageContentType(contentType)) {
		return jsonError("只支持 AVIF、GIF、JPEG、PNG、WebP 图片");
	}

	const { env } = getCloudflareContext();
	const bucket = (env as CloudflareEnv).R2;
	const key = buildTemporaryImageKey({
		contentType,
		kind,
		userId: user.id,
	});

	await bucket.put(key, file.stream(), {
		httpMetadata: {
			cacheControl: "public, max-age=31536000, immutable",
			contentType,
		},
		customMetadata: {
			originalName: file.name || "upload",
			ownerUserId: user.id,
			uploadKind: kind,
		},
	});

	return jsonOk(
		{
			contentType,
			key,
			size: file.size,
			url: storageKeyToMediaUrl(key),
		},
		{ status: 201 }
	);
}
