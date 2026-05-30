import { MapPin, UserCircle2 } from "lucide-react";

import type { MemoryTimelineEvent } from "@/lib/content";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date";

export function TimelineList({
	events,
}: {
	events: MemoryTimelineEvent[];
}) {
	return (
		<div className="relative flex flex-row overflow-x-auto gap-4 pb-4 sm:flex-col sm:space-y-6 sm:overflow-x-visible sm:pb-0 scroll-smooth">
			<div className="absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-px bg-border sm:block" />
			{events.map((event, index) => (
				<article className="relative w-[300px] shrink-0 pl-0 sm:w-auto sm:shrink sm:pl-12" key={event.id}>
					{/* 移动端横排拼接时间轴线及小圆点 */}
					<div className="relative flex items-center justify-center h-8 mb-2 sm:hidden">
						{/* 左半段线：第一张卡片不显示 */}
						{index > 0 && <div className="absolute left-0 right-1/2 top-1/2 h-px bg-border" />}
						{/* 右半段线：最后一张卡片不显示 */}
						{index < events.length - 1 && <div className="absolute left-1/2 right-0 top-1/2 h-px bg-border" />}
						{/* 圆心 */}
						<div className="z-10 grid size-6 place-items-center rounded-full border bg-background">
							<div className="size-2 rounded-full bg-primary" />
						</div>
					</div>

					{/* 桌面端直立时间轴圆点：仅在桌端显示 */}
					<div className="absolute left-0 top-1 hidden size-8 place-items-center rounded-full border bg-background sm:grid">
						<div className="size-2 rounded-full bg-primary" />
					</div>

					<div className="rounded-lg border bg-card p-5 shadow-sm">
						<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							{event.location ? (
								<span className="inline-flex items-center gap-1">
									<MapPin className="size-3" />
									{event.location}
								</span>
							) : null}
							<span className="rounded-full bg-secondary px-2 py-0.5">
								{event.visibility === "private" ? "私密" : "公开"}
							</span>
							<span className="text-muted-foreground/60">记录于 {formatDisplayDateTime(event.createdAt)}</span>
						</div>
						<h3 className="mt-3 text-lg font-semibold">{event.title}</h3>
						{event.description ? (
							<p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-line">
								{event.description}
							</p>
						) : null}
						{event.createdBy ? (
							<p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-2">
								<UserCircle2 className="size-3" />
								由 {event.createdBy} 记录
							</p>
						) : null}
					</div>
				</article>
			))}
		</div>
	);
}
