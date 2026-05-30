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
					<div className="rounded-md border border-border/60 bg-card p-6 shadow-none flex flex-col justify-between">
						<Heart className="size-5 text-primary stroke-[1.5]" />
						<div className="mt-6">
							<p className="text-4xl font-light tracking-tight text-primary">{loveDays}</p>
							<p className="mt-1.5 text-xs font-medium text-muted-foreground/80 tracking-wider">已经一起走过的日子</p>
						</div>
					</div>
					<div className="md:col-span-2">
						<NextAnniversary anniversaries={anniversaries} />
					</div>
				</div>
			</section>

			<section className="memory-section bg-card/30 dark:bg-card/5">
				<div className="memory-shell space-y-10">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-1">
							<p className="memory-kicker">Photos</p>
							<h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
								最近被收藏的瞬间
							</h2>
						</div>
						<Link
							className={cn(buttonVariants({ variant: "outline" }), "w-fit rounded-md text-xs tracking-wider border-border/70 hover:bg-muted/40 font-medium")}
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
				<div className="memory-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-center">
					<div className="space-y-6">
						<div className="space-y-1">
							<p className="memory-kicker">Storyline</p>
							<h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">我们的故事线</h2>
						</div>
						<p className="text-sm leading-relaxed text-muted-foreground/90 max-w-md">
							不是所有大事都需要被全世界知道，但我们可以把它们按时间排好，等以后慢慢回看。
						</p>
						<Link className={cn(buttonVariants(), "w-fit rounded-md text-xs tracking-wider font-semibold")} href="/timeline">
							<CalendarDays className="size-4" />
							看完整时间线
						</Link>
					</div>
					<TimelineList events={timeline} photos={photos} />
				</div>
			</section>

			<section className="memory-section bg-secondary/20 dark:bg-card/2">
				<div className="memory-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] items-center">
					<div className="space-y-6">
						<div className="space-y-1">
							<p className="memory-kicker">Letters</p>
							<h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">留给彼此的话</h2>
						</div>
						<p className="text-sm leading-relaxed text-muted-foreground/90 max-w-md">
							公开的可以像花一样放在门口，私密的就放进后台，只给我们自己看。
						</p>
						<Link
							className={cn(buttonVariants({ variant: "outline" }), "w-fit rounded-md text-xs tracking-wider border-border/70 hover:bg-muted/40 font-medium")}
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
