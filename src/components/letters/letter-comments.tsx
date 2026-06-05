"use client";

import { useEffect, useState } from "react";
import { Send, Loader2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { formatDisplayDateTime } from "@/lib/date";

type Comment = {
	id: string;
	letterId: string;
	author: string;
	content: string;
	createdAt: string | Date;
};

export function LetterComments({ letterId }: { letterId: string }) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);

	const { data: session } = authClient.useSession();
	const user = session?.user;

	// Fetch comments
	const fetchComments = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/letters/${letterId}/comments`);
			if (!res.ok) throw new Error("获取留言失败");
			const data = await res.json() as Comment[];
			setComments(data);
		} catch (err: any) {
			setError(err.message || "获取留言失败，请重试。");
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch on mount
	useEffect(() => {
		fetchComments();
	}, [letterId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		setIsSubmitting(true);
		setError(null);

		const finalAuthor = user ? (user.name || "登录用户") : "调皮的游客";

		try {
			const res = await fetch(`/api/letters/${letterId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					author: finalAuthor,
					content: content.trim(),
				}),
			});

			if (!res.ok) {
				const errData = await res.json().catch(() => ({})) as { error?: string };
				throw new Error(errData.error || "提交留言失败");
			}

			const newComment = await res.json() as Comment;
			setComments((prev) => [...prev, newComment]);
			setContent("");
		} catch (err: any) {
			setError(err.message || "提交留言失败，请重试。");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mt-3 pt-3 border-t border-border/40 space-y-3">
			{/* Comments List */}
			{comments.length > 0 && (
				<div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
					{comments.map((comment) => (
						<div
							key={comment.id}
							className="rounded bg-muted/20 p-2 text-[11px] border border-border/10 animate-in fade-in duration-200"
						>
							<div className="flex items-center justify-between gap-2 mb-1">
								<div className="flex items-center gap-1 font-semibold text-foreground/80">
									<User className="size-2.5 text-primary/70" />
									{comment.author}
								</div>
								<span className="text-[9px] text-muted-foreground/45">
									{formatDisplayDateTime(comment.createdAt)}
								</span>
							</div>
							<p className="text-muted-foreground/90 whitespace-pre-line leading-relaxed text-[11px]">
								{comment.content}
							</p>
						</div>
					))}
				</div>
			)}

			{isLoading && comments.length === 0 && (
				<div className="flex items-center justify-center py-2 text-muted-foreground/60 text-[11px] gap-1.5">
					<Loader2 className="size-3 animate-spin" />
					加载留言中...
				</div>
			)}

			{/* Post Comment Form */}
			<form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-border/15">
				<div className="flex gap-2">


					<div className="flex-1 flex gap-2 items-end">
						<textarea
							placeholder="写下你的留言..."
							value={content}
							onChange={(e) => setContent(e.target.value)}
							required
							rows={1}
							className="flex min-h-[28px] max-h-[60px] h-7 w-full rounded border border-input bg-background px-2.5 py-1 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(e);
								}
							}}
						/>
						<Button
							type="submit"
							disabled={isSubmitting || !content.trim()}
							size="icon-xs"
							className="h-7 w-7 rounded shrink-0"
						>
							{isSubmitting ? (
								<Loader2 className="size-2.5 animate-spin" />
							) : (
								<Send className="size-2.5" />
							)}
						</Button>
					</div>
				</div>
				{error && (
					<p className="text-[9px] text-destructive animate-in fade-in duration-150">
						{error}
					</p>
				)}
			</form>
		</div>
	);
}
