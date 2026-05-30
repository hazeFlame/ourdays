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
