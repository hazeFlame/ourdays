import Link from "next/link";
import { Lock } from "lucide-react";

import { LetterCard } from "@/components/letters/letter-card";
import { buttonVariants } from "@/components/ui/button";
import { getPublicLetters } from "@/lib/content";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LettersPage() {
	const letters = await getPublicLetters();

	return (
		<div className="memory-section">
			<div className="memory-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
				<div className="space-y-5">
					<p className="memory-kicker">Letters</p>
					<h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
						留言 / 情书
					</h1>
					<p className="text-lg leading-8 text-muted-foreground">
						这里展示公开留言。更私密的内容会留在后台，只有登录后才能编辑和查看。
					</p>
					<Link
						className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
						href="/login?callbackURL=/admin"
					>
						<Lock className="size-4" />
						进入后台
					</Link>
				</div>
				<div className="space-y-5">
					{letters.map((letter) => (
						<LetterCard key={letter.id} letter={letter} />
					))}
				</div>
			</div>
		</div>
	);
}
