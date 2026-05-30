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
						<h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
							纪念日
						</h1>
						<p className="text-lg leading-8 text-muted-foreground">
							不怕忘记，也不随便对待。重要的日子会在这里等着我们一起靠近。
						</p>
					</div>
					<NextAnniversary anniversaries={anniversaries} />
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					{anniversaries.map((item) => (
						<article className="rounded-lg border bg-card p-6 shadow-sm" key={item.id}>
							<div className="flex items-start gap-3">
								<div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
									<CalendarHeart className="size-5" />
								</div>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="text-xl font-semibold">{item.title}</h2>
										{item.isPrimary ? (
											<span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
												主要
											</span>
										) : null}
									</div>
									<p className="mt-2 text-sm text-muted-foreground">
										{formatDisplayDate(item.date)}
									</p>
									{item.description ? (
										<p className="mt-4 leading-7 text-muted-foreground">
											{item.description}
										</p>
									) : null}
									<p className="mt-3 text-xs text-muted-foreground/60">
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
