"use client";

import { useMemo } from "react";
import { CalendarHeart } from "lucide-react";

import type { MemoryAnniversary } from "@/lib/content";
import { getNextAnniversary } from "@/lib/content";
import {
	formatAnniversaryDisplayDate,
	formatDisplayDate,
	getAnniversaryTypeLabel,
	isLunarAnniversaryType,
} from "@/lib/date";

export function NextAnniversary({
	anniversaries,
}: {
	anniversaries: MemoryAnniversary[];
}) {
	const next = useMemo(() => getNextAnniversary(anniversaries), [anniversaries]);

	if (!next) {
		return (
			<div className="rounded-md border border-border/60 bg-card p-6">
				<p className="text-xs tracking-wider text-muted-foreground">还没有设置纪念日。</p>
			</div>
		);
	}

	const daysLeft = Math.max(
		0,
		Math.ceil(
			(next.nextDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
		)
	);
	const showOriginalDate = isLunarAnniversaryType(next.item.type);

	return (
		<div className="rounded-md border border-border/60 bg-card p-6">
			<div className="flex items-start gap-4">
				<div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
					<CalendarHeart className="size-5" />
				</div>
				<div className="min-w-0 space-y-2">
					<p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/80">下一个纪念日</p>
					<h3 className="text-lg font-semibold tracking-tight text-foreground">{next.item.title}</h3>
					<p className="text-xs text-muted-foreground font-medium">
						{formatDisplayDate(next.nextDate)}，还有 <span className="text-primary font-bold text-sm">{daysLeft}</span> 天
					</p>
					{showOriginalDate ? (
						<p className="text-[10px] text-muted-foreground/70">
							{formatAnniversaryDisplayDate(next.item.date, next.item.type)} · {getAnniversaryTypeLabel(next.item.type)}
						</p>
					) : null}
					{next.item.description ? (
						<p className="text-xs leading-relaxed text-muted-foreground/95 pt-1">
							{next.item.description}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
