"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Lock, LogOut, Menu, PenLine, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [open, setOpen] = React.useState(false);
	const [isSigningOut, setIsSigningOut] = React.useState(false);
	const user = session?.user;

	const signOut = async () => {
		setIsSigningOut(true);
		const response = await authClient.signOut();

		if (response.error) {
			setIsSigningOut(false);
			return;
		}

		window.location.href = "/";
	};

	return (
		<header className="sticky top-0 z-50 border-b border-border/80 bg-background/88 backdrop-blur-xl">
			<div className="memory-shell flex h-16 items-center justify-between gap-4">
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
					{isPending ? (
						<span className="hidden h-8 w-20 rounded-lg bg-secondary sm:block" />
					) : user ? (
						<DropdownMenu>
							<DropdownMenuTrigger
								className={cn(
									buttonVariants({ variant: "outline", size: "sm" }),
									"hidden sm:inline-flex"
								)}
							>
								<PenLine className="size-4" />
								后台
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem onClick={() => router.push("/admin")}>
									<PenLine className="size-4" />
									编辑内容
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => router.push("/profile")}>
									<User className="size-4" />
									账号
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem disabled={isSigningOut} onClick={signOut}>
									<LogOut className="size-4" />
									{isSigningOut ? "退出中..." : "退出登录"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Link
							className={cn(
								buttonVariants({ variant: "outline", size: "sm" }),
								"hidden sm:inline-flex"
							)}
							href="/login?callbackURL=/admin"
						>
							<Lock className="size-4" />
							后台入口
						</Link>
					)}

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
								<Link
									className="mt-3 rounded-lg border px-3 py-2 text-sm font-medium"
									href={user ? "/admin" : "/login?callbackURL=/admin"}
									onClick={() => setOpen(false)}
								>
									{user ? "编辑内容" : "后台入口"}
								</Link>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
