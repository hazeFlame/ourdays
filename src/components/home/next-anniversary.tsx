"use client";

import { useMemo } from "react";
import { CalendarHeart } from "lucide-react";

import type { MemoryAnniversary } from "@/lib/content";
import { getNextAnniversary } from "@/lib/content";
import { formatDisplayDate } from "@/lib/date";

export function NextAnniversary({
	anniversaries,
}: {
	anniversaries: MemoryAnniversary[];
}) {
	const next = useMemo(() => getNextAnniversary(anniversaries), [anniversaries]);

	if (!next) {
		return (
			<div className="rounded-lg border bg-card p-5">
				<p className="text-sm text-muted-foreground">还没有设置纪念日。</p>
			</div>
		);
	}

	const daysLeft = Math.max(
		0,
		Math.ceil(
			(next.nextDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
		)
	);

	return (
		<div className="rounded-lg border bg-card p-5 shadow-sm">
			<div className="flex items-start gap-3">
				<div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
					<CalendarHeart className="size-5" />
				</div>
				<div className="min-w-0 space-y-2">
					<p className="text-sm text-muted-foreground">下一个纪念日</p>
					<h3 className="text-xl font-semibold">{next.item.title}</h3>
					<p className="text-sm text-muted-foreground">
						{formatDisplayDate(next.nextDate)}，还有 {daysLeft} 天
					</p>
					{next.item.description ? (
						<p className="text-sm leading-6 text-muted-foreground">
							{next.item.description}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
