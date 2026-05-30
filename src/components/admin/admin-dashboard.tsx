"use client";

import { useState, useRef, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
	CalendarHeart,
	Check,
	ImagePlus,
	LayoutDashboard,
	Loader2,
	LogOut,
	PenLine,
	Plus,
	Settings,
	Trash2,
	User,
	X,
	Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
	createAnniversary,
	createLetter,
	createPhoto,
	createTimelineEvent,
	deleteAnniversary,
	deleteLetter,
	deletePhoto,
	deleteTimelineEvent,
	updateAnniversary,
	updateLetter,
	updatePhoto,
	updateSettings,
	updateTimelineEvent,
} from "@/lib/actions/content";
import type {
	MemoryAnniversary,
	MemoryLetter,
	MemoryPhoto,
	MemoryTimelineEvent,
	SiteSettings,
} from "@/lib/content";
import { compressAndConvertToWebp } from "@/lib/image-compress";
import { toDateInputValue } from "@/lib/date";

type AdminDashboardProps = {
	anniversaries: MemoryAnniversary[];
	letters: MemoryLetter[];
	photos: MemoryPhoto[];
	settings: SiteSettings;
	timeline: MemoryTimelineEvent[];
};

export type UploadItem = {
	id: string;
	preview: string;
	file: File;
	compressed: File | null;
	progress?: number;
	status?: "waiting" | "compressing" | "uploading" | "success" | "error";
};

type ActionResult = {
	error?: string;
	ok?: boolean;
};

type Tab = "photos" | "letters" | "timeline" | "anniversaries" | "settings";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
	{ id: "photos", label: "照片", icon: <ImagePlus className="size-4" /> },
	{ id: "letters", label: "情书", icon: <PenLine className="size-4" /> },
	{ id: "timeline", label: "时间线", icon: <Clock className="size-4" /> },
	{ id: "anniversaries", label: "纪念日", icon: <CalendarHeart className="size-4" /> },
	{ id: "settings", label: "站点设置", icon: <Settings className="size-4" /> },
];

function getString(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

function getFile(formData: FormData, key: string) {
	const value = formData.get(key);
	return value instanceof File && value.size > 0 ? value : null;
}

const inputClass =
	"h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40";
const textareaClass =
	"min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition resize-none focus-visible:ring-2 focus-visible:ring-ring/40";
const selectClass =
	"h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40";

function Field({
	children,
	label,
	hint,
}: {
	children: React.ReactNode;
	label: string;
	hint?: string;
}) {
	return (
		<label className="space-y-1.5 text-sm font-medium">
			<span className="text-foreground">{label}</span>
			{children}
			{hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
		</label>
	);
}

// Image upload with preview
function ImageUpload({
	name,
	label,
	existingUrl,
	multiple,
	files = [],
	onChange,
}: {
	name: string;
	label: string;
	existingUrl?: string | null;
	multiple?: boolean;
	files?: UploadItem[];
	onChange?: (files: UploadItem[]) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isCompressing, setIsCompressing] = useState(false);

	const [singlePreview, setSinglePreview] = useState<string | null>(existingUrl ?? null);
	const singleCompressedRef = useRef<File | null>(null);

	const updateInputFiles = (filesList: File[]) => {
		if (!inputRef.current) return;
		try {
			const dataTransfer = new DataTransfer();
			filesList.forEach((file) => {
				dataTransfer.items.add(file);
			});
			inputRef.current.files = dataTransfer.files;
		} catch (err) {
			console.error("Failed to set files via DataTransfer:", err);
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		if (selectedFiles.length === 0) return;

		if (multiple) {
			const newItems = selectedFiles.map((file) => ({
				id: Math.random().toString(36).substring(2, 9),
				preview: URL.createObjectURL(file),
				file,
				compressed: null as File | null,
				status: "compressing" as const,
			}));

			const updatedFiles = [...files, ...newItems];
			onChange?.(updatedFiles);
			setIsCompressing(true);

			const compressedItems = await Promise.all(
				newItems.map(async (item) => {
					try {
						const compressed = await compressAndConvertToWebp(item.file, 0.8, 1200);
						return { ...item, compressed, status: "waiting" as const };
					} catch {
						return { ...item, status: "waiting" as const };
					}
				})
			);

			const finalFiles = updatedFiles.map((p) => {
				const match = compressedItems.find((u) => u.id === p.id);
				return match ? match : p;
			});
			onChange?.(finalFiles);
			updateInputFiles(finalFiles.map((m) => m.compressed || m.file));
			setIsCompressing(false);
		} else {
			const file = selectedFiles[0];
			const objectUrl = URL.createObjectURL(file);
			setSinglePreview(objectUrl);
			setIsCompressing(true);
			try {
				const compressed = await compressAndConvertToWebp(file, 0.8, 1200);
				singleCompressedRef.current = compressed;
				updateInputFiles([compressed]);
			} catch {
				singleCompressedRef.current = file;
				updateInputFiles([file]);
			} finally {
				setIsCompressing(false);
			}
		}
	};

	const removeMultipleItem = (id: string) => {
		const filtered = files.filter((item) => item.id !== id);
		onChange?.(filtered);
		updateInputFiles(filtered.map((m) => m.compressed || m.file));
	};

	const clearSinglePreview = () => {
		setSinglePreview(null);
		singleCompressedRef.current = null;
		if (inputRef.current) inputRef.current.value = "";
	};

	if (multiple) {
		return (
			<div className="space-y-3">
				<span className="text-sm font-medium text-foreground">{label}</span>
				<input
					ref={inputRef}
					accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
					className="hidden"
					name={name}
					onChange={handleFileChange}
					type="file"
					multiple
				/>

				{files.length > 0 ? (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
						{files.map((item) => (
							<div key={item.id} className="relative aspect-square overflow-hidden rounded-xl border bg-muted group">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									alt="预览"
									className="h-full w-full object-cover"
									src={item.preview}
								/>
								
								{item.status === "compressing" && (
									<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white text-xs gap-1">
										<Loader2 className="size-4 animate-spin text-white" />
										<span>压缩中...</span>
									</div>
								)}
								{item.status === "uploading" && (
									<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-xs gap-1">
										<Loader2 className="size-4 animate-spin text-primary" />
										<span className="font-semibold">{item.progress || 0}%</span>
									</div>
								)}
								{item.status === "success" && (
									<div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/80 text-white text-xs gap-1">
										<Check className="size-6" />
										<span>成功</span>
									</div>
								)}
								{item.status === "error" && (
									<div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/80 text-white text-xs gap-1">
										<X className="size-6" />
										<span>失败</span>
									</div>
								)}

								<button
									className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
									onClick={() => removeMultipleItem(item.id)}
									type="button"
								>
									<X className="size-3.5" />
								</button>
							</div>
						))}
						<button
							className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/10 text-muted-foreground transition hover:border-primary/50 hover:bg-muted/30"
							onClick={() => inputRef.current?.click()}
							type="button"
						>
							<Plus className="size-6" />
							<span className="text-xs">添加更多</span>
						</button>
					</div>
				) : (
					<button
						className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary/50 hover:bg-muted/60"
						onClick={() => inputRef.current?.click()}
						type="button"
					>
						<ImagePlus className="size-8" />
						<span className="text-sm">点击选择多张图片</span>
						<span className="text-xs">自动压缩为 WebP · 支持批量上传</span>
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<span className="text-sm font-medium text-foreground">{label}</span>
			<input
				ref={inputRef}
				accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
				className="hidden"
				name={name}
				onChange={handleFileChange}
				type="file"
			/>
			{singlePreview ? (
				<div className="relative overflow-hidden rounded-xl border bg-muted">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						alt="预览"
						className="max-h-56 w-full object-cover"
						src={singlePreview}
					/>
					{isCompressing ? (
						<div className="absolute inset-0 flex items-center justify-center bg-black/40">
							<Loader2 className="size-6 animate-spin text-white" />
							<span className="ml-2 text-sm text-white">压缩中...</span>
						</div>
					) : null}
					<button
						className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
						onClick={clearSinglePreview}
						type="button"
					>
						<X className="size-4" />
					</button>
				</div>
			) : (
				<button
					className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary/50 hover:bg-muted/60"
					onClick={() => inputRef.current?.click()}
					type="button"
				>
					<ImagePlus className="size-8" />
					<span className="text-sm">点击选择图片</span>
					<span className="text-xs">自动压缩为 WebP · 最大边 1200px</span>
				</button>
			)}
			{!singlePreview && (
				<Button
					className="w-full"
					onClick={() => inputRef.current?.click()}
					size="sm"
					type="button"
					variant="outline"
				>
					选择图片
				</Button>
			)}
		</div>
	);
}

// ── Toast system ──────────────────────────────────────
type ToastItem = { id: number; message: string; isError: boolean };

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
	return (
		<div className="fixed right-3 top-16 z-[100] flex flex-col gap-2 w-[calc(100vw-1.5rem)] max-w-sm pointer-events-none sm:right-4 sm:top-20 sm:w-80">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ring-1 animate-in slide-in-from-right-4 fade-in duration-300 ${
						t.isError
							? "bg-white ring-destructive/20 text-destructive dark:bg-zinc-900"
							: "bg-white ring-green-200 text-green-800 dark:bg-zinc-900 dark:ring-green-800 dark:text-green-400"
					}`}
				>
					<span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
						t.isError ? "bg-destructive/10" : "bg-green-100 dark:bg-green-900/40"
					}`}>
						{t.isError
							? <X className="size-3" />
							: <Check className="size-3" />}
					</span>
					<span className="flex-1 leading-5">{t.message}</span>
					<button
						className="mt-0.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
						onClick={() => onDismiss(t.id)}
						type="button"
					>
						<X className="size-3.5" />
					</button>
				</div>
			))}
		</div>
	);
}

export function AdminDashboard({
	anniversaries,
	letters,
	photos,
	settings,
	timeline,
}: AdminDashboardProps) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const displayName = user?.name || user?.email?.split("@")[0] || "用户";

	const signOut = async () => {
		await authClient.signOut();
		window.location.href = "/";
	};
	const [activeTab, setActiveTab] = useState<Tab>("photos");
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const [isPending, setIsPending] = useState(false);
	const [uploadFiles, setUploadFiles] = useState<UploadItem[]>([]);
	const toastIdRef = useRef(0);

	const pushToast = useCallback((message: string, isError: boolean) => {
		const id = ++toastIdRef.current;
		setToasts((prev) => [...prev, { id, message, isError }]);
		setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
	}, []);

	const dismissToast = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const runAction = async (
		action: Promise<ActionResult>,
		successMessage: string,
		form?: HTMLFormElement
	) => {
		setIsPending(true);
		const result = await action;
		setIsPending(false);

		if (result.error) {
			pushToast(result.error, true);
			return;
		}

		form?.reset();
		pushToast(successMessage, false);
		router.refresh();
	};

	const uploadFile = (
		file: File,
		kind: string,
		onProgress?: (percent: number) => void
	): Promise<string> => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const body = new FormData();
			body.set("file", file);
			body.set("kind", kind);

			xhr.open("POST", "/api/uploads");

			if (xhr.upload && onProgress) {
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const percent = Math.round((event.loaded / event.total) * 100);
						onProgress(percent);
					}
				};
			}

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const payload = JSON.parse(xhr.responseText) as { error?: string; url?: string };
						if (payload.url) {
							resolve(payload.url);
						} else {
							reject(new Error(payload.error || "上传结果缺少图片地址。"));
						}
					} catch {
						reject(new Error("解析服务器响应失败。"));
					}
				} else {
					try {
						const payload = JSON.parse(xhr.responseText) as { error?: string };
						reject(new Error(payload.error || "图片上传失败。"));
					} catch {
						reject(new Error(`图片上传失败，状态码: ${xhr.status}`));
					}
				}
			};

			xhr.onerror = () => {
				reject(new Error("网络连接失败。"));
			};

			xhr.send(body);
		});
	};

	/** 校验必填字段，任意一项为空时推送 toast 并返回 false */
	const validate = (rules: { value: string; label: string }[]): boolean => {
		for (const { value, label } of rules) {
			if (!value.trim()) {
				pushToast(`「${label}」不能为空`, true);
				return false;
			}
		}
		return true;
	};

	const submitPhoto = async (event: FormEvent<HTMLFormElement>, id?: string) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const title = getString(formData, "title");
		const visibility = getString(formData, "visibility") || "public";

		if (id) {
			const file = getFile(formData, "image");
			let imageUrl = "";
			try {
				if (file) {
					imageUrl = await uploadFile(file, visibility === "private" ? "private" : "photo");
				}
			} catch (error) {
				pushToast(error instanceof Error ? error.message : "图片上传失败。", true);
				return;
			}

			const input = {
				description: getString(formData, "description"),
				imageUrl,
				location: getString(formData, "location"),
				sortOrder: getString(formData, "sortOrder"),
				takenAt: getString(formData, "takenAt"),
				title,
				visibility,
			};

			await runAction(
				updatePhoto(id, input),
				"照片已更新。"
			);
		} else {
			if (uploadFiles.length === 0) {
				pushToast("请先选择照片。", true);
				return;
			}

			setIsPending(true);
			let successCount = 0;
			let failCount = 0;

			for (let i = 0; i < uploadFiles.length; i++) {
				const item = uploadFiles[i];

				setUploadFiles((prev) =>
					prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 0 } : f))
				);

				const fileToUpload = item.compressed || item.file;
				try {
					const imageUrl = await uploadFile(
						fileToUpload,
						visibility === "private" ? "private" : "photo",
						(percent) => {
							setUploadFiles((prev) =>
								prev.map((f) => (f.id === item.id ? { ...f, progress: percent } : f))
							);
						}
					);

					const finalTitle = title.trim() || item.file.name.replace(/\.[^/.]+$/, "");

					const input = {
						description: getString(formData, "description"),
						imageUrl,
						location: getString(formData, "location"),
						sortOrder: getString(formData, "sortOrder"),
						takenAt: getString(formData, "takenAt"),
						title: finalTitle,
						visibility,
					};

					const res = await createPhoto(input);
					if (res.ok) {
						successCount++;
						setUploadFiles((prev) =>
							prev.map((f) => (f.id === item.id ? { ...f, status: "success" } : f))
						);
					} else {
						failCount++;
						setUploadFiles((prev) =>
							prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f))
						);
					}
				} catch (error) {
					console.error("Upload failed for file:", item.file.name, error);
					failCount++;
					setUploadFiles((prev) =>
						prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f))
					);
				}
			}

			setIsPending(false);

			if (successCount > 0) {
				pushToast(
					`照片上传成功！成功上传 ${successCount} 张` +
					(failCount > 0 ? `，失败 ${failCount} 张` : ""),
					false
				);
				form.reset();
				setTimeout(() => {
					setUploadFiles((prev) => prev.filter((f) => f.status !== "success"));
				}, 1500);
				router.refresh();
			} else {
				pushToast("所有照片上传均失败。", true);
			}
		}
	};

	const submitSettings = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		await runAction(
			updateSettings({
				coupleNames: getString(formData, "coupleNames"),
				heroImageUrl: getString(formData, "heroImageUrl"),
				heroSubtitle: getString(formData, "heroSubtitle"),
				heroTitle: getString(formData, "heroTitle"),
				loveStartDate: getString(formData, "loveStartDate"),
				siteTitle: getString(formData, "siteTitle"),
			}),
			"站点设置已更新。"
		);
	};

	const submitLetter = async (event: FormEvent<HTMLFormElement>, id?: string) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const title = getString(formData, "title");
		const content = getString(formData, "content");

		if (!validate([
			{ value: title, label: "标题" },
			{ value: content, label: "正文" },
		])) return;

		const input = {
			author: getString(formData, "author"),
			content,
			title,
			visibility: getString(formData, "visibility"),
			writtenAt: getString(formData, "writtenAt"),
		};
		await runAction(
			id ? updateLetter(id, input) : createLetter(input),
			id ? "情书已更新。" : "情书已添加。",
			id ? undefined : form
		);
	};

	const submitTimeline = async (event: FormEvent<HTMLFormElement>, id?: string) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const title = getString(formData, "title");
		const eventDate = getString(formData, "eventDate");

		if (!validate([
			{ value: title, label: "标题" },
			{ value: eventDate, label: "日期" },
		])) return;

		const input = {
			description: getString(formData, "description"),
			eventDate,
			location: getString(formData, "location"),
			photoId: getString(formData, "photoId"),
			title,
			visibility: getString(formData, "visibility"),
		};
		await runAction(
			id ? updateTimelineEvent(id, input) : createTimelineEvent(input),
			id ? "时间线已更新。" : "时间线已添加。",
			id ? undefined : form
		);
	};

	const submitAnniversary = async (event: FormEvent<HTMLFormElement>, id?: string) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const title = getString(formData, "title");
		const date = getString(formData, "date");

		if (!validate([
			{ value: title, label: "标题" },
			{ value: date, label: "日期" },
		])) return;

		const input = {
			date,
			description: getString(formData, "description"),
			isPrimary: formData.get("isPrimary") === "on",
			title,
			type: getString(formData, "type") || "annual",
		};
		await runAction(
			id ? updateAnniversary(id, input) : createAnniversary(input),
			id ? "纪念日已更新。" : "纪念日已添加。",
			id ? undefined : form
		);
	};

	return (
		<>
		<ToastContainer toasts={toasts} onDismiss={dismissToast} />
		<div className="flex min-h-screen bg-muted/20">
			{/* Sidebar */}
			<aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col border-r bg-background lg:flex">
				<div className="flex flex-1 flex-col gap-1 p-4">
					<div className="mb-3 flex items-center gap-2 px-2">
						<LayoutDashboard className="size-4 text-primary" />
						<span className="text-sm font-semibold">后台编辑</span>
					</div>
					{tabs.map((tab) => (
						<button
							className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
								activeTab === tab.id
									? "bg-primary/10 text-primary"
									: "text-foreground/60 hover:bg-muted hover:text-foreground"
							}`}
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							type="button"
						>
							{tab.icon}
							{tab.label}
						</button>
					))}
				</div>

				{/* User info at sidebar bottom */}
				<div className="mt-auto border-t p-4">
					<div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
							<User className="size-4" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{displayName}</p>
							<p className="text-xs text-muted-foreground">已登录</p>
						</div>
						<button
							className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							onClick={signOut}
							title="退出登录"
							type="button"
						>
							<LogOut className="size-4" />
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex-1 min-w-0">
				{/* Mobile bottom nav bar */}
				<nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-background/95 backdrop-blur-sm lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
					{tabs.map((tab) => (
						<button
							className={`flex flex-1 flex-col items-center gap-1 px-1 py-3 text-[10px] font-medium transition-colors ${
								activeTab === tab.id
									? "text-primary"
									: "text-foreground/50 hover:text-foreground"
							}`}
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							type="button"
						>
							<span className={`flex size-6 items-center justify-center rounded-lg transition-colors ${
								activeTab === tab.id ? "bg-primary/10" : ""
							}`}>
								{tab.icon}
							</span>
							{tab.label}
						</button>
					))}
				</nav>

				<div className="px-2 py-3 pb-28 sm:px-4 lg:p-6 lg:pb-6">
					{/* Page header */}
					<div className="mb-4 flex items-center justify-between lg:mb-6">
						<h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
							{tabs.find((t) => t.id === activeTab)?.label}
						</h1>
						<div className="flex items-center gap-2">
							{isPending && (
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground lg:text-sm">
									<Loader2 className="size-3.5 animate-spin" />
									保存中…
								</div>
							)}
							{/* Mobile user + logout */}
							<div className="flex items-center gap-1.5 lg:hidden">
								<span className="max-w-[80px] truncate text-xs text-muted-foreground">{displayName}</span>
								<button
									className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									onClick={signOut}
									title="退出登录"
									type="button"
								>
									<LogOut className="size-3.5" />
								</button>
							</div>
						</div>
					</div>

					{/* Tab panels */}
					{activeTab === "photos" && (
						<PhotosTab
							isPending={isPending}
							onDelete={runAction}
							onSubmit={submitPhoto}
							photos={photos}
							files={uploadFiles}
							onFilesChange={setUploadFiles}
						/>
					)}
					{activeTab === "letters" && (
						<LettersTab
							isPending={isPending}
							letters={letters}
							onDelete={runAction}
							onSubmit={submitLetter}
						/>
					)}
					{activeTab === "timeline" && (
						<TimelineTab
							isPending={isPending}
							onDelete={runAction}
							onSubmit={submitTimeline}
							photos={photos}
							timeline={timeline}
						/>
					)}
					{activeTab === "anniversaries" && (
						<AnniversariesTab
							anniversaries={anniversaries}
							isPending={isPending}
							onDelete={runAction}
							onSubmit={submitAnniversary}
						/>
					)}
					{activeTab === "settings" && (
						<SettingsTab
							isPending={isPending}
							onSubmit={submitSettings}
							settings={settings}
						/>
					)}
				</div>
		</div>
		</div>
		</>
	);
}

// ──────────────────────────────────────────────
// Photos Tab
// ──────────────────────────────────────────────

function PhotosTab({
	isPending,
	onDelete,
	onSubmit,
	photos,
	files,
	onFilesChange,
}: {
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
	photos: MemoryPhoto[];
	files: UploadItem[];
	onFilesChange: (files: UploadItem[]) => void;
}) {
	return (
		<div className="space-y-8">
			{/* Add photo */}
			<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
				<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">添加新照片</h2>
				<form className="grid gap-4 sm:gap-5 sm:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="照片名字（选填，不填默认使用文件名）" />
					</Field>
					<Field label="可见性">
						<select className={selectClass} name="visibility">
							<option value="public">公开展示</option>
							<option value="private">私密</option>
						</select>
					</Field>
					<Field label="拍摄日期">
						<input className={inputClass} name="takenAt" type="date" />
					</Field>
					<Field label="地点">
						<input className={inputClass} name="location" placeholder="在哪里拍的？" />
					</Field>
					<div className="md:col-span-2">
						<Field label="说明">
							<textarea className={textareaClass} name="description" placeholder="这张照片背后的故事…" />
						</Field>
					</div>
					<div className="md:col-span-2">
						<ImageUpload label="选择照片" name="image" multiple files={files} onChange={onFilesChange} />
					</div>
					<div className="md:col-span-2">
						<Button disabled={isPending} type="submit">
							<Plus className="size-4" />
							添加照片
						</Button>
					</div>
				</form>
			</div>

			{/* Existing photos grouped by title */}
			{photos.length > 0 && (() => {
				const groupMap = new Map<string, MemoryPhoto[]>();
				for (const p of photos) {
					if (!groupMap.has(p.title)) groupMap.set(p.title, []);
					groupMap.get(p.title)!.push(p);
				}
				const groups = Array.from(groupMap.entries());
				return (
					<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
						<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
							已有照片（{groups.length} 个主题 · 共 {photos.length} 张）
						</h2>
						<div className="space-y-6">
							{groups.map(([title, groupPhotos]) => (
								<div key={title}>
									<p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
										<span>{title}</span>
										<span className="rounded-full bg-muted px-1.5 py-0.5 font-normal normal-case">
											{groupPhotos.length} 张
										</span>
									</p>
									<div className="space-y-2">
										{groupPhotos.map((photo) => (
											<PhotoItem
												isPending={isPending}
												key={photo.id}
												onDelete={onDelete}
												onSubmit={onSubmit}
												photo={photo}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				);
			})()}
		</div>
	);
}

function PhotoItem({
	isPending,
	onDelete,
	onSubmit,
	photo,
}: {
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
	photo: MemoryPhoto;
}) {
	const [open, setOpen] = useState(false);

	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<button
				className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/40"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				{photo.thumbnailUrl || photo.url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						alt={photo.title}
						className="size-12 shrink-0 rounded-lg object-cover"
						src={photo.thumbnailUrl ?? photo.url ?? ""}
					/>
				) : (
					<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
						<ImagePlus className="size-5 text-muted-foreground" />
					</div>
				)}
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium">{photo.title}</p>
					<p className="text-xs text-muted-foreground">
						{photo.visibility === "public" ? "公开" : "私密"}
						{photo.location ? ` · ${photo.location}` : ""}
						{photo.createdBy ? ` · ${photo.createdBy} 创建` : ""}
					</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>

			{open && (
				<form
					className="border-t p-2 sm:p-4"
					onSubmit={(e) => onSubmit(e, photo.id)}
				>
					<div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={photo.title} name="title" />
						</Field>
						<Field label="可见性">
							<select className={selectClass} defaultValue={photo.visibility} name="visibility">
								<option value="public">公开展示</option>
								<option value="private">私密</option>
							</select>
						</Field>
						<Field label="日期">
							<input
								className={inputClass}
								defaultValue={toDateInputValue(photo.takenAt)}
								name="takenAt"
								type="date"
							/>
						</Field>
						<Field label="地点">
							<input className={inputClass} defaultValue={photo.location ?? ""} name="location" />
						</Field>
						<Field label="排序权重" hint="数字越大越靠前">
							<input
								className={inputClass}
								defaultValue={photo.sortOrder}
								name="sortOrder"
								type="number"
							/>
						</Field>
						<Field label="说明">
							<textarea
								className={textareaClass}
								defaultValue={photo.description ?? ""}
								name="description"
							/>
						</Field>
						<div className="md:col-span-2">
							<ImageUpload existingUrl={photo.url} label="替换照片（不选则保留原图）" name="image" />
						</div>
						<div className="flex gap-2 md:col-span-2">
							<Button disabled={isPending} type="submit">保存</Button>
							<Button
								disabled={isPending}
								onClick={() => onDelete(deletePhoto(photo.id), "照片已删除。")}
								type="button"
								variant="destructive"
							>
								<Trash2 className="size-4" />
								删除
							</Button>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

// ──────────────────────────────────────────────
// Letters Tab
// ──────────────────────────────────────────────

function LettersTab({
	isPending,
	letters,
	onDelete,
	onSubmit,
}: {
	isPending: boolean;
	letters: MemoryLetter[];
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
}) {
	return (
		<div className="space-y-8">
			<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
				<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">写一封新情书</h2>
				<form className="grid gap-4 sm:gap-5 sm:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="信的题目" />
					</Field>
					<Field label="作者">
						<input className={inputClass} name="author" placeholder="写信的人" />
					</Field>
					<Field label="日期">
						<input className={inputClass} name="writtenAt" type="date" />
					</Field>
					<Field label="可见性">
						<select className={selectClass} defaultValue="private" name="visibility">
							<option value="public">公开展示</option>
							<option value="private">私密</option>
						</select>
					</Field>
					<div className="md:col-span-2">
						<Field label="正文">
							<textarea className={textareaClass} name="content" placeholder="把想说的话写在这里…" style={{ minHeight: 200 }} />
						</Field>
					</div>
					<div className="md:col-span-2">
						<Button disabled={isPending} type="submit">
							<Plus className="size-4" />
							添加情书
						</Button>
					</div>
				</form>
			</div>

			{letters.length > 0 && (
				<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
					<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">已有情书 ({letters.length})</h2>
					<div className="space-y-3">
						{letters.map((letter) => (
							<LetterItem
								isPending={isPending}
								key={letter.id}
								letter={letter}
								onDelete={onDelete}
								onSubmit={onSubmit}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function LetterItem({
	isPending,
	letter,
	onDelete,
	onSubmit,
}: {
	isPending: boolean;
	letter: MemoryLetter;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
}) {
	const [open, setOpen] = useState(false);
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<button
				className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/40"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<PenLine className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium">{letter.title}</p>
					<p className="text-xs text-muted-foreground">
						{letter.author ? `${letter.author} · ` : ""}
						{letter.visibility === "public" ? "公开" : "私密"}
						{letter.createdBy ? ` · ${letter.createdBy} 创建` : ""}
					</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>
			{open && (
				<form className="border-t p-2 sm:p-4" onSubmit={(e) => onSubmit(e, letter.id)}>
					<div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={letter.title} name="title" />
						</Field>
						<Field label="作者">
							<input className={inputClass} defaultValue={letter.author ?? ""} name="author" />
						</Field>
						<Field label="日期">
							<input
								className={inputClass}
								defaultValue={toDateInputValue(letter.writtenAt)}
								name="writtenAt"
								type="date"
							/>
						</Field>
						<Field label="可见性">
							<select className={selectClass} defaultValue={letter.visibility} name="visibility">
								<option value="public">公开展示</option>
								<option value="private">私密</option>
							</select>
						</Field>
						<div className="md:col-span-2">
							<Field label="正文">
								<textarea
									className={textareaClass}
									defaultValue={letter.content}
									name="content"
									style={{ minHeight: 200 }}
								/>
							</Field>
						</div>
						<div className="flex gap-2 md:col-span-2">
							<Button disabled={isPending} type="submit">保存</Button>
							<Button
								disabled={isPending}
								onClick={() => onDelete(deleteLetter(letter.id), "情书已删除。")}
								type="button"
								variant="destructive"
							>
								<Trash2 className="size-4" />
								删除
							</Button>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

// ──────────────────────────────────────────────
// Timeline Tab
// ──────────────────────────────────────────────

function TimelineTab({
	isPending,
	onDelete,
	onSubmit,
	photos,
	timeline,
}: {
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
	photos: MemoryPhoto[];
	timeline: MemoryTimelineEvent[];
}) {
	const photoOptions = photos.map((p) => (
		<option key={p.id} value={p.id}>
			{p.title}
		</option>
	));

	return (
		<div className="space-y-8">
			<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
				<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">添加新事件</h2>
				<form className="grid gap-4 sm:gap-5 sm:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="发生了什么？" />
					</Field>
					<Field label="日期">
						<input className={inputClass} name="eventDate" type="date" />
					</Field>
					<Field label="地点">
						<input className={inputClass} name="location" placeholder="在哪里？" />
					</Field>
					<Field label="关联照片">
						<select className={selectClass} name="photoId">
							<option value="">不关联</option>
							{photoOptions}
						</select>
					</Field>
					<Field label="可见性">
						<select className={selectClass} name="visibility">
							<option value="public">公开展示</option>
							<option value="private">私密</option>
						</select>
					</Field>
					<Field label="说明">
						<textarea className={textareaClass} name="description" placeholder="更多细节…" />
					</Field>
					<div className="md:col-span-2">
						<Button disabled={isPending} type="submit">
							<Plus className="size-4" />
							添加事件
						</Button>
					</div>
				</form>
			</div>

			{timeline.length > 0 && (
				<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
					<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">已有事件 ({timeline.length})</h2>
					<div className="space-y-3">
						{timeline.map((event) => (
							<TimelineItem
								event={event}
								isPending={isPending}
								key={event.id}
								onDelete={onDelete}
								onSubmit={onSubmit}
								photoOptions={photoOptions}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function TimelineItem({
	event,
	isPending,
	onDelete,
	onSubmit,
	photoOptions,
}: {
	event: MemoryTimelineEvent;
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
	photoOptions: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<button
				className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/40"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Clock className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium">{event.title}</p>
					<p className="text-xs text-muted-foreground">
						{toDateInputValue(event.eventDate)}
						{event.location ? ` · ${event.location}` : ""}
						{event.createdBy ? ` · ${event.createdBy} 创建` : ""}
					</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>
			{open && (
				<form className="border-t p-2 sm:p-4" onSubmit={(e) => onSubmit(e, event.id)}>
					<div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={event.title} name="title" />
						</Field>
						<Field label="日期">
							<input
								className={inputClass}
								defaultValue={toDateInputValue(event.eventDate)}
								name="eventDate"
								type="date"
							/>
						</Field>
						<Field label="地点">
							<input className={inputClass} defaultValue={event.location ?? ""} name="location" />
						</Field>
						<Field label="关联照片">
							<select className={selectClass} defaultValue={event.photoId ?? ""} name="photoId">
								<option value="">不关联</option>
								{photoOptions}
							</select>
						</Field>
						<Field label="可见性">
							<select className={selectClass} defaultValue={event.visibility} name="visibility">
								<option value="public">公开展示</option>
								<option value="private">私密</option>
							</select>
						</Field>
						<Field label="说明">
							<textarea
								className={textareaClass}
								defaultValue={event.description ?? ""}
								name="description"
							/>
						</Field>
						<div className="flex gap-2 md:col-span-2">
							<Button disabled={isPending} type="submit">保存</Button>
							<Button
								disabled={isPending}
								onClick={() => onDelete(deleteTimelineEvent(event.id), "时间线事件已删除。")}
								type="button"
								variant="destructive"
							>
								<Trash2 className="size-4" />
								删除
							</Button>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

// ──────────────────────────────────────────────
// Anniversaries Tab
// ──────────────────────────────────────────────

function AnniversariesTab({
	anniversaries,
	isPending,
	onDelete,
	onSubmit,
}: {
	anniversaries: MemoryAnniversary[];
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
}) {
	return (
		<div className="space-y-8">
			<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
				<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">添加纪念日</h2>
				<form className="grid gap-4 sm:gap-5 sm:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="叫什么名字？" />
					</Field>
					<Field label="日期">
						<input className={inputClass} name="date" type="date" />
					</Field>
					<Field label="类型">
						<select className={selectClass} name="type">
							<option value="annual">每年重复</option>
							<option value="once">一次性日期</option>
						</select>
					</Field>
					<label className="flex items-center gap-2 pt-7 text-sm font-medium">
						<input className="size-4 accent-primary" name="isPrimary" type="checkbox" />
						设为主要纪念日
					</label>
					<div className="md:col-span-2">
						<Field label="说明">
							<textarea className={textareaClass} name="description" placeholder="这个日子的故事…" />
						</Field>
					</div>
					<div className="md:col-span-2">
						<Button disabled={isPending} type="submit">
							<Plus className="size-4" />
							添加纪念日
						</Button>
					</div>
				</form>
			</div>

			{anniversaries.length > 0 && (
				<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
					<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">已有纪念日 ({anniversaries.length})</h2>
					<div className="space-y-3">
						{anniversaries.map((item) => (
							<AnniversaryItem
								isPending={isPending}
								item={item}
								key={item.id}
								onDelete={onDelete}
								onSubmit={onSubmit}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function AnniversaryItem({
	isPending,
	item,
	onDelete,
	onSubmit,
}: {
	isPending: boolean;
	item: MemoryAnniversary;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
}) {
	const [open, setOpen] = useState(false);
	return (
		<div className="overflow-hidden rounded-lg border bg-background">
			<button
				className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/40"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<CalendarHeart className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium">
						{item.title}
						{item.isPrimary && (
							<span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">主要</span>
						)}
					</p>
					<p className="text-xs text-muted-foreground">
						{item.date}
						{item.createdBy ? ` · ${item.createdBy} 创建` : ""}
					</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>
			{open && (
				<form className="border-t p-2 sm:p-4" onSubmit={(e) => onSubmit(e, item.id)}>
					<div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={item.title} name="title" />
						</Field>
						<Field label="日期">
							<input className={inputClass} defaultValue={item.date} name="date" type="date" />
						</Field>
						<Field label="类型">
							<select className={selectClass} defaultValue={item.type} name="type">
								<option value="annual">每年重复</option>
								<option value="once">一次性日期</option>
							</select>
						</Field>
						<label className="flex items-center gap-2 pt-7 text-sm font-medium">
							<input
								className="size-4 accent-primary"
								defaultChecked={item.isPrimary}
								name="isPrimary"
								type="checkbox"
							/>
							主要纪念日
						</label>
						<div className="md:col-span-2">
							<Field label="说明">
								<textarea
									className={textareaClass}
									defaultValue={item.description ?? ""}
									name="description"
								/>
							</Field>
						</div>
						<div className="flex gap-2 md:col-span-2">
							<Button disabled={isPending} type="submit">保存</Button>
							<Button
								disabled={isPending}
								onClick={() => onDelete(deleteAnniversary(item.id), "纪念日已删除。")}
								type="button"
								variant="destructive"
							>
								<Trash2 className="size-4" />
								删除
							</Button>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

// ──────────────────────────────────────────────
// Settings Tab
// ──────────────────────────────────────────────

function SettingsTab({
	isPending,
	onSubmit,
	settings,
}: {
	isPending: boolean;
	onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	settings: SiteSettings;
}) {
	return (
		<div className="rounded-xl border bg-card p-3 shadow-sm sm:p-5">
			<h2 className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">站点基本信息</h2>
			<form className="grid gap-4 sm:gap-5 sm:grid-cols-2" onSubmit={onSubmit}>
				<Field label="站点标题">
					<input className={inputClass} defaultValue={settings.siteTitle} name="siteTitle" />
				</Field>
				<Field label="两个人的名字">
					<input className={inputClass} defaultValue={settings.coupleNames} name="coupleNames" />
				</Field>
				<Field label="Hero 主标题">
					<input className={inputClass} defaultValue={settings.heroTitle} name="heroTitle" />
				</Field>
				<Field label="恋爱开始日期">
					<input
						className={inputClass}
						defaultValue={settings.loveStartDate}
						name="loveStartDate"
						type="date"
					/>
				</Field>
				<div className="md:col-span-2">
					<Field label="Hero 副标题">
						<textarea
							className={textareaClass}
							defaultValue={settings.heroSubtitle}
							name="heroSubtitle"
						/>
					</Field>
				</div>
				<div className="md:col-span-2">
					<Field label="Hero 图片 URL" hint="填入图片完整地址，或使用照片上传后得到的链接">
						<input
							className={inputClass}
							defaultValue={settings.heroImageUrl ?? ""}
							name="heroImageUrl"
							placeholder="https://..."
						/>
					</Field>
				</div>
				<div className="md:col-span-2">
					<Button disabled={isPending} type="submit">
						<Check className="size-4" />
						保存设置
					</Button>
				</div>
			</form>
		</div>
	);
}
