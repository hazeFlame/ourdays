import { LetterCard } from "@/components/letters/letter-card";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { TimelineList } from "@/components/timeline/timeline-list";
import {
	getAllLetters,
	getAllPhotos,
	getAllTimelineEvents,
} from "@/lib/content";

export default async function PrivatePage() {
	const [photos, letters, timeline] = await Promise.all([
		getAllPhotos(),
		getAllLetters(),
		getAllTimelineEvents(),
	]);

	const privatePhotos = photos.filter((photo) => photo.visibility === "private");
	const privateLetters = letters.filter((letter) => letter.visibility === "private");
	const privateTimeline = timeline.filter((event) => event.visibility === "private");

	return (
		<div className="memory-section">
			<div className="memory-shell space-y-12">
				<div className="max-w-2xl space-y-4">
					<p className="memory-kicker">Private</p>
					<h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
						只属于我们的角落
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground/90 max-w-sm">
						这里显示后台标记为私密的照片、情书和时间线事件。
					</p>
				</div>

				<section className="space-y-6">
					<h2 className="text-lg font-semibold tracking-tight text-foreground">私密照片</h2>
					{privatePhotos.length > 0 ? (
						<PhotoGrid photos={privatePhotos} />
					) : (
						<p className="rounded-md border border-border/60 bg-card p-6 text-xs text-muted-foreground/80">
							还没有私密照片。
						</p>
					)}
				</section>

				<section className="grid gap-8 lg:grid-cols-2">
					<div className="space-y-6">
						<h2 className="text-lg font-semibold tracking-tight text-foreground">私密情书</h2>
						{privateLetters.length > 0 ? (
							privateLetters.map((letter) => (
								<LetterCard key={letter.id} letter={letter} />
							))
						) : (
							<p className="rounded-md border border-border/60 bg-card p-6 text-xs text-muted-foreground/80">
								还没有私密情书。
							</p>
						)}
					</div>
					<div className="space-y-6">
						<h2 className="text-lg font-semibold tracking-tight text-foreground">私密时间线</h2>
						{privateTimeline.length > 0 ? (
							<TimelineList events={privateTimeline} photos={photos} />
						) : (
							<p className="rounded-md border border-border/60 bg-card p-6 text-xs text-muted-foreground/80">
								还没有私密时间线。
							</p>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
