import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const chapters = [
	{
		title: "初见",
		body: "有些人出现的时候，并不会带着很夸张的光，但后来你会发现，世界就是从那一天开始变得不一样。",
	},
	{
		title: "靠近",
		body: "我们慢慢把日常交给对方：一顿饭、一场电影、一段路，还有很多没有特意记住却舍不得忘掉的小事。",
	},
	{
		title: "成为我们",
		body: "喜欢不只是浪漫时刻，也是在普通日子里仍然选择彼此。这里会继续记录下去。",
	},
];
export default function StoryPage() {
	return (
		<div className="memory-section">
			<div className="memory-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] items-start">
				<div className="space-y-6">
					<p className="memory-kicker">Our Story</p>
					<h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
						我们的故事
					</h1>
					<Link className={cn(buttonVariants(), "w-fit rounded-md text-xs tracking-wider font-semibold")} href="/timeline">
						去看时间线
						<ArrowRight className="size-4" />
					</Link>
				</div>
				<div className="space-y-6">
					{chapters.map((chapter, index) => (
						<article className="rounded-md border border-border/60 bg-card p-6" key={chapter.title}>
							<div className="flex items-center gap-3">
								<div className="grid size-9 place-items-center rounded-md bg-secondary text-primary">
									<HeartHandshake className="size-4" />
								</div>
								<p className="text-[10px] tracking-wider font-semibold text-muted-foreground uppercase">
									Chapter {String(index + 1).padStart(2, "0")}
								</p>
							</div>
							<h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{chapter.title}</h2>
							<p className="mt-3 text-xs leading-relaxed text-muted-foreground/90">
								{chapter.body}
							</p>
						</article>
					))}
				</div>
			</div>
		</div>
	);
}
