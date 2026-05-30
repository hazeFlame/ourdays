import { Quote } from "lucide-react";

import type { MemoryLetter } from "@/lib/content";
import { formatDisplayDate } from "@/lib/date";

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
				<span>{letter.author || "我们"}</span>
				<div className="flex flex-col items-end gap-0.5 text-right">
					<span>{formatDisplayDate(letter.writtenAt ?? letter.createdAt)}</span>
					{letter.writtenAt ? (
						<span className="text-xs text-muted-foreground/60">记录于 {formatDisplayDate(letter.createdAt)}</span>
					) : null}
				</div>
			</div>
		</article>
	);
}
