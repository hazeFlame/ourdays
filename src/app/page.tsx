import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, PenLine } from "lucide-react";

import { HomeHero } from "@/components/home/hero";
import { NextAnniversary } from "@/components/home/next-anniversary";
import { LetterCard } from "@/components/letters/letter-card";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { TimelineList } from "@/components/timeline/timeline-list";
import {
	getAnniversaries,
	getLoveDays,
	getPublicLetters,
	getPublicPhotos,
	getPublicTimelineEvents,
	getSiteSettings,
} from "@/lib/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
	const [settings, photos, letters, timeline, anniversaries] = await Promise.all([
		getSiteSettings(),
		getPublicPhotos(20),
		getPublicLetters(1),
		getPublicTimelineEvents(3),
		getAnniversaries(),
	]);
	const loveDays = getLoveDays(settings.loveStartDate);

	return (
		<div>
			<HomeHero loveDays={loveDays} settings={settings} />

			<section className="memory-section">
				<div className="memory-shell grid gap-6 md:grid-cols-3">
					<div className="rounded-lg border bg-card p-6 shadow-sm">
						<Heart className="size-5 text-primary" />
						<p className="mt-4 text-3xl font-semibold">{loveDays}</p>
						<p className="mt-2 text-sm text-muted-foreground">已经一起走过的日子</p>
					</div>
					<div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-2">
						<NextAnniversary anniversaries={anniversaries} />
					</div>
				</div>
			</section>

			<section className="memory-section bg-[#FFFDF9]">
				<div className="memory-shell space-y-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="memory-kicker">Photos</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-normal">
								最近被收藏的瞬间
							</h2>
						</div>
						<Link
							className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
							href="/photos"
						>
							全部照片
							<ArrowRight className="size-4" />
						</Link>
					</div>
					<PhotoGrid maxGroups={3} photos={photos} />
				</div>
			</section>

			<section className="memory-section">
				<div className="memory-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
					<div className="space-y-5">
						<p className="memory-kicker">Storyline</p>
						<h2 className="text-3xl font-semibold tracking-normal">我们的故事线</h2>
						<p className="leading-8 text-muted-foreground">
							不是所有大事都需要被全世界知道，但我们可以把它们按时间排好，等以后慢慢回看。
						</p>
						<Link className={cn(buttonVariants(), "w-fit")} href="/timeline">
							<CalendarDays className="size-4" />
							看完整时间线
						</Link>
					</div>
					<TimelineList events={timeline} />
				</div>
			</section>

			<section className="memory-section bg-[#F7EEE8]">
				<div className="memory-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
					<div className="space-y-5">
						<p className="memory-kicker">Letters</p>
						<h2 className="text-3xl font-semibold tracking-normal">留给彼此的话</h2>
						<p className="leading-8 text-muted-foreground">
							公开的可以像花一样放在门口，私密的就放进后台，只给我们自己看。
						</p>
						<Link
							className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
							href="/letters"
						>
							<PenLine className="size-4" />
							打开情书
						</Link>
					</div>
					<div className="space-y-4">
						{letters.map((letter) => (
							<LetterCard key={letter.id} letter={letter} />
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
