const SHANGHAI_TIME_ZONE = "Asia/Shanghai";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const ANNIVERSARY_TYPE_SOLAR_ANNUAL = "annual";
export const ANNIVERSARY_TYPE_LUNAR_ANNUAL = "lunar-annual";
export const ANNIVERSARY_TYPE_ONCE = "once";

export const ANNIVERSARY_TYPE_OPTIONS = [
	{ label: "公历每年", value: ANNIVERSARY_TYPE_SOLAR_ANNUAL },
	{ label: "农历每年", value: ANNIVERSARY_TYPE_LUNAR_ANNUAL },
	{ label: "只记录一次", value: ANNIVERSARY_TYPE_ONCE },
] as const;

export const LUNAR_MONTH_OPTIONS = [
	{ label: "正月", value: 1 },
	{ label: "二月", value: 2 },
	{ label: "三月", value: 3 },
	{ label: "四月", value: 4 },
	{ label: "五月", value: 5 },
	{ label: "六月", value: 6 },
	{ label: "七月", value: 7 },
	{ label: "八月", value: 8 },
	{ label: "九月", value: 9 },
	{ label: "十月", value: 10 },
	{ label: "冬月", value: 11 },
	{ label: "腊月", value: 12 },
] as const;

export const LUNAR_DAY_OPTIONS = [
	"初一",
	"初二",
	"初三",
	"初四",
	"初五",
	"初六",
	"初七",
	"初八",
	"初九",
	"初十",
	"十一",
	"十二",
	"十三",
	"十四",
	"十五",
	"十六",
	"十七",
	"十八",
	"十九",
	"二十",
	"廿一",
	"廿二",
	"廿三",
	"廿四",
	"廿五",
	"廿六",
	"廿七",
	"廿八",
	"廿九",
	"三十",
] as const;

type AnniversaryMonthDay = {
	day: number;
	isLeapMonth: boolean;
	month: number;
	year?: number;
};

const chineseLunarFormatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
	day: "numeric",
	month: "numeric",
	timeZone: SHANGHAI_TIME_ZONE,
});

export function formatDisplayDate(value: Date | string | null | undefined) {
	if (!value) {
		return "未记录日期";
	}

	const date = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "未记录日期";
	}

	return new Intl.DateTimeFormat("zh-CN", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		timeZone: SHANGHAI_TIME_ZONE,
	}).format(date);
}

export function formatDisplayDateTime(value: Date | string | null | undefined) {
	if (!value) {
		return "未记录时间";
	}

	const date = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(date.getTime())) {
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
		timeZone: SHANGHAI_TIME_ZONE,
	}).format(date);
}

export function normalizeAnniversaryType(type: string | null | undefined) {
	const value = (type ?? "").trim();

	if (
		value === ANNIVERSARY_TYPE_LUNAR_ANNUAL ||
		value === "lunar" ||
		value === "lunarAnnual" ||
		value === "lunar_annual"
	) {
		return ANNIVERSARY_TYPE_LUNAR_ANNUAL;
	}

	if (value === ANNIVERSARY_TYPE_ONCE || value === "one-time" || value === "single") {
		return ANNIVERSARY_TYPE_ONCE;
	}

	return ANNIVERSARY_TYPE_SOLAR_ANNUAL;
}

export function isLunarAnniversaryType(type: string | null | undefined) {
	return normalizeAnniversaryType(type) === ANNIVERSARY_TYPE_LUNAR_ANNUAL;
}

export function getAnniversaryTypeLabel(type: string | null | undefined) {
	const normalizedType = normalizeAnniversaryType(type);
	return ANNIVERSARY_TYPE_OPTIONS.find((option) => option.value === normalizedType)?.label ?? "公历每年";
}

export function serializeLunarAnniversaryDate(month: number, day: number, isLeapMonth = false) {
	return `${isLeapMonth ? "L" : ""}${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseAnniversaryMonthDay(value: string | null | undefined): AnniversaryMonthDay | null {
	const text = (value ?? "").trim();

	if (!text) {
		return null;
	}

	const match = /^(?:(\d{4})-)?(L)?(\d{1,2})-(\d{1,2})$/.exec(text);

	if (!match) {
		return null;
	}

	const year = match[1] ? Number(match[1]) : undefined;
	const month = Number(match[3]);
	const day = Number(match[4]);

	if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) {
		return null;
	}

	return {
		day,
		isLeapMonth: Boolean(match[2]),
		month,
		year,
	};
}

export function formatAnniversaryDisplayDate(value: string | null | undefined, type: string | null | undefined) {
	const normalizedType = normalizeAnniversaryType(type);
	const parts = parseAnniversaryMonthDay(value);

	if (normalizedType === ANNIVERSARY_TYPE_LUNAR_ANNUAL) {
		return parts ? formatLunarMonthDay(parts.month, parts.day, parts.isLeapMonth) : "农历日期未记录";
	}

	if (!parts) {
		return formatDisplayDate(value);
	}

	if (!parts.year) {
		return `${parts.month}月${parts.day}日`;
	}

	return formatDisplayDate(createShanghaiDate(parts.year, parts.month, parts.day) ?? value);
}

export function isValidAnniversaryDate(value: string | null | undefined, type: string | null | undefined) {
	const normalizedType = normalizeAnniversaryType(type);
	const parts = parseAnniversaryMonthDay(value);

	if (!parts) {
		return false;
	}

	if (normalizedType === ANNIVERSARY_TYPE_LUNAR_ANNUAL) {
		return parts.day <= 30;
	}

	return Boolean(parts.year && createShanghaiDate(parts.year, parts.month, parts.day));
}

export function getNextAnniversaryDate(
	value: string | null | undefined,
	type: string | null | undefined,
	now = new Date()
) {
	const normalizedType = normalizeAnniversaryType(type);

	if (normalizedType === ANNIVERSARY_TYPE_LUNAR_ANNUAL) {
		return getNextLunarAnnualDate(value, now);
	}

	if (normalizedType === ANNIVERSARY_TYPE_ONCE) {
		return getOneTimeAnniversaryDate(value, now);
	}

	return getNextSolarAnnualDate(value, now);
}

function formatLunarMonthDay(month: number, day: number, isLeapMonth = false) {
	const monthLabel = LUNAR_MONTH_OPTIONS.find((option) => option.value === month)?.label;
	const dayLabel = LUNAR_DAY_OPTIONS[day - 1];

	if (!monthLabel || !dayLabel) {
		return "农历日期未记录";
	}

	return `农历${isLeapMonth ? "闰" : ""}${monthLabel}${dayLabel}`;
}

function getNextSolarAnnualDate(value: string | null | undefined, now: Date) {
	const parts = parseAnniversaryMonthDay(value);

	if (!parts) {
		return null;
	}

	const today = startOfShanghaiDay(now);
	const { year } = getShanghaiDateParts(today);

	for (let offset = 0; offset <= 4; offset += 1) {
		const candidate = createShanghaiDate(year + offset, parts.month, parts.day);

		if (candidate && candidate.getTime() >= today.getTime()) {
			return candidate;
		}
	}

	return null;
}

function getOneTimeAnniversaryDate(value: string | null | undefined, now: Date) {
	const parts = parseAnniversaryMonthDay(value);

	if (!parts?.year) {
		return null;
	}

	const date = createShanghaiDate(parts.year, parts.month, parts.day);

	if (!date) {
		return null;
	}

	return date.getTime() >= startOfShanghaiDay(now).getTime() ? date : null;
}

function getNextLunarAnnualDate(value: string | null | undefined, now: Date) {
	const target = parseAnniversaryMonthDay(value);

	if (!target || target.day > 30) {
		return null;
	}

	const today = startOfShanghaiDay(now);
	const scanDays = target.isLeapMonth ? 8000 : 800;

	for (let offset = 0; offset < scanDays; offset += 1) {
		const candidate = addDays(today, offset);
		const lunar = getLunarParts(candidate);

		if (
			lunar &&
			lunar.month === target.month &&
			lunar.day === target.day &&
			lunar.isLeapMonth === target.isLeapMonth
		) {
			return candidate;
		}
	}

	return null;
}

function getLunarParts(date: Date): AnniversaryMonthDay | null {
	try {
		const parts = chineseLunarFormatter.formatToParts(date);
		const monthValue = parts.find((part) => part.type === "month")?.value;
		const dayValue = parts.find((part) => part.type === "day")?.value;

		if (!monthValue || !dayValue) {
			return null;
		}

		const parsedMonth = parseLunarMonthValue(monthValue);
		const day = parseLunarDayValue(dayValue);

		if (!parsedMonth || !day) {
			return null;
		}

		return {
			day,
			isLeapMonth: parsedMonth.isLeapMonth,
			month: parsedMonth.month,
		};
	} catch {
		return null;
	}
}

function parseLunarMonthValue(value: string) {
	const isLeapMonth = value.startsWith("闰");
	const normalized = value.replace(/^闰/, "");
	const numericMonth = Number(normalized);

	if (Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
		return { isLeapMonth, month: numericMonth };
	}

	const option = LUNAR_MONTH_OPTIONS.find((month) => month.label === normalized);

	if (option) {
		return { isLeapMonth, month: option.value };
	}

	const aliases: Record<string, number> = {
		一月: 1,
		十一月: 11,
		十二月: 12,
	};

	const month = aliases[normalized];
	return month ? { isLeapMonth, month } : null;
}

function parseLunarDayValue(value: string) {
	const numericDay = Number(value);

	if (Number.isInteger(numericDay) && numericDay >= 1 && numericDay <= 30) {
		return numericDay;
	}

	const dayIndex = LUNAR_DAY_OPTIONS.findIndex((day) => day === value);
	return dayIndex >= 0 ? dayIndex + 1 : null;
}

function getShanghaiDateParts(date: Date) {
	const formatter = new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		timeZone: SHANGHAI_TIME_ZONE,
		year: "numeric",
	});
	const parts = formatter.formatToParts(date);

	return {
		day: Number(parts.find((part) => part.type === "day")?.value),
		month: Number(parts.find((part) => part.type === "month")?.value),
		year: Number(parts.find((part) => part.type === "year")?.value),
	};
}

function createShanghaiDate(year: number, month: number, day: number) {
	const date = new Date(
		`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+08:00`
	);
	const parts = getShanghaiDateParts(date);

	if (parts.year !== year || parts.month !== month || parts.day !== day) {
		return null;
	}

	return date;
}

function startOfShanghaiDay(date: Date) {
	const parts = getShanghaiDateParts(date);
	return createShanghaiDate(parts.year, parts.month, parts.day) ?? date;
}

function addDays(date: Date, days: number) {
	return new Date(date.getTime() + days * DAY_IN_MS);
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
			timeZone: SHANGHAI_TIME_ZONE,
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
	} catch {
		// fallback
	}

	// 兜底回退：如果获取失败则使用本地时间
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}
