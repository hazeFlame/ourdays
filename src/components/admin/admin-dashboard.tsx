"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
	CalendarHeart,
	Check,
	ImagePlus,
	LayoutDashboard,
	Loader2,
	PenLine,
	Plus,
	Settings,
	Trash2,
	X,
	Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
}: {
	name: string;
	label: string;
	existingUrl?: string | null;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
	const [isCompressing, setIsCompressing] = useState(false);
	const compressedFileRef = useRef<File | null>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Show raw preview immediately
		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);

		// Compress in background
		setIsCompressing(true);
		try {
			const compressed = await compressAndConvertToWebp(file, 0.8, 1200);
			compressedFileRef.current = compressed;
		} catch {
			compressedFileRef.current = file;
		} finally {
			setIsCompressing(false);
		}
	};

	const clearPreview = () => {
		setPreview(null);
		compressedFileRef.current = null;
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div className="space-y-2">
			<span className="text-sm font-medium text-foreground">{label}</span>
			{/* Hidden actual input that the form reads */}
			<input
				ref={inputRef}
				accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
				className="hidden"
				name={name}
				onChange={handleFileChange}
				type="file"
			/>
			{preview ? (
				<div className="relative overflow-hidden rounded-xl border bg-muted">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						alt="预览"
						className="max-h-56 w-full object-cover"
						src={preview}
					/>
					{isCompressing ? (
						<div className="absolute inset-0 flex items-center justify-center bg-black/40">
							<Loader2 className="size-6 animate-spin text-white" />
							<span className="ml-2 text-sm text-white">压缩中...</span>
						</div>
					) : null}
					<button
						className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
						onClick={clearPreview}
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
			{!preview && (
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

// Toast / message banner
function StatusBanner({ message, isError }: { message: string; isError?: boolean }) {
	return (
		<div
			className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
				isError
					? "bg-destructive/10 text-destructive"
					: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
			}`}
		>
			{isError ? <X className="size-4 shrink-0" /> : <Check className="size-4 shrink-0" />}
			{message}
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
	const [activeTab, setActiveTab] = useState<Tab>("photos");
	const [message, setMessage] = useState<string | null>(null);
	const [isError, setIsError] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const runAction = async (
		action: Promise<ActionResult>,
		successMessage: string,
		form?: HTMLFormElement
	) => {
		setIsPending(true);
		setMessage(null);
		const result = await action;
		setIsPending(false);

		if (result.error) {
			setIsError(true);
			setMessage(result.error);
			return;
		}

		form?.reset();
		setIsError(false);
		setMessage(successMessage);
		router.refresh();

		// Auto-clear after 4s
		setTimeout(() => setMessage(null), 4000);
	};

	const uploadFile = async (file: File, kind: "photo" | "private") => {
		let fileToUpload = file;
		try {
			fileToUpload = await compressAndConvertToWebp(file, 0.8, 1200);
		} catch {
			// fallback to original
		}

		const body = new FormData();
		body.set("file", fileToUpload);
		body.set("kind", kind);

		const response = await fetch("/api/uploads", { body, method: "POST" });
		const payload = (await response.json()) as { error?: string; url?: string };

		if (!response.ok) throw new Error(payload.error || "图片上传失败。");
		if (!payload.url) throw new Error("上传结果缺少图片地址。");
		return payload.url;
	};

	const submitPhoto = async (event: FormEvent<HTMLFormElement>, id?: string) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const visibility = getString(formData, "visibility") || "public";
		const file = getFile(formData, "image");
		let imageUrl = "";

		try {
			if (file) {
				imageUrl = await uploadFile(file, visibility === "private" ? "private" : "photo");
			}
		} catch (error) {
			setIsError(true);
			setMessage(error instanceof Error ? error.message : "图片上传失败。");
			return;
		}

		const input = {
			description: getString(formData, "description"),
			imageUrl,
			location: getString(formData, "location"),
			sortOrder: getString(formData, "sortOrder"),
			takenAt: getString(formData, "takenAt"),
			title: getString(formData, "title"),
			visibility,
		};

		await runAction(
			id ? updatePhoto(id, input) : createPhoto(input),
			id ? "照片已更新。" : "照片已添加。",
			id ? undefined : form
		);
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
		const input = {
			author: getString(formData, "author"),
			content: getString(formData, "content"),
			title: getString(formData, "title"),
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
		const input = {
			description: getString(formData, "description"),
			eventDate: getString(formData, "eventDate"),
			location: getString(formData, "location"),
			photoId: getString(formData, "photoId"),
			title: getString(formData, "title"),
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
		const input = {
			date: getString(formData, "date"),
			description: getString(formData, "description"),
			isPrimary: formData.get("isPrimary") === "on",
			title: getString(formData, "title"),
			type: getString(formData, "type") || "annual",
		};
		await runAction(
			id ? updateAnniversary(id, input) : createAnniversary(input),
			id ? "纪念日已更新。" : "纪念日已添加。",
			id ? undefined : form
		);
	};

	return (
		<div className="flex min-h-screen bg-muted/20">
			{/* Sidebar */}
			<aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col border-r bg-background lg:flex">
				<div className="flex flex-col gap-1 p-4">
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
			</aside>

			{/* Main content */}
			<div className="flex-1 min-w-0">
				{/* Mobile tab bar */}
				<div className="flex gap-1 overflow-x-auto border-b bg-background px-4 py-2 lg:hidden">
					{tabs.map((tab) => (
						<button
							className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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

				<div className="p-6">
					{/* Page header */}
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">
								{tabs.find((t) => t.id === activeTab)?.label}
							</h1>
							<p className="mt-1 text-sm text-muted-foreground">
								{activeTab === "photos" && "上传和管理所有照片"}
								{activeTab === "letters" && "编写情书和留言"}
								{activeTab === "timeline" && "记录重要时刻"}
								{activeTab === "anniversaries" && "维护纪念日列表"}
								{activeTab === "settings" && "修改站点基本信息"}
							</p>
						</div>
						{isPending && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="size-4 animate-spin" />
								保存中…
							</div>
						)}
					</div>

					{/* Status message */}
					{message ? (
						<div className="mb-6">
							<StatusBanner isError={isError} message={message} />
						</div>
					) : null}

					{/* Tab panels */}
					{activeTab === "photos" && (
						<PhotosTab
							isPending={isPending}
							onDelete={runAction}
							onSubmit={submitPhoto}
							photos={photos}
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
}: {
	isPending: boolean;
	onDelete: (action: Promise<ActionResult>, message: string) => Promise<void>;
	onSubmit: (event: FormEvent<HTMLFormElement>, id?: string) => Promise<void>;
	photos: MemoryPhoto[];
}) {
	return (
		<div className="space-y-8">
			{/* Add photo */}
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<h2 className="mb-5 text-base font-semibold">添加新照片</h2>
				<form className="grid gap-5 md:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="给这张照片起个名字" required />
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
						<ImageUpload label="选择照片" name="image" />
					</div>
					<div className="md:col-span-2">
						<Button disabled={isPending} type="submit">
							<Plus className="size-4" />
							添加照片
						</Button>
					</div>
				</form>
			</div>

			{/* Existing photos */}
			{photos.length > 0 && (
				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<h2 className="mb-5 text-base font-semibold">已有照片 ({photos.length})</h2>
					<div className="space-y-3">
						{photos.map((photo) => (
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
			)}
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
					</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>

			{open && (
				<form
					className="border-t p-4"
					onSubmit={(e) => onSubmit(e, photo.id)}
				>
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={photo.title} name="title" required />
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
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<h2 className="mb-5 text-base font-semibold">写一封新情书</h2>
				<form className="grid gap-5 md:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="信的题目" required />
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
							<textarea className={textareaClass} name="content" placeholder="把想说的话写在这里…" required style={{ minHeight: 200 }} />
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
				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<h2 className="mb-5 text-base font-semibold">已有情书 ({letters.length})</h2>
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
					</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>
			{open && (
				<form className="border-t p-4" onSubmit={(e) => onSubmit(e, letter.id)}>
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={letter.title} name="title" required />
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
									required
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
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<h2 className="mb-5 text-base font-semibold">添加新事件</h2>
				<form className="grid gap-5 md:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="发生了什么？" required />
					</Field>
					<Field label="日期">
						<input className={inputClass} name="eventDate" required type="date" />
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
				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<h2 className="mb-5 text-base font-semibold">已有事件 ({timeline.length})</h2>
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
					</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>
			{open && (
				<form className="border-t p-4" onSubmit={(e) => onSubmit(e, event.id)}>
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={event.title} name="title" required />
						</Field>
						<Field label="日期">
							<input
								className={inputClass}
								defaultValue={toDateInputValue(event.eventDate)}
								name="eventDate"
								required
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
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<h2 className="mb-5 text-base font-semibold">添加纪念日</h2>
				<form className="grid gap-5 md:grid-cols-2" onSubmit={(e) => onSubmit(e)}>
					<Field label="标题">
						<input className={inputClass} name="title" placeholder="叫什么名字？" required />
					</Field>
					<Field label="日期">
						<input className={inputClass} name="date" required type="date" />
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
				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<h2 className="mb-5 text-base font-semibold">已有纪念日 ({anniversaries.length})</h2>
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
					<p className="text-xs text-muted-foreground">{item.date}</p>
				</div>
				<span className="text-xs text-muted-foreground">{open ? "收起" : "展开"}</span>
			</button>
			{open && (
				<form className="border-t p-4" onSubmit={(e) => onSubmit(e, item.id)}>
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="标题">
							<input className={inputClass} defaultValue={item.title} name="title" required />
						</Field>
						<Field label="日期">
							<input className={inputClass} defaultValue={item.date} name="date" required type="date" />
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
		<div className="rounded-xl border bg-card p-6 shadow-sm">
			<h2 className="mb-5 text-base font-semibold">站点基本信息</h2>
			<form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
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
