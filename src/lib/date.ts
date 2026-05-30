export function formatDisplayDate(value: Date | string | null | undefined) {
	if (!value) {
		return "未记录日期";
	}

	return new Intl.DateTimeFormat("zh-CN", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		timeZone: "Asia/Shanghai",
	}).format(new Date(value));
}

export function formatDisplayDateTime(value: Date | string | null | undefined) {
	if (!value) {
		return "未记录时间";
	}

	return new Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "long",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone: "Asia/Shanghai",
	}).format(new Date(value));
}


export function toDateInputValue(value: Date | string | null | undefined) {
	if (!value) {
		return "";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "";
	}

	// 始终将其格式化为 Asia/Shanghai 时区的 YYYY-MM-DD，避免 toISOString() 产生的 8小时时差 跨天问题
	try {
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: "Asia/Shanghai",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		const parts = formatter.formatToParts(date);
		const year = parts.find((p) => p.type === "year")?.value;
		const month = parts.find((p) => p.type === "month")?.value;
		const day = parts.find((p) => p.type === "day")?.value;
		if (year && month && day) {
			return `${year}-${month}-${day}`;
		}
	} catch (e) {
		// fallback
	}

	// 兜底回退：如果获取失败则使用本地时间
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}
