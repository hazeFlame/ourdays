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
			<div className="memory-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
				<div className="space-y-6">
					<p className="memory-kicker">Our Story</p>
					<h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
						我们的故事
					</h1>
					<Link className={cn(buttonVariants(), "w-fit")} href="/timeline">
						去看时间线
						<ArrowRight className="size-4" />
					</Link>
				</div>
				<div className="space-y-5">
					{chapters.map((chapter, index) => (
						<article className="rounded-lg border bg-card p-6 shadow-sm" key={chapter.title}>
							<div className="flex items-center gap-3">
								<div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
									<HeartHandshake className="size-4" />
								</div>
								<p className="text-sm text-muted-foreground">
									Chapter {String(index + 1).padStart(2, "0")}
								</p>
							</div>
							<h2 className="mt-5 text-2xl font-semibold">{chapter.title}</h2>
							<p className="mt-3 leading-8 text-muted-foreground">
								{chapter.body}
							</p>
						</article>
					))}
				</div>
			</div>
		</div>
	);
}
