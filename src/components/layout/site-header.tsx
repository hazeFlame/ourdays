"use client";

import * as React from "react";
import Link from "next/link";
import {
	Heart,
	Menu,
	BookOpen,
	Image,
	Clock,
	CalendarHeart,
	PenLine,
	ChevronRight,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
	["故事", "/story"],
	["相册", "/photos"],
	["时间线", "/timeline"],
	["纪念日", "/anniversaries"],
	["情书", "/letters"],
] as const;

const mobileNavItems = [
	{ label: "故事", href: "/story", icon: <BookOpen className="size-4" />, desc: "我们的爱情自传" },
	{ label: "相册", href: "/photos", icon: <Image className="size-4" />, desc: "定格的甜蜜瞬间" },
	{ label: "时间线", href: "/timeline", icon: <Clock className="size-4" />, desc: "一起走过的足迹" },
	{ label: "纪念日", href: "/anniversaries", icon: <CalendarHeart className="size-4" />, desc: "每一个重要日子" },
	{ label: "情书", href: "/letters", icon: <PenLine className="size-4" />, desc: "写给彼此的悄悄话" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<>
			{navItems.map(([label, href]) => (
				<Link
					className="px-4 py-2 text-xs font-medium tracking-widest text-foreground/60 transition-colors hover:text-primary"
					href={href}
					key={href}
					onClick={onNavigate}
				>
					{label}
				</Link>
			))}
		</>
	);
}

function MobileNavLinks({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div className="grid gap-3">
			{mobileNavItems.map(({ label, href, icon, desc }) => (
				<Link
					className="flex items-center gap-4 rounded-lg border border-border/30 bg-card p-4 transition-all duration-200 active:scale-[0.98] hover:bg-muted/30"
					href={href}
					key={href}
					onClick={onNavigate}
				>
					<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
						{icon}
					</div>
					<div className="min-w-0 flex-1 space-y-0.5">
						<p className="text-xs font-semibold tracking-wider text-foreground">{label}</p>
						<p className="text-[11px] text-muted-foreground">{desc}</p>
					</div>
					<ChevronRight className="size-4 shrink-0 text-muted-foreground/30" />
				</Link>
			))}
		</div>
	);
}

export function SiteHeader() {
	const [open, setOpen] = React.useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-md">
			<div className="memory-shell flex h-16 items-center justify-between gap-4">
				{/* Logo + 我们 入口 */}
				<Link className="flex items-center gap-2.5 font-semibold tracking-tight" href="/">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
						<Heart className="size-4 fill-primary/10 stroke-[1.5]" />
					</div>
					<span className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground/90">我们的情书</span>
				</Link>

				<nav className="hidden items-center gap-1 md:flex">
					<NavLinks />
				</nav>

				<div className="flex items-center gap-2">
					<Sheet onOpenChange={setOpen} open={open}>
						<SheetTrigger
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon" }),
								"md:hidden"
							)}
						>
							<Menu className="size-5" />
							<span className="sr-only">打开菜单</span>
						</SheetTrigger>
						<SheetContent className="flex h-full w-72 flex-col bg-background p-0" side="right">
							<SheetHeader className="border-b border-border/30 p-5 text-left">
								<SheetTitle>
									<Link
										className="flex items-center gap-2.5"
										href="/"
										onClick={() => setOpen(false)}
									>
										<Heart className="size-4 fill-primary/10 text-primary stroke-[1.5]" />
										<span className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground/90">我们的情书</span>
									</Link>
								</SheetTitle>
							</SheetHeader>
							<nav className="flex-1 p-5 overflow-y-auto">
								<MobileNavLinks onNavigate={() => setOpen(false)} />
							</nav>
							<div className="mt-auto border-t border-border/30 p-6 text-center space-y-2 bg-linear-to-b from-transparent to-primary/5">
								<p className="text-[10px] tracking-[0.3em] text-primary/80 font-semibold uppercase">Our Little Universe</p>
								<p className="text-xs text-muted-foreground italic">“ 遇见你，是所有美好的开始 ”</p>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}

