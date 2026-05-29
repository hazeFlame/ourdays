"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Menu } from "lucide-react";

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
	["照片墙", "/photos"],
	["时间线", "/timeline"],
	["纪念日", "/anniversaries"],
	["情书", "/letters"],
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<>
			{navItems.map(([label, href]) => (
				<Link
					className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
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

export function SiteHeader() {
	const [open, setOpen] = React.useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-border/80 bg-background/88 backdrop-blur-xl">
			<div className="memory-shell flex h-16 items-center justify-between gap-4">
				{/* Logo + 我们 入口 */}
				<Link className="flex items-center gap-2 font-semibold tracking-tight" href="/">
						<span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
							<Heart className="size-4 fill-current" />
						</span>
						<span>我们的小宇宙</span>
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
						<SheetContent className="w-72 bg-background p-0" side="right">
							<SheetHeader className="border-b p-4 text-left">
								<SheetTitle>
									<Link
										className="flex items-center gap-2"
										href="/"
										onClick={() => setOpen(false)}
									>
										<Heart className="size-4 fill-primary text-primary" />
										我们的小宇宙
									</Link>
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col p-4">
								<NavLinks onNavigate={() => setOpen(false)} />
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
