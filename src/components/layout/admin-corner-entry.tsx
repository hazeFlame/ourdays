"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function AdminCornerEntry() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	return (
		<Link
			href={user ? "/admin" : "/login?callbackURL=/admin"}
			className="text-xs font-medium text-foreground/50 transition-colors hover:text-foreground"
		>
			我们
		</Link>
	);
}
