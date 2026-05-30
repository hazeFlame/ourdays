"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CalendarHeart, Images, Lock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/content";

export function HomeHero({
	loveDays,
	settings,
}: {
	loveDays: number;
	settings: SiteSettings;
}) {
	const { data: session } = authClient.useSession();
	const adminHref = session?.user ? "/admin" : "/login?callbackURL=/admin";
	return (
		<section className="relative isolate overflow-hidden">
			<div className="absolute inset-0 -z-10">
				{settings.heroImageUrl ? (
					<Image
						alt={settings.heroTitle}
						className="h-full w-full object-cover"
						fill
						sizes="100vw"
						src={settings.heroImageUrl}
						unoptimized
					/>
				) : (
					<div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#FFE0D4_0,#FFF9F4_28%,transparent_46%),linear-gradient(135deg,#FFF9F4_0%,#F7EEE8_42%,#E5EFE8_100%)]" />
				)}
				<div className="absolute inset-0 bg-background/62" />
			</div>

			<div className="memory-shell grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="max-w-2xl space-y-7"
					initial={{ opacity: 0, y: 18 }}
					transition={{ duration: 0.7, ease: "easeOut" }}
				>
					<p className="memory-kicker">{settings.coupleNames}</p>
					<div className="space-y-5">
						<h1 className="text-5xl font-semibold leading-[1.05] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
							{settings.heroTitle}
						</h1>
						<p className="max-w-xl text-lg leading-8 text-muted-foreground">
							{settings.heroSubtitle}
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link className={cn(buttonVariants({ size: "lg" }), "h-11 px-4")} href="/photos">
							<Images className="size-4" />
							看相册
						</Link>
						<Link
							className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-4")}
							href="/letters"
						>
							打开情书
							<ArrowRight className="size-4" />
						</Link>
					</div>
				</motion.div>

				<motion.div
					animate={{ opacity: 1, scale: 1 }}
					className="relative min-h-96"
					initial={{ opacity: 0, scale: 0.96 }}
					transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
				>
					<div className="absolute left-4 top-4 h-64 w-48 rotate-[-7deg] rounded-lg border border-white/70 bg-linear-to-br from-[#D96C82] via-[#E9B0A7] to-[#FFF4DF] p-4 shadow-xl" />
					<div className="absolute right-2 top-16 h-72 w-52 rotate-[6deg] rounded-lg border border-white/70 bg-linear-to-br from-[#8FAE9B] via-[#D7B377] to-[#FFF9F4] p-4 shadow-xl" />
					<Link
						href={adminHref}
						className="absolute bottom-2 left-1/2 h-72 w-56 -translate-x-1/2 rounded-lg border border-white/80 bg-card p-5 shadow-2xl transition-all duration-200 hover:shadow-3xl hover:-translate-y-1 hover:border-primary/30 group"
					>
						<div className="flex h-full flex-col justify-between rounded-md border border-dashed border-primary/30 bg-background/80 p-5 transition-colors group-hover:border-primary/60">
							<div>
								<p className="text-sm text-muted-foreground">我们已经一起走过</p>
								<p className="mt-3 text-6xl font-semibold tracking-normal text-primary">
									{loveDays}<span className="mt-1 text-sm text-muted-foreground">天</span>
								</p>

							</div>
						</div>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
