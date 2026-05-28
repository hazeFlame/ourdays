import { MapPin } from "lucide-react";

import type { MemoryTimelineEvent } from "@/lib/content";
import { formatDisplayDate } from "@/lib/date";

export function TimelineList({
	events,
}: {
	events: MemoryTimelineEvent[];
}) {
	return (
		<div className="relative space-y-6">
			<div className="absolute left-4 top-2 h-[calc(100%-1rem)] w-px bg-border" />
			{events.map((event) => (
				<article className="relative pl-12" key={event.id}>
					<div className="absolute left-0 top-1 grid size-8 place-items-center rounded-full border bg-background">
						<div className="size-2 rounded-full bg-primary" />
					</div>
					<div className="rounded-lg border bg-card p-5 shadow-sm">
						<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span>{formatDisplayDate(event.eventDate)}</span>
							{event.location ? (
								<span className="inline-flex items-center gap-1">
									<MapPin className="size-3" />
									{event.location}
								</span>
							) : null}
							<span className="rounded-full bg-secondary px-2 py-0.5">
								{event.visibility === "private" ? "私密" : "公开"}
							</span>
						</div>
						<h3 className="mt-3 text-xl font-semibold">{event.title}</h3>
						{event.description ? (
							<p className="mt-2 leading-7 text-muted-foreground">
								{event.description}
							</p>
						) : null}
					</div>
				</article>
			))}
		</div>
	);
}
