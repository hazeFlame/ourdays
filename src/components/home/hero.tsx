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
					<div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(230,46,101,0.15)_0,transparent_45%),linear-gradient(135deg,var(--background)_0%,#fcf2f5_40%,#f7e6eb_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(230,46,101,0.18)_0,transparent_40%),linear-gradient(135deg,#0f0914_0%,#180e21_100%)]" />
				)}
				<div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
			</div>

			<div className="memory-shell grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="max-w-2xl space-y-8"
					initial={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<p className="memory-kicker tracking-[0.3em] text-primary/80 font-medium text-xs uppercase">{settings.coupleNames}</p>
					<div className="space-y-4">
						<h1 className="text-4xl font-light leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							{settings.heroTitle}
						</h1>
						<p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
							{settings.heroSubtitle}
						</p>
					</div>
					<div className="flex flex-wrap gap-4 pt-2">
						<Link className={cn(buttonVariants({ size: "lg" }), "h-10 px-5 rounded-md text-xs tracking-widest uppercase font-semibold")} href="/photos">
							<Images className="size-4" />
							看相册
						</Link>
						<Link
							className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-5 rounded-md text-xs tracking-widest uppercase font-semibold border-border/70 hover:bg-muted/40")}
							href="/letters"
						>
							打开情书
							<ArrowRight className="size-4" />
						</Link>
					</div>
				</motion.div>

				<motion.div
					animate={{ opacity: 1, scale: 1 }}
					className="relative min-h-[420px] flex items-center justify-center"
					initial={{ opacity: 0, scale: 0.98 }}
					transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
				>
					{/* Decorative minimal card 1 */}
					<div className="absolute left-6 top-8 h-64 w-48 rotate-[-6deg] rounded-md border border-border/30 bg-gradient-to-br from-[#f8e5ec] to-[#e8c6d4] dark:from-[#2a132c] dark:to-[#180d19] p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-none" />
					{/* Decorative minimal card 2 */}
					<div className="absolute right-4 top-16 h-72 w-52 rotate-[5deg] rounded-md border border-border/30 bg-gradient-to-br from-[#f2daf0] via-[#e4c4e0] to-[#cb9dc3] dark:from-[#331737] dark:via-[#261029] dark:to-[#160a17] p-4 shadow-[0_12px_36px_-15px_rgba(0,0,0,0.12)] dark:shadow-none" />
					
					{/* Main love days tracker card */}
					<Link
						href={adminHref}
						className="absolute bottom-6 left-1/2 h-72 w-56 -translate-x-1/2 rounded-md border border-border/60 bg-card p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] dark:shadow-none transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] hover:-translate-y-1.5 hover:border-primary/40 group"
					>
						<div className="flex h-full flex-col justify-between rounded-sm border border-dashed border-border bg-background/30 p-5 transition-colors group-hover:border-primary/30">
							<div className="space-y-4">
								<p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/80">我们已经一起走过</p>
								<div className="space-y-0.5">
									<p className="text-6xl font-light tracking-tighter text-primary">
										{loveDays}
									</p>
									<p className="text-xs tracking-wider text-muted-foreground font-medium">DAYS</p>
								</div>
							</div>
							<div className="text-[10px] tracking-wider text-primary/80 font-medium border-t border-border/40 pt-4 flex items-center justify-between">
								<span>ENTER BACKSTAGE</span>
								<ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
							</div>
						</div>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
