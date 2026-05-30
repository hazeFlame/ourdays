import { TimelineList } from "@/components/timeline/timeline-list";
import { getPublicTimelineEvents, getPublicPhotos } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
	const [events, photos] = await Promise.all([
		getPublicTimelineEvents(),
		getPublicPhotos(100),
	]);

	return (
		<div className="memory-section">
			<div className="memory-shell space-y-8">
				<div className="space-y-4">
					<p className="memory-kicker">Timeline</p>
					<h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
						时间线
					</h1>
					<p className="text-lg leading-8 text-muted-foreground">
						我们一起走过的路，看过的风景，做过的梦。所有美好的瞬间，都在这里被记录。
					</p>
				</div>

				<TimelineList events={events} photos={photos} />
			</div>
		</div>
	);
}
