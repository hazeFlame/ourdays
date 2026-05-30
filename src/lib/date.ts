export function formatDisplayDate(value: Date | string | null | undefined) {
	if (!value) {
		return "未记录日期";
	}

	return new Intl.DateTimeFormat("zh-CN", {
		day: "2-digit",
		month: "long",
		year: "numeric",
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

	return date.toISOString().slice(0, 10);
}
