import { Quote } from "lucide-react";

import type { MemoryLetter } from "@/lib/content";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date";

export function LetterCard({ letter }: { letter: MemoryLetter }) {
	return (
		<article className="rounded-lg border bg-card p-6 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
						{letter.visibility === "private" ? "私密情书" : "公开留言"}
					</p>
					<h3 className="text-xl font-semibold">{letter.title}</h3>
				</div>
				<Quote className="size-5 shrink-0 text-primary/70" />
			</div>
			<p className="mt-5 whitespace-pre-line leading-8 text-muted-foreground">
				{letter.content}
			</p>
			<div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
				<span>{letter.author || letter.createdBy || "我们"}</span>
				<div className="text-xs text-muted-foreground/60 text-right">
					记录于 {formatDisplayDateTime(letter.createdAt)}
				</div>
			</div>
		</article>
	);
}
