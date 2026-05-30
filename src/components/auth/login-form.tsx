"use client";

import { type FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type LoginFormProps = {
	callbackURL?: string;
};

/** 把用户名转换为虚拟邮箱，避免 better-auth 邮箱格式校验 */
function toFakeEmail(username: string): string {
	const clean = username.trim().toLowerCase().replace(/\s+/g, "_");
	return `${clean}@local.local`;
}

export function LoginForm({ callbackURL = "/" }: LoginFormProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsPending(true);

		const email = toFakeEmail(username);

		const response = await authClient.signIn.email({
			email,
			password,
			callbackURL,
			rememberMe: true,
		});

		if (response.error) {
			const msg = response.error.message ?? "";
			if (msg.toLowerCase().includes("invalid credentials") || msg.toLowerCase().includes("not found")) {
				setError("用户名或密码错误，请重试。");
			} else {
				setError(msg || "登录失败，请稍后重试。");
			}
			setIsPending(false);
			return;
		}

		window.location.href = callbackURL;
	};

	const inputClass =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

	return (
		<div className="space-y-4">
			<form className="space-y-3" onSubmit={handleSubmit}>
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="username">
						用户名
					</label>
					<input
						autoComplete="username"
						className={inputClass}
						id="username"
						onChange={(e) => setUsername(e.target.value)}
						placeholder="输入用户名"
						required
						type="text"
						value={username}
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="password">
						密码
					</label>
					<input
						autoComplete="current-password"
						className={inputClass}
						id="password"
						minLength={4}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="输入密码"
						required
						type="password"
						value={password}
					/>
				</div>

				<Button className="w-full" disabled={isPending} type="submit">
					<KeyRound className="size-4" />
					{isPending ? "登录中..." : "登录"}
				</Button>
			</form>

			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
