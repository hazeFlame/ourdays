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
