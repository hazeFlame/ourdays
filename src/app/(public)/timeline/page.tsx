import { TimelineList } from "@/components/timeline/timeline-list";
import { getPublicTimelineEvents } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
	const events = await getPublicTimelineEvents();

	return (
		<div className="memory-section">
			<div className="memory-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
				<div className="space-y-4">
					<p className="memory-kicker">Timeline</p>
					<h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
						时间线
					</h1>
					<p className="text-lg leading-8 text-muted-foreground">
						把第一次、重要日子、旅行和那些突然变得珍贵的普通时刻按顺序放好。
					</p>
				</div>
				<TimelineList events={events} />
			</div>
		</div>
	);
}
