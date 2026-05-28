import Link from "next/link";
import { Mail, PenLine, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
	const session = await requireSession();
	const { user } = session;

	return (
		<div className="memory-section">
			<div className="memory-shell max-w-3xl space-y-6">
				<div className="space-y-3">
					<p className="memory-kicker">Account</p>
					<h1 className="text-4xl font-semibold tracking-normal">后台账号</h1>
					<p className="text-muted-foreground">
						这个账号用于进入后台，维护公开展示内容和私密收藏。
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShieldCheck className="size-4 text-primary" />
							登录信息
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">名称</span>
							<span>{user.name || "未设置"}</span>
						</div>
						<div className="flex items-center justify-between gap-4">
							<span className="flex items-center gap-2 text-muted-foreground">
								<Mail className="size-4" />
								邮箱
							</span>
							<span className="max-w-60 truncate">{user.email}</span>
						</div>
					</CardContent>
				</Card>

				<Link className={cn(buttonVariants(), "w-fit")} href="/admin">
						<PenLine className="size-4" />
						进入后台编辑
				</Link>
			</div>
		</div>
	);
}
