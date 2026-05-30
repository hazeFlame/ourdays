import { CalendarHeart } from "lucide-react";

import { NextAnniversary } from "@/components/home/next-anniversary";
import { getAnniversaries } from "@/lib/content";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AnniversariesPage() {
	const anniversaries = await getAnniversaries();

	return (
		<div className="memory-section">
			<div className="memory-shell space-y-8">
				<div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
					<div className="space-y-4">
						<p className="memory-kicker">Anniversaries</p>
						<h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
							纪念日
						</h1>
						<p className="text-sm leading-relaxed text-muted-foreground/90 max-w-sm">
							不怕忘记，也不随便对待。重要的日子会在这里等着我们一起靠近。
						</p>
					</div>
					<NextAnniversary anniversaries={anniversaries} />
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					{anniversaries.map((item) => (
						<article className="rounded-md border border-border/60 bg-card p-6" key={item.id}>
							<div className="flex items-start gap-4">
								<div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
									<CalendarHeart className="size-5" />
								</div>
								<div className="min-w-0 space-y-2">
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="text-base font-semibold tracking-tight text-foreground">{item.title}</h2>
										{item.isPrimary ? (
											<span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase">
												主要
											</span>
										) : null}
									</div>
									<p className="text-xs text-muted-foreground/80">
										{formatDisplayDate(item.date)}
									</p>
									{item.description ? (
										<p className="text-xs leading-relaxed text-muted-foreground/90 pt-1">
											{item.description}
										</p>
									) : null}
									<p className="text-[10px] text-muted-foreground/50 pt-2 border-t border-border/30">
										记录于 {formatDisplayDateTime(item.createdAt)}
									</p>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</div>
	);
}
