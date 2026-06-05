import { Quote } from "lucide-react";

import type { MemoryLetter } from "@/lib/content";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date";
import { LetterComments } from "./letter-comments";

export function LetterCard({ letter }: { letter: MemoryLetter }) {
	return (
		<article className="rounded-md border border-border/60 bg-card p-6">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="text-[10px] font-semibold uppercase tracking-widest text-primary/85">
						{letter.visibility === "private" ? "私密情书" : "公开留言"}
					</p>
					<h3 className="text-lg font-semibold tracking-tight text-foreground">{letter.title}</h3>
				</div>
				<Quote className="size-4.5 shrink-0 text-primary/60" />
			</div>
			<p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground/90">
				{letter.content}
			</p>
			<div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
				<span className="font-semibold tracking-wide">{letter.author || letter.createdBy || "我们"}</span>
				<div className="text-[10px] text-muted-foreground/50 text-right">
					记录于 {formatDisplayDateTime(letter.createdAt)}
				</div>
			</div>
			<LetterComments letterId={letter.id} />
		</article>
	);
}
