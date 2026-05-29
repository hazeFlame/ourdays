"use client";

import { type FormEvent, useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

type LoginFormProps = {
	callbackURL?: string;
};

/** 把用户名转换为虚拟邮箱，避免 better-auth 邮箱格式校验 */
function toFakeEmail(username: string): string {
	const clean = username.trim().toLowerCase().replace(/\s+/g, "_");
	return `${clean}@local`;
}

export function LoginForm({ callbackURL = "/" }: LoginFormProps) {
	const [mode, setMode] = useState<AuthMode>("sign-in");
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const resetFeedback = () => setError(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		resetFeedback();
		setIsPending(true);

		const email = toFakeEmail(username);

		const response =
			mode === "sign-in"
				? await authClient.signIn.email({
						email,
						password,
						callbackURL,
						rememberMe: true,
					})
				: await authClient.signUp.email({
						name: displayName.trim() || username.trim(),
						email,
						password,
						callbackURL,
					});

		if (response.error) {
			const msg = response.error.message ?? "";
			// 友好化常见错误提示
			if (msg.toLowerCase().includes("invalid email") || msg.toLowerCase().includes("email")) {
				setError("用户名格式有误，请只使用字母、数字或下划线。");
			} else if (msg.toLowerCase().includes("password")) {
				setError("密码至少需要 8 位。");
			} else if (msg.toLowerCase().includes("user already exists") || msg.toLowerCase().includes("already")) {
				setError("该用户名已被注册，请换一个。");
			} else if (msg.toLowerCase().includes("invalid credentials") || msg.toLowerCase().includes("not found")) {
				setError("用户名或密码错误，请重试。");
			} else {
				setError(msg || "操作失败，请稍后重试。");
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
					创建账号
				</button>
			</div>

			<form className="space-y-3" onSubmit={handleSubmit}>
				{/* 用户名 */}
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="username">
						用户名
					</label>
					<input
						autoComplete="username"
						className={inputClass}
						id="username"
						onChange={(e) => setUsername(e.target.value)}
						placeholder="只需随便起个名字"
						required
						type="text"
						value={username}
					/>
				</div>

				{/* 显示名，仅注册时显示 */}
				{mode === "sign-up" ? (
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="displayName">
							昵称 <span className="text-muted-foreground font-normal">（可选）</span>
						</label>
						<input
							autoComplete="name"
							className={inputClass}
							id="displayName"
							onChange={(e) => setDisplayName(e.target.value)}
							placeholder="后台显示的名字，默认同用户名"
							type="text"
							value={displayName}
						/>
					</div>
				) : null}

				{/* 密码 */}
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="password">
						密码
					</label>
					<input
						autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
						className={inputClass}
						id="password"
						minLength={8}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="至少 8 位"
						required
						type="password"
						value={password}
					/>
				</div>

				<Button className="w-full" disabled={isPending} type="submit">
					{mode === "sign-in" ? (
						<KeyRound className="size-4" />
					) : (
						<UserPlus className="size-4" />
					)}
					{isPending
						? "处理中..."
						: mode === "sign-in"
							? "登录"
							: "创建账号"}
				</Button>
			</form>

			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
