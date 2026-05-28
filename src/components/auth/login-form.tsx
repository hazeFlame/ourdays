"use client";

import { type FormEvent, useState } from "react";
import { Mail, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

type LoginFormProps = {
	callbackURL?: string;
};

export function LoginForm({ callbackURL = "/" }: LoginFormProps) {
	const [mode, setMode] = useState<AuthMode>("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const resetFeedback = () => {
		setError(null);
	};

	const submitEmailForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		resetFeedback();
		setIsPending(true);

		const response =
			mode === "sign-in"
				? await authClient.signIn.email({
						email,
						password,
						callbackURL,
						rememberMe: true,
					})
				: await authClient.signUp.email({
						name: name || email.split("@")[0],
						email,
						password,
						callbackURL,
					});

		if (response.error) {
			setError(response.error.message || "无法继续，请检查邮箱和密码。");
			setIsPending(false);
			return;
		}

		window.location.href = callbackURL;
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 rounded-lg border bg-muted p-1">
				<button
					className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
						mode === "sign-in"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground"
					}`}
					onClick={() => {
						setMode("sign-in");
						resetFeedback();
					}}
					type="button"
				>
					登录
				</button>
				<button
					className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
						mode === "sign-up"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground"
					}`}
					onClick={() => {
						setMode("sign-up");
						resetFeedback();
					}}
					type="button"
				>
					创建入口
				</button>
			</div>

			<form className="space-y-3" onSubmit={submitEmailForm}>
				{mode === "sign-up" ? (
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="name">
							名字
						</label>
						<input
							autoComplete="name"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
							id="name"
							onChange={(event) => setName(event.target.value)}
							placeholder="后台显示名"
							value={name}
						/>
					</div>
				) : null}

				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="email">
						邮箱
					</label>
					<input
						autoComplete="email"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						id="email"
						onChange={(event) => setEmail(event.target.value)}
						placeholder="you@example.com"
						required
						type="email"
						value={email}
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="password">
						密码
					</label>
					<input
						autoComplete={
							mode === "sign-in" ? "current-password" : "new-password"
						}
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						id="password"
						minLength={8}
						onChange={(event) => setPassword(event.target.value)}
						placeholder="至少 8 位"
						required
						type="password"
						value={password}
					/>
				</div>

				<Button className="w-full" disabled={isPending} type="submit">
					{mode === "sign-in" ? (
						<Mail className="size-4" />
					) : (
						<UserPlus className="size-4" />
					)}
					{isPending
						? "处理中..."
						: mode === "sign-in"
							? "用邮箱登录"
							: "创建后台账号"}
				</Button>
			</form>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
